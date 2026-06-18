import librosa
import numpy as np
import logging
import subprocess

logger = logging.getLogger(__name__)

def find_acoustic_peak(video_path: str, fps: float) -> tuple[int, int]:
    """Extracts audio and finds the peak decibel frame, returning a [start_frame, end_frame] tuple."""
    try:
        # Load audio directly using librosa. It can read video files if ffmpeg is installed.
        y, sr = librosa.load(video_path, sr=22050)
        
        if len(y) == 0:
            logger.warning("No audio found. Returning full duration.")
            return 0, int(1e9)
            
        # Calculate RMS energy
        rms = librosa.feature.rms(y=y)[0]
        peak_idx = np.argmax(rms)
        
        # Convert peak idx to time
        peak_time = librosa.frames_to_time(peak_idx, sr=sr, hop_length=512)
        
        peak_frame = int(peak_time * fps)
        start_frame = max(0, peak_frame - int(1.0 * fps))
        end_frame = peak_frame + int(1.0 * fps)
        
        logger.info(f"Acoustic peak found at {peak_time:.2f}s (Frame {peak_frame}). Cropping to [{start_frame}, {end_frame}].")
        return start_frame, end_frame
    except Exception as e:
        logger.warning(f"Acoustic cropper failed: {e}. Falling back to full video.")
        return 0, int(1e9)
