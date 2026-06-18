"""
AuraKinematics – Application Configuration

Centralised settings powered by pydantic-settings.  Every field can be
overridden at runtime via an environment variable prefixed with ``AURA_``
(e.g. ``AURA_YOLO_CONFIDENCE_THRESHOLD=0.7``).
"""

from __future__ import annotations

from functools import lru_cache
from typing import Tuple

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Global application settings loaded from environment / .env files."""

    # ── General ───────────────────────────────────────────────────────────
    APP_NAME: str = "AuraKinematics"
    API_VERSION: str = "v1"
    USE_OPENCV_FALLBACK: bool = False
    
    # ── Cloud Deploy ──────────────────────────────────────────────────────
    DATABASE_URL: str | None = None
    REDIS_URL: str | None = None

    # ── YOLO Pose ─────────────────────────────────────────────────────────
    YOLO_CONFIDENCE_THRESHOLD: float = 0.5
    YOLO_MODEL_NAME: str = "yolov8n-pose.pt"

    # ── MediaPipe ─────────────────────────────────────────────────────────
    MEDIAPIPE_MIN_DETECTION_CONFIDENCE: float = 0.5
    MEDIAPIPE_MIN_TRACKING_CONFIDENCE: float = 0.5

    # ── Pre-processing (CLAHE) ────────────────────────────────────────────
    CLAHE_CLIP_LIMIT: float = 2.0
    CLAHE_TILE_GRID_SIZE: Tuple[int, int] = (8, 8)

    # ── Smoothing (Savitzky-Golay) ────────────────────────────────────────
    SAVGOL_WINDOW_LENGTH: int = 7
    SAVGOL_POLYORDER: int = 3

    # ── Video / Upload ────────────────────────────────────────────────────
    CHUNK_SIZE: int = 64
    MAX_VIDEO_SIZE_MB: int = 500
    UPLOAD_DIR: str = "uploads"

    model_config = {
        "env_prefix": "AURA_",
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache
def get_settings() -> Settings:
    """Return a cached :class:`Settings` singleton."""
    return Settings()
