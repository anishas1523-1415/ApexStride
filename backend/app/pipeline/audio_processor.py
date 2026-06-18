import tempfile
import os
import logging
import ffmpeg
import librosa
import numpy as np

logger = logging.getLogger(__name__)

def get_impact_timestamp(video_path: str) -> float | None:
    """
    Extract audio using ffmpeg-python into a temporary WAV file,
    load it with librosa, calculate RMS energy, and return the timestamp
    (in seconds) of the peak impact. Returns None if no audio or error.
    """
    tmp_path = None
    try:
        # Create a temp file for the WAV
        fd, tmp_path = tempfile.mkstemp(suffix=".wav", prefix="aura_audio_")
        os.close(fd)

        # Run ffmpeg to extract audio
        try:
            (
                ffmpeg
                .input(video_path)
                .output(tmp_path, acodec="pcm_s16le", ac=1, ar="22050")
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
        except ffmpeg.Error as e:
            logger.warning(f"ffmpeg could not extract audio from {video_path}: {e.stderr.decode('utf-8', errors='ignore')}")
            return None

        # Load with librosa
        y, sr = librosa.load(tmp_path, sr=22050)
        
        if len(y) == 0:
            logger.warning(f"Audio extracted from {video_path} is empty.")
            return None

        # Calculate RMS energy
        rms = librosa.feature.rms(y=y)[0]
        peak_idx = np.argmax(rms)
        
        # Convert peak idx to time
        peak_time = float(librosa.frames_to_time(peak_idx, sr=sr, hop_length=512))
        
        logger.info(f"Acoustic peak found at {peak_time:.2f}s using ffmpeg & librosa.")
        return peak_time

    except Exception as e:
        logger.exception(f"Acoustic cropper failed: {e}. Falling back to full video.")
        return None
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
