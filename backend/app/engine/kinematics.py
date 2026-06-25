"""
AuraKinematics — Kinematics Engine
===================================
Computes 3D joint angles, angular velocities, and per-frame kinematic
snapshots from MediaPipe-style landmark dictionaries.
"""

from __future__ import annotations

import logging
from typing import ClassVar

import numpy as np

from app.models.schemas import (
    FrameKinematics,
    JointAngles,
    JointCoordinate,
)

logger = logging.getLogger(__name__)


class KinematicsEngine:
    """Pure-computation engine for 3-D biomechanical kinematics."""

    # ------------------------------------------------------------------ #
    # Joint-angle topology: (proximal, vertex, distal)                    #
    # The vertex joint is where the angle is measured.                     #
    # ------------------------------------------------------------------ #
    JOINT_ANGLE_DEFINITIONS: ClassVar[dict[str, tuple[str, str, str]]] = {
        "right_elbow": ("RIGHT_SHOULDER", "RIGHT_ELBOW", "RIGHT_WRIST"),
        "left_elbow": ("LEFT_SHOULDER", "LEFT_ELBOW", "LEFT_WRIST"),
        "right_knee": ("RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE"),
        "left_knee": ("LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE"),
        "right_shoulder": ("RIGHT_ELBOW", "RIGHT_SHOULDER", "RIGHT_HIP"),
        "left_shoulder": ("LEFT_ELBOW", "LEFT_SHOULDER", "LEFT_HIP"),
        "right_hip": ("RIGHT_SHOULDER", "RIGHT_HIP", "RIGHT_KNEE"),
        "left_hip": ("LEFT_SHOULDER", "LEFT_HIP", "LEFT_KNEE"),
        "right_wrist": ("RIGHT_ELBOW", "RIGHT_WRIST", "RIGHT_INDEX"),
        "left_wrist": ("LEFT_ELBOW", "LEFT_WRIST", "LEFT_INDEX"),
        "head_drop": ("NOSE", "LEFT_SHOULDER", "LEFT_HIP"),
        "spine_alignment": ("RIGHT_SHOULDER", "RIGHT_HIP", "RIGHT_KNEE"),
    }

    # ------------------------------------------------------------------ #
    # 3-D angle calculation                                               #
    # ------------------------------------------------------------------ #
    @staticmethod
    def calculate_angle_3d(
        a: np.ndarray,
        b: np.ndarray,
        c: np.ndarray,
    ) -> float:
        """Return the angle (in degrees) at vertex *b* formed by rays BA and BC.

        Parameters
        ----------
        a, b, c : np.ndarray
            3-D position vectors (shape ``(3,)``).

        Returns
        -------
        float
            Angle in the range [0, 180] degrees.
        """
        ba = a - b
        bc = c - b

        norm_ba = np.linalg.norm(ba)
        norm_bc = np.linalg.norm(bc)

        # Guard against degenerate (zero-length) vectors.
        if norm_ba < 1e-9 or norm_bc < 1e-9:
            return 0.0

        cosine = np.dot(ba, bc) / (norm_ba * norm_bc)
        # Numerical clamp to the valid arccos domain.
        cosine = float(np.clip(cosine, -1.0, 1.0))

        angle_rad = np.arccos(cosine)
        return float(np.degrees(angle_rad))

    # ------------------------------------------------------------------ #
    # Batch angle computation                                             #
    # ------------------------------------------------------------------ #
    def calculate_all_joint_angles(
        self,
        landmarks: dict[str, JointCoordinate],
    ) -> list[JointAngles]:
        """Compute every defined joint angle from a landmark dictionary.

        Landmarks whose keys are missing are silently skipped so that
        partial detections do not crash the pipeline.

        Parameters
        ----------
        landmarks : dict[str, JointCoordinate]
            Mapping of landmark name → ``JointCoordinate`` with *x*, *y*, *z*.

        Returns
        -------
        list[JointAngles]
            One entry per successfully computed angle.
        """
        results: list[JointAngles] = []

        for joint_name, (name_a, name_b, name_c) in self.JOINT_ANGLE_DEFINITIONS.items():
            lm_a = landmarks.get(name_a)
            lm_b = landmarks.get(name_b)
            lm_c = landmarks.get(name_c)

            if lm_a is None or lm_b is None or lm_c is None:
                logger.debug(
                    "Skipping angle '%s': missing landmark(s) among [%s, %s, %s]",
                    joint_name,
                    name_a,
                    name_b,
                    name_c,
                )
                continue

            a = np.array([lm_a.x, lm_a.y, lm_a.z], dtype=np.float64)
            b = np.array([lm_b.x, lm_b.y, lm_b.z], dtype=np.float64)
            c = np.array([lm_c.x, lm_c.y, lm_c.z], dtype=np.float64)

            angle = self.calculate_angle_3d(a, b, c)

            results.append(
                JointAngles(
                    joint_name=joint_name,
                    angle_degrees=round(angle, 2),
                    is_optimal=True,
                    threshold_min=0.0,
                    threshold_max=360.0,
                )
            )

        return results

    # ------------------------------------------------------------------ #
    # Angular velocity                                                    #
    # ------------------------------------------------------------------ #
    @staticmethod
    def calculate_angular_velocity(
        angles: list[float],
        fps: float,
    ) -> list[float]:
        """Estimate angular velocity from a time-series of angles.

        Uses ``np.gradient`` on the *radian* representation and scales by
        the frame rate so that the result is in **rad / s**.

        Parameters
        ----------
        angles : list[float]
            Angle values in *degrees* — one per frame.
        fps : float
            Frames-per-second of the source video.

        Returns
        -------
        list[float]
            Angular velocity in rad/s for each frame.
        """
        if len(angles) < 2:
            return [0.0] * len(angles)

        radians = np.radians(np.asarray(angles, dtype=np.float64))
        velocity = np.gradient(radians) * fps
        return [round(float(v), 4) for v in velocity]

    # ------------------------------------------------------------------ #
    # Per-frame assembly                                                  #
    # ------------------------------------------------------------------ #
    def compute_frame_kinematics(
        self,
        landmarks: dict[str, JointCoordinate],
        frame_index: int,
        fps: float,
    ) -> FrameKinematics:
        """Build a complete ``FrameKinematics`` snapshot for a single frame.

        Angular velocities are initialised to empty here; they are
        populated in a second pass once the full timeline is available.

        Parameters
        ----------
        landmarks : dict[str, JointCoordinate]
            Pose landmarks for the frame.
        frame_index : int
            Zero-based index of the frame.
        fps : float
            Video frame rate (used to derive timestamp).

        Returns
        -------
        FrameKinematics
            Fully populated kinematic snapshot.
        """
        joint_angles = self.calculate_all_joint_angles(landmarks)
        timestamp = frame_index / fps if fps > 0 else 0.0

        return FrameKinematics(
            frame_index=frame_index,
            timestamp_seconds=round(timestamp, 4),
            landmarks=landmarks,
            joint_angles=joint_angles,
            angular_velocities={},
        )
