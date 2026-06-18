"""
Frame Preprocessor Module — AuraKinematics
============================================
Applies CLAHE (Contrast Limited Adaptive Histogram Equalisation) to video
frames via an Albumentations pipeline so that downstream pose-estimation
models receive consistently-lit, high-contrast inputs.
"""

from __future__ import annotations

import logging

import albumentations as A
import cv2
import numpy as np

from app.config import get_settings

logger = logging.getLogger(__name__)


class FramePreprocessor:
    """Applies CLAHE enhancement to individual video frames.

    The transform is built once during initialisation and reused for every
    call to :pymeth:`process`.  Internally the frame is converted from BGR
    to the CIE-LAB colour space so that CLAHE is applied only to the
    luminance channel, preserving chrominance.

    Parameters are pulled from application settings:

    * ``CLAHE_CLIP_LIMIT``  – contrast-limiting threshold.
    * ``CLAHE_TILE_GRID_SIZE`` – tile grid dimensions (tuple of two ints).
    """

    def __init__(self) -> None:
        settings = get_settings()

        clip_limit: float = settings.CLAHE_CLIP_LIMIT
        tile_grid_size: tuple[int, int] = tuple(settings.CLAHE_TILE_GRID_SIZE)  # type: ignore[arg-type]

        self._transform = A.Compose(
            [
                A.CLAHE(
                    clip_limit=(clip_limit, clip_limit),
                    tile_grid_size=tile_grid_size,
                    p=1.0,
                ),
            ]
        )

        logger.info(
            "FramePreprocessor initialised — clip_limit=%.2f, "
            "tile_grid_size=%s",
            clip_limit,
            tile_grid_size,
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def process(self, frame: np.ndarray) -> np.ndarray:
        """Enhance a single video frame using CLAHE on the L channel.

        Parameters
        ----------
        frame:
            Input image in **BGR** format (the OpenCV default) with shape
            ``(H, W, 3)`` and dtype ``uint8``.

        Returns
        -------
        np.ndarray
            Enhanced BGR image with the same shape and dtype as *frame*.

        Raises
        ------
        ValueError
            If *frame* is not a 3-channel uint8 image.
        """
        self._validate(frame)

        # 1. Convert BGR → LAB
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)

        # 2. Split into L, A, B channels
        l_channel, a_channel, b_channel = cv2.split(lab)

        # 3. Apply CLAHE to the L (luminance) channel via Albumentations.
        #    Albumentations expects a full image; we wrap L in a 3-channel
        #    dummy so the transform sees shape (H, W, 3), then extract
        #    only the first channel back.
        l_3ch = cv2.merge([l_channel, l_channel, l_channel])
        augmented = self._transform(image=l_3ch)["image"]
        l_enhanced = augmented[:, :, 0]

        # 4. Merge back and convert LAB → BGR
        lab_enhanced = cv2.merge([l_enhanced, a_channel, b_channel])
        result = cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2BGR)

        return result

    def process_rgb(self, frame: np.ndarray) -> np.ndarray:
        """Convenience wrapper for RGB input.

        Converts RGB → BGR, delegates to :pymeth:`process`, then converts
        back to RGB before returning.

        Parameters
        ----------
        frame:
            Input image in **RGB** format, ``(H, W, 3)``, dtype ``uint8``.

        Returns
        -------
        np.ndarray
            Enhanced RGB image.
        """
        bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        enhanced_bgr = self.process(bgr)
        return cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2RGB)

    # ------------------------------------------------------------------
    # Internals
    # ------------------------------------------------------------------

    @staticmethod
    def _validate(frame: np.ndarray) -> None:
        """Raise if *frame* is not a valid 3-channel uint8 image."""
        if frame is None:
            raise ValueError("Received None instead of a valid frame.")
        if frame.ndim != 3 or frame.shape[2] != 3:
            raise ValueError(
                f"Expected 3-channel image, got shape {frame.shape}."
            )
        if frame.dtype != np.uint8:
            raise ValueError(
                f"Expected dtype uint8, got {frame.dtype}."
            )
