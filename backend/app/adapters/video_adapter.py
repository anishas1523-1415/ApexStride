"""
Video Adapter Module — AuraKinematics
======================================
Implements the Adapter Pattern for video decoding.

Provides two interchangeable backends:
    • **PyAVDecoder** – default, leverages the ``av`` library for efficient
      container-level demuxing and decoding.
    • **OpenCVDecoder** – legacy fallback using ``cv2.VideoCapture``.

The ``VideoAdapter`` factory inspects application settings and instantiates
the appropriate decoder.  It also exposes a context-manager protocol so
callers can write::

    with VideoAdapter(path) as decoder:
        meta = decoder.get_metadata()
        for chunk in decoder.decode_frames():
            ...
"""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Generator

import cv2
import numpy as np

try:
    import av
except ImportError:  # pragma: no cover – optional dependency
    av = None  # type: ignore[assignment]

from app.config import get_settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Custom exceptions
# ---------------------------------------------------------------------------

class VideoFileNotFoundError(FileNotFoundError):
    """Raised when the video file does not exist on disk."""


class CorruptVideoError(RuntimeError):
    """Raised when the video container / file is corrupt or unreadable."""


class CodecError(RuntimeError):
    """Raised when the video uses an unsupported or broken codec."""


# ---------------------------------------------------------------------------
# Abstract base class
# ---------------------------------------------------------------------------

class BaseVideoDecoder(ABC):
    """Abstract interface every video decoder must implement."""

    @abstractmethod
    def open(self, path: str | Path) -> None:
        """Open a video file for reading.

        Parameters
        ----------
        path:
            Absolute or relative filesystem path to the video file.

        Raises
        ------
        VideoFileNotFoundError
            If *path* does not exist.
        CorruptVideoError
            If the container cannot be opened.
        CodecError
            If the codec is unsupported.
        """

    @abstractmethod
    def get_metadata(self) -> dict:
        """Return a dictionary of video metadata.

        Expected keys: ``fps``, ``total_frames``, ``width``, ``height``,
        ``duration`` (seconds, float).
        """

    def decode_frames(
        self, chunk_size: int | None = None, impact_timestamp: float | None = None
    ) -> Generator[list[np.ndarray], None, None]:
        """Yield frames in chunks to prevent OOM on long videos.

        Parameters
        ----------
        chunk_size:
            Number of frames per chunk.  Falls back to
            ``settings.CHUNK_SIZE`` when *None*.

        Yields
        ------
        list[np.ndarray]
            A list of decoded BGR frames (H × W × 3, dtype uint8).
        """

    @abstractmethod
    def close(self) -> None:
        """Release all resources held by the decoder."""


# ---------------------------------------------------------------------------
# PyAV decoder (primary)
# ---------------------------------------------------------------------------

class PyAVDecoder(BaseVideoDecoder):
    """High-performance video decoder backed by the ``av`` (FFmpeg) library."""

    def __init__(self) -> None:
        self._container: av.container.InputContainer | None = None
        self._stream: av.video.stream.VideoStream | None = None
        self._path: Path | None = None

    # -- lifecycle -----------------------------------------------------------

    def open(self, path: str | Path) -> None:
        path = Path(path)
        if not path.exists():
            raise VideoFileNotFoundError(
                f"Video file not found: {path}"
            )

        try:
            self._container = av.open(str(path))
        except av.AVError as exc:
            raise CorruptVideoError(
                f"Cannot open video container: {path} — {exc}"
            ) from exc

        if not self._container.streams.video:
            self._container.close()
            self._container = None
            raise CodecError(
                f"No video stream found in container: {path}"
            )

        self._stream = self._container.streams.video[0]
        self._stream.thread_type = "AUTO"
        self._path = path
        logger.info("PyAVDecoder opened: %s", path)

    def get_metadata(self) -> dict:
        self._ensure_open()
        assert self._stream is not None
        assert self._container is not None

        fps = float(self._stream.average_rate) if self._stream.average_rate else 0.0
        total_frames = self._stream.frames or 0
        width = self._stream.codec_context.width
        height = self._stream.codec_context.height

        duration: float = 0.0
        if self._container.duration is not None:
            duration = float(self._container.duration) / av.time_base
        elif total_frames and fps:
            duration = total_frames / fps

        return {
            "fps": fps,
            "total_frames": total_frames,
            "width": width,
            "height": height,
            "duration": duration,
        }

    def decode_frames(
        self, chunk_size: int | None = None, impact_timestamp: float | None = None
    ) -> Generator[list[np.ndarray], None, None]:
        self._ensure_open()
        assert self._container is not None
        assert self._stream is not None

        if chunk_size is None:
            chunk_size = get_settings().CHUNK_SIZE

        chunk: list[np.ndarray] = []
        try:
            start_time = 0.0
            end_time = float('inf')
            if impact_timestamp is not None:
                start_time = max(0.0, impact_timestamp - 1.0)
                end_time = impact_timestamp + 1.0
                try:
                    seek_target = int(start_time / self._stream.time_base)
                    self._container.seek(seek_target, stream=self._stream, backward=True)
                except av.AVError:
                    pass

            for frame in self._container.decode(self._stream):
                if frame.pts is not None and self._stream.time_base is not None:
                    frame_time = float(frame.pts * self._stream.time_base)
                    if frame_time < start_time:
                        continue
                    if frame_time > end_time:
                        break

                bgr = frame.to_ndarray(format="bgr24")
                chunk.append(bgr)
                if len(chunk) >= chunk_size:
                    yield chunk
                    chunk = []
        except av.AVError as exc:
            raise CorruptVideoError(
                f"Error decoding frames from {self._path}: {exc}"
            ) from exc

        if chunk:
            yield chunk

    def close(self) -> None:
        if self._container is not None:
            self._container.close()
            logger.info("PyAVDecoder closed: %s", self._path)
        self._container = None
        self._stream = None
        self._path = None

    # -- helpers -------------------------------------------------------------

    def _ensure_open(self) -> None:
        if self._container is None or self._stream is None:
            raise RuntimeError(
                "Decoder is not open. Call open(path) first."
            )


# ---------------------------------------------------------------------------
# OpenCV decoder (legacy fallback)
# ---------------------------------------------------------------------------

class OpenCVDecoder(BaseVideoDecoder):
    """Legacy video decoder using ``cv2.VideoCapture``.

    .. warning::
        This decoder exists only as a fallback.  Prefer ``PyAVDecoder``
        for production workloads.
    """

    _LEGACY_WARNING = (
        "OpenCVDecoder is a legacy fallback. Consider using PyAVDecoder "
        "for better performance and container-level control."
    )

    def __init__(self) -> None:
        self._capture: cv2.VideoCapture | None = None
        self._path: Path | None = None
        logger.warning(self._LEGACY_WARNING)

    # -- lifecycle -----------------------------------------------------------

    def open(self, path: str | Path) -> None:
        path = Path(path)
        if not path.exists():
            raise VideoFileNotFoundError(
                f"Video file not found: {path}"
            )

        cap = cv2.VideoCapture(str(path))
        if not cap.isOpened():
            raise CorruptVideoError(
                f"cv2.VideoCapture failed to open: {path}"
            )

        # Quick sanity read to detect codec issues early.
        ok, test_frame = cap.read()
        if not ok or test_frame is None:
            cap.release()
            raise CodecError(
                f"Cannot decode first frame (possible codec issue): {path}"
            )
        # Reset to the beginning after the sanity read.
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

        self._capture = cap
        self._path = path
        logger.info("OpenCVDecoder opened: %s", path)

    def get_metadata(self) -> dict:
        self._ensure_open()
        assert self._capture is not None

        fps = self._capture.get(cv2.CAP_PROP_FPS) or 0.0
        total_frames = int(self._capture.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
        width = int(self._capture.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(self._capture.get(cv2.CAP_PROP_FRAME_HEIGHT))

        duration: float = (total_frames / fps) if fps else 0.0

        return {
            "fps": fps,
            "total_frames": total_frames,
            "width": width,
            "height": height,
            "duration": duration,
        }

    def decode_frames(
        self, chunk_size: int | None = None, impact_timestamp: float | None = None
    ) -> Generator[list[np.ndarray], None, None]:
        self._ensure_open()
        assert self._capture is not None

        if chunk_size is None:
            chunk_size = get_settings().CHUNK_SIZE

        chunk: list[np.ndarray] = []
        while True:
            ok, frame = self._capture.read()
            if not ok or frame is None:
                break
            chunk.append(frame)
            if len(chunk) >= chunk_size:
                yield chunk
                chunk = []

        if chunk:
            yield chunk

    def close(self) -> None:
        if self._capture is not None:
            self._capture.release()
            logger.info("OpenCVDecoder closed: %s", self._path)
        self._capture = None
        self._path = None

    # -- helpers -------------------------------------------------------------

    def _ensure_open(self) -> None:
        if self._capture is None:
            raise RuntimeError(
                "Decoder is not open. Call open(path) first."
            )


# ---------------------------------------------------------------------------
# VideoAdapter factory + context manager
# ---------------------------------------------------------------------------

class VideoAdapter:
    """Factory that selects the right decoder based on application settings.

    Usage::

        with VideoAdapter("video.mp4") as decoder:
            meta = decoder.get_metadata()
            for chunk in decoder.decode_frames():
                process(chunk)
    """

    def __init__(self, path: str | Path) -> None:
        self._path = Path(path)
        settings = get_settings()

        if settings.USE_OPENCV_FALLBACK or av is None:
            if av is None:
                logger.warning(
                    "PyAV is not installed — falling back to OpenCVDecoder."
                )
            self._decoder: BaseVideoDecoder = OpenCVDecoder()
        else:
            self._decoder = PyAVDecoder()

    # -- context manager protocol -------------------------------------------

    def __enter__(self) -> BaseVideoDecoder:
        self._decoder.open(self._path)
        return self._decoder

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: object,
    ) -> None:
        self._decoder.close()

    # -- direct access (non-context-manager usage) --------------------------

    @property
    def decoder(self) -> BaseVideoDecoder:
        """Return the underlying decoder instance."""
        return self._decoder
