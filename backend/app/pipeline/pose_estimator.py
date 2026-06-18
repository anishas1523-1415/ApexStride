"""
Pose Estimator Module — AuraKinematics (YOLOv8 Fallback)
=========================================================
Uses YOLOv8-Pose to extract 17 keypoints, mapping them to the 33 3D body
landmarks expected by the kinematics engine to bypass MediaPipe broken 
versions on Python 3.14.
"""

from __future__ import annotations

import logging
from typing import Dict, Optional

import numpy as np
from ultralytics import YOLO

from app.config import get_settings
from app.models.schemas import JointCoordinate

logger = logging.getLogger(__name__)

# Map YOLOv8 COCO 17 keypoints to MediaPipe names
_YOLO_TO_MP_MAP = {
    0: "NOSE",
    1: "LEFT_EYE",
    2: "RIGHT_EYE",
    3: "LEFT_EAR",
    4: "RIGHT_EAR",
    5: "LEFT_SHOULDER",
    6: "RIGHT_SHOULDER",
    7: "LEFT_ELBOW",
    8: "RIGHT_ELBOW",
    9: "LEFT_WRIST",
    10: "RIGHT_WRIST",
    11: "LEFT_HIP",
    12: "RIGHT_HIP",
    13: "LEFT_KNEE",
    14: "RIGHT_KNEE",
    15: "LEFT_ANKLE",
    16: "RIGHT_ANKLE",
}

# The remaining MediaPipe joints will be approximated using the nearest YOLO joint.
_MP_APPROXIMATIONS = {
    "LEFT_EYE_INNER": "LEFT_EYE",
    "LEFT_EYE_OUTER": "LEFT_EYE",
    "RIGHT_EYE_INNER": "RIGHT_EYE",
    "RIGHT_EYE_OUTER": "RIGHT_EYE",
    "MOUTH_LEFT": "NOSE",
    "MOUTH_RIGHT": "NOSE",
    "LEFT_PINKY": "LEFT_WRIST",
    "RIGHT_PINKY": "RIGHT_WRIST",
    "LEFT_INDEX": "LEFT_WRIST",
    "RIGHT_INDEX": "RIGHT_WRIST",
    "LEFT_THUMB": "LEFT_WRIST",
    "RIGHT_THUMB": "RIGHT_WRIST",
    "LEFT_HEEL": "LEFT_ANKLE",
    "RIGHT_HEEL": "RIGHT_ANKLE",
    "LEFT_FOOT_INDEX": "LEFT_ANKLE",
    "RIGHT_FOOT_INDEX": "RIGHT_ANKLE",
}

class PoseEstimator:
    """YOLOv8-Pose estimator acting as a drop-in replacement for MediaPipe."""

    def __init__(self) -> None:
        settings = get_settings()
        self._model = YOLO(settings.YOLO_MODEL_NAME)
        logger.info("PoseEstimator (YOLOv8 fallback) initialised.")

    def estimate(
        self, frame: np.ndarray
    ) -> Optional[Dict[str, JointCoordinate]]:
        results = self._model(frame, verbose=False)
        
        if not results or not results[0].keypoints or results[0].keypoints.data.shape[1] == 0:
            return None
            
        # Get keypoints for the first detected person (shape: [1, 17, 3])
        # Data format: [x, y, confidence] (in pixels)
        kpts = results[0].keypoints.data[0].cpu().numpy()
        
        h, w = frame.shape[:2]
        joints: Dict[str, JointCoordinate] = {}
        
        # 1. Map direct YOLO joints
        for yolo_idx, mp_name in _YOLO_TO_MP_MAP.items():
            if yolo_idx < len(kpts):
                x, y, conf = kpts[yolo_idx]
                joints[mp_name] = JointCoordinate(
                    x=float(x / w) if w > 0 else 0.0,
                    y=float(y / h) if h > 0 else 0.0,
                    z=0.0,  # YOLOv8-pose is 2D
                    visibility=float(conf)
                )
                
        # 2. Approximate missing MediaPipe joints
        for missing_joint, source_joint in _MP_APPROXIMATIONS.items():
            if source_joint in joints:
                joints[missing_joint] = JointCoordinate(
                    x=joints[source_joint].x,
                    y=joints[source_joint].y,
                    z=0.0,
                    visibility=joints[source_joint].visibility
                )
                
        return joints

    def close(self) -> None:
        pass
