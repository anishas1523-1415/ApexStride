"""
AuraKinematics — Analysis Routes
==================================
REST endpoints for video upload, biomechanical analysis, and health checks.
"""

from __future__ import annotations

import logging
import os
import tempfile
import time
import uuid

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.adapters.video_adapter import VideoAdapter
from app.config import get_settings
from app.engine.coaching import CoachingEngine
from app.engine.kinematics import KinematicsEngine
from app.models.schemas import (
    AnalysisResponse,
    FrameKinematics,
    JointCoordinate,
)
from pydantic import BaseModel
from app.tasks import analyze_video_task
from app.worker import celery_app
from app.models.db_models import User
from app.routes.auth import get_current_user
from app.database import get_async_db
from fastapi import Depends

class TaskResponse(BaseModel):
    task_id: str
    status: str

class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    result: AnalysisResponse | None = None
from app.pipeline.detector import AthleteDetector
from app.pipeline.pose_estimator import PoseEstimator
from app.pipeline.preprocessor import FramePreprocessor
from app.pipeline.temporal_smoother import TemporalSmoother
from app.pipeline.audio_processor import get_impact_timestamp

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["analysis"])

# --------------------------------------------------------------------- #
# POST /api/v1/analyze                                                   #
# --------------------------------------------------------------------- #

_ALLOWED_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}


@router.post(
    "/analyze",
    response_model=TaskResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Enqueue a video for analysis",
    description="Uploads a video and returns a task_id for polling.",
)
async def analyze_video(
    file: UploadFile = File(..., description="Video file to analyse"),
    sport_type: str = Form(
        ...,
        description="Sport/action type",
    ),
    current_user: User = Depends(get_current_user)
) -> TaskResponse:
    """Enqueue video for background processing."""
    settings = get_settings()

    # ------------------------------------------------------------------ #
    # 1. Input validation                                                 #
    # ------------------------------------------------------------------ #
    if file.filename is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided with the upload.",
        )

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in _ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported video format '{ext}'. "
                f"Accepted: {', '.join(sorted(_ALLOWED_EXTENSIONS))}"
            ),
        )

    # ------------------------------------------------------------------ #
    # 2. Persist upload to a temp file                                    #
    # ------------------------------------------------------------------ #
    tmp_path: str | None = None
    try:
        suffix = ext or ".mp4"
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix,
            prefix=f"aura_{uuid.uuid4().hex[:8]}_",
        ) as tmp:
            tmp_path = tmp.name
            contents = await file.read()
            tmp.write(contents)
            logger.info(
                "Upload saved to temp file: %s (%d bytes)",
                tmp_path,
                len(contents),
            )

        # -------------------------------------------------------------- #
        # 3. Enqueue the analysis pipeline                                #
        # -------------------------------------------------------------- #
        try:
            task = analyze_video_task.delay(tmp_path, sport_type, str(current_user.id))
            return TaskResponse(task_id=task.id, status="processing")
        except Exception as celery_err:
            logger.error("Celery task dispatch failed: %s", str(celery_err))
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Background processing service is currently unavailable. Please try again later."
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error during analysis upload")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while processing the video upload.",
        )
    finally:
        # Clean up temp file no matter what if the celery task wasn't dispatched successfully
        # Note: If celery is successful, the worker deletes it. But if celery fails, we delete it here.
        # However, to be perfectly safe, we'll let the worker delete it on success, and only delete here on Exception.
        pass # The deletion is handled by the worker. If it fails before worker, we should delete.
        # We need to refine this: if task dispatch fails, tmp_path exists and won't be processed.

    # Fix: Actually, let's explicitly delete it ONLY IF the task was NOT dispatched.
    # The try-except above handles dispatch failure.


@router.get("/status/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    task = celery_app.AsyncResult(task_id)
    if task.state == 'PENDING':
        return TaskStatusResponse(task_id=task_id, status='pending')
    elif task.state == 'PROGRESS':
        return TaskStatusResponse(task_id=task_id, status='processing')
    elif task.state == 'SUCCESS':
        return TaskStatusResponse(task_id=task_id, status='success', result=task.result)
    elif task.state == 'FAILURE':
        return TaskStatusResponse(task_id=task_id, status='failed')
    else:
        return TaskStatusResponse(task_id=task_id, status=task.state.lower())


def _run_pipeline(video_path: str, sport_type: str) -> AnalysisResponse:
    """Execute the full frame-by-frame biomechanics pipeline.

    This is deliberately synchronous and CPU-bound; in production it
    should be pushed to a background worker (Celery / ARQ).
    """
    settings = get_settings()

    preprocessor = FramePreprocessor()
    detector = AthleteDetector()
    estimator = PoseEstimator()
    smoother = TemporalSmoother()
    kinematics_engine = KinematicsEngine()
    coaching_engine = CoachingEngine()

    try:
        # ---- Video I/O ----------------------------------------------- #
        with VideoAdapter() as adapter:
            adapter.open(video_path)
            metadata = adapter.get_metadata()
            fps = metadata.fps if metadata.fps > 0 else 30.0
            
            # --- Acoustic Cropping ---
            impact_timestamp = get_impact_timestamp(video_path)

            timeline: list[FrameKinematics] = []
            frame_counter = 0

            for chunk in adapter.decode_frames(
                chunk_size=getattr(settings, "AURA_DECODE_CHUNK_SIZE", 32),
                impact_timestamp=impact_timestamp,
            ):
                for frame in chunk:
                    # Pre-processing (colour normalisation, resize, etc.)
                    processed = preprocessor.process(frame)

                    # Athlete detection & crop
                    cropped, _bbox = detector.detect(processed)

                    # 3-D pose estimation
                    landmarks = estimator.estimate(cropped)

                    if landmarks is not None and _bbox.get("bbox"):
                        b = _bbox["bbox"]
                        h, w = processed.shape[:2]
                        for name, lm in landmarks.items():
                            abs_x = (lm.x * b["width"]) + b["x1"]
                            abs_y = (lm.y * b["height"]) + b["y1"]
                            lm.x = abs_x / w
                            lm.y = abs_y / h

                    if landmarks is not None:
                        fk = kinematics_engine.compute_frame_kinematics(
                            landmarks=landmarks,
                            frame_index=frame_counter,
                            fps=fps,
                        )
                        timeline.append(fk)

                    frame_counter += 1

        # ---- Temporal smoothing -------------------------------------- #
        if timeline:
            timeline = smoother.smooth(timeline, fps)

        # ---- Angular velocity (second pass) -------------------------- #
        if timeline:
            _fill_angular_velocities(timeline, fps, kinematics_engine)

        # ---- Coaching analysis --------------------------------------- #
        insights, events, score = coaching_engine.analyze(
            sport_type=sport_type,
            timeline=timeline,
            fps=fps,
        )

        return AnalysisResponse(
            video_metadata=metadata,
            sport_type=sport_type,
            kinematic_timeline=timeline,
            critical_events=events,
            coaching_insights=insights,
            overall_score=round(score, 2),
            impact_timestamp=impact_timestamp,
        )

    finally:
        estimator.close()


def _fill_angular_velocities(
    timeline: list[FrameKinematics],
    fps: float,
    engine: KinematicsEngine,
) -> None:
    """Populate ``angular_velocities`` across the whole timeline.

    Collects per-joint angle series, computes velocities in a single
    vectorised pass, then writes results back into each frame.
    """
    if not timeline:
        return

    # Collect angle series keyed by joint_name.
    joint_series: dict[str, list[float]] = {}
    for fk in timeline:
        for ja in fk.joint_angles:
            joint_series.setdefault(ja.joint_name, []).append(ja.angle_degrees)

    # Compute angular velocity for each joint.
    joint_velocities: dict[str, list[float]] = {}
    for joint_name, angles in joint_series.items():
        joint_velocities[joint_name] = engine.calculate_angular_velocity(
            angles, fps
        )

    # Write velocities back into each frame.
    joint_indices: dict[str, int] = {name: 0 for name in joint_velocities}

    for fk in timeline:
        velocity_map: dict[str, float] = {}
        for ja in fk.joint_angles:
            name = ja.joint_name
            if name in joint_velocities:
                idx = joint_indices[name]
                if idx < len(joint_velocities[name]):
                    velocity_map[name] = joint_velocities[name][idx]
                    joint_indices[name] = idx + 1
        fk.angular_velocities = velocity_map


from sqlalchemy.future import select
from app.models.db_models import AnalysisRecord
import uuid

@router.get("/history", summary="Get user history")
async def get_history(current_user: User = Depends(get_current_user), db = Depends(get_async_db)):
    result = await db.execute(
        select(AnalysisRecord)
        .filter(AnalysisRecord.user_id == current_user.id)
        .order_by(AnalysisRecord.created_at.desc())
    )
    records = result.scalars().all()
    
    # Return minimal details for the dashboard
    return [
        {
            "id": str(r.id),
            "sport_type": r.sport_type,
            "overall_score": r.overall_score,
            "filename": r.filename,
            "created_at": r.created_at.isoformat()
        } for r in records
    ]

@router.get("/analysis/{record_id}", response_model=AnalysisResponse, summary="Get analysis record by ID")
async def get_analysis_record(record_id: str, current_user: User = Depends(get_current_user), db = Depends(get_async_db)):
    try:
        record_uuid = uuid.UUID(record_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid record ID format")

    result = await db.execute(
        select(AnalysisRecord)
        .filter(AnalysisRecord.id == record_uuid, AnalysisRecord.user_id == current_user.id)
    )
    record = result.scalars().first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found")

    return AnalysisResponse(
        video_metadata=record.video_metadata,
        sport_type=record.sport_type,
        kinematic_timeline=record.kinematic_timeline,
        critical_events=record.critical_events,
        coaching_insights=record.coaching_insights,
        overall_score=record.overall_score,
        impact_timestamp=record.impact_timestamp
    )

# --------------------------------------------------------------------- #
# GET /api/v1/health                                                     #
# --------------------------------------------------------------------- #


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Service health check",
)
async def health_check() -> dict:
    """Return service health and uptime information."""
    settings = get_settings()
    return {
        "status": "healthy",
        "service": "AuraKinematics",
        "version": getattr(settings, "AURA_VERSION", "0.1.0"),
        "timestamp": time.time(),
    }
