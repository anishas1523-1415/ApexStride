import os
import logging
from celery import shared_task
from app.worker import celery_app
from app.database import SyncSessionLocal
from app.models.db_models import AnalysisRecord
import uuid
import gc

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, name="analyze_video_task")
def analyze_video_task(self, video_path: str, sport_type: str, user_id: str) -> dict:
    try:
        self.update_state(state='PROGRESS', meta={'status': 'Analyzing video...'})
        # Import here to avoid circular imports between tasks and routes.analysis
        from app.routes.analysis import _run_pipeline
        response = _run_pipeline(video_path, sport_type)
        
        # Save to database using synchronous engine context manager
        with SyncSessionLocal() as db:
            record = AnalysisRecord(
                user_id=uuid.UUID(user_id),
                sport_type=sport_type,
                overall_score=response.overall_score,
                filename=os.path.basename(video_path),
                impact_timestamp=response.impact_timestamp,
                video_metadata=response.video_metadata.model_dump(),
                critical_events=[e.model_dump() for e in response.critical_events],
                coaching_insights=[i.model_dump() for i in response.coaching_insights],
                kinematic_timeline=[f.model_dump() for f in response.kinematic_timeline]
            )
            db.add(record)
            db.commit()

        return response.model_dump()
    except Exception as e:
        logger.exception("Task failed.")
        raise
    finally:
        if video_path and os.path.exists(video_path):
            try:
                os.unlink(video_path)
            except OSError:
                pass
        
        # Explicit memory cleanup
        try:
            del response
        except NameError:
            pass
        gc.collect()
