"""
Athlete Detector Module — AuraKinematics
==========================================
Runs YOLOv8-Pose on each video frame to locate every visible person, then
selects the *primary athlete* via a largest-bounding-box-area heuristic
with IoU-based overlap filtering.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Sequence

import numpy as np
from ultralytics import YOLO

from app.config import get_settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass(frozen=True, slots=True)
class BoundingBox:
    """Axis-aligned bounding box in pixel coordinates."""

    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float

    @property
    def width(self) -> float:
        return max(self.x2 - self.x1, 0.0)

    @property
    def height(self) -> float:
        return max(self.y2 - self.y1, 0.0)

    @property
    def area(self) -> float:
        return self.width * self.height

    def as_dict(self) -> dict:
        return {
            "x1": self.x1,
            "y1": self.y1,
            "x2": self.x2,
            "y2": self.y2,
            "width": self.width,
            "height": self.height,
            "area": self.area,
            "confidence": self.confidence,
        }


# ---------------------------------------------------------------------------
# Detector
# ---------------------------------------------------------------------------

class AthleteDetector:
    """Detect people in a frame and isolate the primary athlete.

    The detector loads a YOLOv8-Pose model once on construction and reuses
    it for every :pymeth:`detect` call.

    Settings consumed:

    * ``YOLO_MODEL_NAME`` – e.g. ``"yolov8m-pose.pt"``
    * ``YOLO_CONFIDENCE_THRESHOLD`` – minimum detection confidence.
    """

    # COCO class ID for "person"
    _PERSON_CLASS_ID: int = 0

    def __init__(self) -> None:
        settings = get_settings()
        model_name: str = settings.YOLO_MODEL_NAME
        self._confidence: float = settings.YOLO_CONFIDENCE_THRESHOLD

        logger.info("Loading YOLO model: %s", model_name)
        self._model = YOLO(model_name)
        logger.info("YOLO model loaded successfully.")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def detect(
        self, frame: np.ndarray
    ) -> tuple[np.ndarray, dict]:
        """Run person detection on *frame*.

        Parameters
        ----------
        frame:
            BGR image of shape ``(H, W, 3)``, dtype ``uint8``.

        Returns
        -------
        tuple[np.ndarray, dict]
            ``(cropped_frame, metadata)`` where *cropped_frame* is the
            region around the primary athlete and *metadata* is a dict
            containing:

            * ``detected`` – bool indicating if a person was found.
            * ``bbox`` – bounding-box dict (see :pyclass:`BoundingBox`).
            * ``num_persons`` – total number of people detected.
        """
        results = self._model(
            frame,
            conf=self._confidence,
            verbose=False,
        )

        detections = self._extract_person_detections(results)

        if not detections:
            logger.debug("No person detected in frame.")
            return frame, {
                "detected": False,
                "bbox": None,
                "num_persons": 0,
            }

        primary = self._select_primary_athlete(detections)
        cropped = self._crop(frame, primary)

        return cropped, {
            "detected": True,
            "bbox": primary.as_dict(),
            "num_persons": len(detections),
        }

    # ------------------------------------------------------------------
    # Internals
    # ------------------------------------------------------------------

    def _extract_person_detections(
        self, results: list
    ) -> list[BoundingBox]:
        """Parse YOLO results into a list of person bounding boxes."""
        boxes: list[BoundingBox] = []

        for result in results:
            if result.boxes is None:
                continue
            for box_data in result.boxes:
                cls_id = int(box_data.cls[0])
                if cls_id != self._PERSON_CLASS_ID:
                    continue
                conf = float(box_data.conf[0])
                xyxy = box_data.xyxy[0].cpu().numpy()
                boxes.append(
                    BoundingBox(
                        x1=float(xyxy[0]),
                        y1=float(xyxy[1]),
                        x2=float(xyxy[2]),
                        y2=float(xyxy[3]),
                        confidence=conf,
                    )
                )

        return boxes

    def _select_primary_athlete(
        self, detections: Sequence[BoundingBox]
    ) -> BoundingBox:
        """Choose the primary athlete from a list of detections.

        Strategy
        --------
        1. Sort detections by bounding-box area (descending).
        2. Starting from the largest, filter out any subsequent detection
           whose IoU with an already-accepted detection exceeds 0.5 (i.e.
           suppress heavily-overlapping duplicates).
        3. Return the largest remaining detection.
        """
        if len(detections) == 1:
            return detections[0]

        sorted_dets = sorted(detections, key=lambda d: d.area, reverse=True)

        # NMS-style IoU filtering
        kept: list[BoundingBox] = [sorted_dets[0]]
        iou_threshold = 0.5

        for det in sorted_dets[1:]:
            overlap = any(
                self._calculate_iou(det, accepted) > iou_threshold
                for accepted in kept
            )
            if not overlap:
                kept.append(det)

        # The primary athlete is the largest kept detection.
        primary = kept[0]
        logger.debug(
            "Primary athlete selected — area=%.0f, confidence=%.2f, "
            "total_kept=%d / %d",
            primary.area,
            primary.confidence,
            len(kept),
            len(detections),
        )
        return primary

    @staticmethod
    def _calculate_iou(box1: BoundingBox, box2: BoundingBox) -> float:
        """Compute Intersection-over-Union between two bounding boxes."""
        inter_x1 = max(box1.x1, box2.x1)
        inter_y1 = max(box1.y1, box2.y1)
        inter_x2 = min(box1.x2, box2.x2)
        inter_y2 = min(box1.y2, box2.y2)

        inter_w = max(inter_x2 - inter_x1, 0.0)
        inter_h = max(inter_y2 - inter_y1, 0.0)
        intersection = inter_w * inter_h

        union = box1.area + box2.area - intersection
        if union <= 0.0:
            return 0.0

        return intersection / union

    @staticmethod
    def _crop(frame: np.ndarray, bbox: BoundingBox) -> np.ndarray:
        """Crop *frame* to *bbox*, clamped to frame boundaries."""
        h, w = frame.shape[:2]
        x1 = max(int(bbox.x1), 0)
        y1 = max(int(bbox.y1), 0)
        x2 = min(int(bbox.x2), w)
        y2 = min(int(bbox.y2), h)

        if x2 <= x1 or y2 <= y1:
            logger.warning("Degenerate bounding box — returning full frame.")
            return frame

        return frame[y1:y2, x1:x2].copy()
