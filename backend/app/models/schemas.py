"""
AuraKinematics – Pydantic v2 Data Models
=========================================
Strict-mode schemas used throughout the application for request / response
serialisation, inter-module contracts, and OpenAPI documentation.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------------------------
# Landmark / Joint primitives
# ---------------------------------------------------------------------------

class JointCoordinate(BaseModel):
    """3-D coordinate of a single body landmark."""

    model_config = ConfigDict(strict=True)

    x: float
    y: float
    z: float
    visibility: float


class JointAngles(BaseModel):
    """Computed angle at a specific joint with optimality bounds."""

    model_config = ConfigDict(strict=True)

    joint_name: str
    angle_degrees: float
    is_optimal: bool
    threshold_min: float
    threshold_max: float


# ---------------------------------------------------------------------------
# Per-frame kinematics
# ---------------------------------------------------------------------------

class FrameKinematics(BaseModel):
    """Full kinematic snapshot for a single video frame."""

    model_config = ConfigDict(strict=True)

    frame_index: int
    timestamp_seconds: float
    landmarks: dict[str, JointCoordinate]
    joint_angles: list[JointAngles]
    angular_velocities: dict[str, float] | None = None


# ---------------------------------------------------------------------------
# Video metadata
# ---------------------------------------------------------------------------

class VideoMetadata(BaseModel):
    """Technical metadata extracted from the uploaded video file."""

    model_config = ConfigDict(strict=True)

    filename: str
    total_frames: int
    fps: float
    duration_seconds: float
    width: int
    height: int


# ---------------------------------------------------------------------------
# Events & coaching
# ---------------------------------------------------------------------------

class CriticalEvent(BaseModel):
    """A notable biomechanical event detected during analysis."""

    model_config = ConfigDict(strict=True)

    event_type: str
    frame_index: int
    timestamp_seconds: float
    description: str


class CoachingInsight(BaseModel):
    """A single coaching recommendation tied to a specific frame."""

    model_config = ConfigDict(strict=True)

    category: str
    severity: Literal["info", "warning", "critical"]
    message: str
    frame_index: int
    timestamp_seconds: float
    angle_actual: float | None = None
    angle_ideal: float | None = None


# ---------------------------------------------------------------------------
# API response / request envelopes
# ---------------------------------------------------------------------------

class AnalysisResponse(BaseModel):
    """Top-level response returned by the ``/api/v1/analyze`` endpoint."""

    model_config = ConfigDict(strict=True)

    video_metadata: VideoMetadata
    sport_type: str
    kinematic_timeline: list[FrameKinematics]
    critical_events: list[CriticalEvent]
    coaching_insights: list[CoachingInsight]
    overall_score: float
    impact_timestamp: float | None = None
    gemini_summary: str | None = None


class AnalysisRequest(BaseModel):
    """Body schema for analysis requests (used for validation)."""

    model_config = ConfigDict(strict=True)

    sport_type: Literal[
        "cricket_batting",
        "cricket_bowling",
        "badminton_smash",
        "badminton_drop",
    ]
