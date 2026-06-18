"""
Temporal Smoother Module — AuraKinematics
==========================================
Post-processes a per-frame landmark timeline by:

1. Interpolating low-confidence frames (visibility < 0.5).
2. Applying a Savitzky–Golay filter to each coordinate series (x, y, z)
   independently.

This removes high-frequency jitter while preserving the natural motion
profile of the athlete.
"""

from __future__ import annotations

import copy
import logging
from typing import Dict, List, Optional

import numpy as np
from scipy.interpolate import interp1d
from scipy.signal import savgol_filter

from app.models.schemas import JointCoordinate

logger = logging.getLogger(__name__)

# Visibility threshold below which a frame is considered unreliable.
_LOW_CONFIDENCE_THRESHOLD: float = 0.4

# Default Savitzky–Golay parameters.
_DEFAULT_WINDOW_LENGTH: int = 7
_DEFAULT_POLYORDER: int = 2


class TemporalSmoother:
    """Smooth a per-frame landmark timeline across the temporal axis.

    Parameters
    ----------
    window_length:
        Length of the Savitzky–Golay filter window (must be odd and
        ≥ ``polyorder + 2``).  Defaults to 7.
    polyorder:
        Polynomial order of the filter.  Defaults to 2.
    """

    def __init__(
        self,
        window_length: int = _DEFAULT_WINDOW_LENGTH,
        polyorder: int = _DEFAULT_POLYORDER,
    ) -> None:
        self._window_length = window_length
        self._polyorder = polyorder

        logger.info(
            "TemporalSmoother initialised — window=%d, polyorder=%d",
            self._window_length,
            self._polyorder,
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def smooth(
        self,
        timeline: List[Optional[Dict[str, JointCoordinate]]],
        fps: float,
    ) -> List[Optional[Dict[str, JointCoordinate]]]:
        """Smooth an entire landmark timeline.

        Parameters
        ----------
        timeline:
            A list where each element is either a ``dict[str, JointCoordinate]``
            (one entry per joint) for frames where a pose was detected, or
            ``None`` for frames without a detection.
        fps:
            Video frame-rate (currently used for logging; the filter is
            frame-index-based, not time-based).

        Returns
        -------
        list[dict[str, JointCoordinate] | None]
            A new list of the same length with smoothed coordinates.
            Entries that were originally ``None`` remain ``None``.
        """
        n_frames = len(timeline)
        if n_frames == 0:
            return []

        # Collect indices of frames that actually have landmarks.
        valid_indices: list[int] = [
            i for i, t in enumerate(timeline) if t is not None
        ]
        if len(valid_indices) < 2:
            logger.warning(
                "Fewer than 2 valid frames (%d) — skipping smoothing.",
                len(valid_indices),
            )
            return copy.deepcopy(timeline)

        # Determine the complete set of joint names from the first valid frame.
        joint_names: list[str] = list(timeline[valid_indices[0]].keys())  # type: ignore[union-attr]

        # Build per-joint coordinate arrays (only for valid frames).
        smoothed_coords: Dict[str, Dict[str, np.ndarray]] = {}

        for joint in joint_names:
            xs = np.array(
                [timeline[i][joint].x for i in valid_indices],  # type: ignore[index]
                dtype=np.float64,
            )
            ys = np.array(
                [timeline[i][joint].y for i in valid_indices],  # type: ignore[index]
                dtype=np.float64,
            )
            zs = np.array(
                [timeline[i][joint].z for i in valid_indices],  # type: ignore[index]
                dtype=np.float64,
            )
            vis = np.array(
                [timeline[i][joint].visibility for i in valid_indices],  # type: ignore[index]
                dtype=np.float64,
            )

            # --- Step 1: Interpolate low-confidence frames ----------------
            xs = self._interpolate_low_confidence(xs, vis)
            ys = self._interpolate_low_confidence(ys, vis)
            zs = self._interpolate_low_confidence(zs, vis)

            # --- Step 2: Savitzky–Golay smoothing -------------------------
            xs = self._apply_savgol(xs)
            ys = self._apply_savgol(ys)
            zs = self._apply_savgol(zs)

            smoothed_coords[joint] = {"x": xs, "y": ys, "z": zs, "vis": vis}

        # --- Reconstruct the timeline ------------------------------------
        result: List[Optional[Dict[str, JointCoordinate]]] = [
            None
        ] * n_frames

        for out_idx, frame_idx in enumerate(valid_indices):
            frame_joints: Dict[str, JointCoordinate] = {}
            for joint in joint_names:
                sc = smoothed_coords[joint]
                frame_joints[joint] = JointCoordinate(
                    x=float(sc["x"][out_idx]),
                    y=float(sc["y"][out_idx]),
                    z=float(sc["z"][out_idx]),
                    visibility=float(sc["vis"][out_idx]),
                )
            result[frame_idx] = frame_joints

        logger.info(
            "Smoothing complete — %d total frames, %d valid, fps=%.2f.",
            n_frames,
            len(valid_indices),
            fps,
        )
        return result

    # ------------------------------------------------------------------
    # Internals
    # ------------------------------------------------------------------

    def _interpolate_low_confidence(
        self, series: np.ndarray, visibility: np.ndarray
    ) -> np.ndarray:
        high_conf_mask = visibility >= _LOW_CONFIDENCE_THRESHOLD

        if high_conf_mask.all() or not high_conf_mask.any():
            return series.copy()

        interpolated = series.copy()
        n = len(series)
        
        # Find contiguous chunks of low confidence
        low_conf_indices = np.where(~high_conf_mask)[0]
        if len(low_conf_indices) == 0:
            return interpolated
            
        chunks = np.split(low_conf_indices, np.where(np.diff(low_conf_indices) != 1)[0] + 1)
        
        for chunk in chunks:
            if len(chunk) > 3 and chunk[0] >= 5:
                # Momentum Physics Extrapolation
                # Use 5 frames prior to the occlusion to calculate velocity and acceleration
                pre_idx = chunk[0] - 1
                prior_indices = np.arange(max(0, pre_idx - 4), pre_idx + 1)
                prior_vals = series[prior_indices]
                
                if len(prior_vals) >= 2:
                    dt = 1.0  # Normalized time step
                    velocities = np.diff(prior_vals) / dt
                    avg_vel = np.mean(velocities)
                    
                    accel = np.diff(velocities) / dt if len(velocities) >= 2 else [0]
                    avg_accel = np.mean(accel)
                    
                    # Extrapolate
                    p0 = series[pre_idx]
                    for i, idx in enumerate(chunk):
                        t = i + 1
                        # Kinematic equation: p = p0 + v*t + 0.5*a*t^2
                        pred = p0 + (avg_vel * t) + (0.5 * avg_accel * (t**2))
                        interpolated[idx] = pred
                else:
                    # Fallback to linear if not enough history
                    self._linear_interpolate_chunk(interpolated, chunk, high_conf_mask)
            else:
                # Basic Linear Interpolation for small gaps
                self._linear_interpolate_chunk(interpolated, chunk, high_conf_mask)

        return interpolated

    def _linear_interpolate_chunk(self, series: np.ndarray, chunk: np.ndarray, high_conf_mask: np.ndarray):
        high_indices = np.where(high_conf_mask)[0]
        if len(high_indices) < 2:
            return
        interpolator = interp1d(
            high_indices,
            series[high_indices],
            kind="linear",
            bounds_error=False,
            fill_value=(series[high_indices[0]], series[high_indices[-1]]),
        )
        series[chunk] = interpolator(chunk)

    def _apply_savgol(self, series: np.ndarray) -> np.ndarray:
        """Apply a Savitzky–Golay filter, adapting window size if needed.

        Parameters
        ----------
        series:
            1-D array of coordinate values for a single joint.

        Returns
        -------
        np.ndarray
            Smoothed series.
        """
        n = len(series)
        if n < 3:
            # Too few points for any meaningful smoothing.
            return series.copy()

        window = self._window_length

        # Window must be odd and ≤ n.
        if window > n:
            window = n if n % 2 == 1 else n - 1
        if window < 1:
            return series.copy()

        # Polyorder must be < window.
        polyorder = min(self._polyorder, window - 1)

        # Guard: window must be ≥ polyorder + 2 for savgol_filter.
        if window < polyorder + 2:
            return series.copy()

        return savgol_filter(series, window_length=window, polyorder=polyorder)
