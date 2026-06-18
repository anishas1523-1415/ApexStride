import pytest
from unittest.mock import patch, MagicMock, PropertyMock
from app.adapters.video_adapter import PyAVDecoder, OpenCVDecoder, VideoAdapter


class TestPyAVDecoder:
    @patch('app.adapters.video_adapter.Path.exists', return_value=True)
    @patch('app.adapters.video_adapter.av')
    def test_init_and_open(self, mock_av, mock_exists):
        """Verify PyAVDecoder opens file via av.open."""
        mock_container = MagicMock()
        mock_stream = MagicMock()
        mock_stream.codec_context.width = 1920
        mock_stream.codec_context.height = 1080
        mock_stream.average_rate = 30
        mock_stream.frames = 900
        mock_stream.duration = 30000000
        mock_stream.time_base = MagicMock()
        mock_stream.time_base.numerator = 1
        mock_stream.time_base.denominator = 1000000
        mock_container.streams.video = [mock_stream]
        mock_av.open.return_value = mock_container

        decoder = PyAVDecoder()
        decoder.open('test_video.mp4')
        mock_av.open.assert_called_once_with('test_video.mp4')


class TestOpenCVDecoder:
    @patch('app.adapters.video_adapter.Path.exists', return_value=True)
    @patch('app.adapters.video_adapter.cv2')
    def test_init_and_open(self, mock_cv2, mock_exists):
        """Verify OpenCVDecoder opens file via cv2.VideoCapture."""
        mock_cap = MagicMock()
        mock_cap.isOpened.return_value = True
        mock_cap.get.side_effect = lambda prop: {
            mock_cv2.CAP_PROP_FRAME_WIDTH: 1920,
            mock_cv2.CAP_PROP_FRAME_HEIGHT: 1080,
            mock_cv2.CAP_PROP_FPS: 30.0,
            mock_cv2.CAP_PROP_FRAME_COUNT: 900,
        }.get(prop, 0)
        mock_cap.read.return_value = (True, MagicMock())
        mock_cv2.VideoCapture.return_value = mock_cap

        decoder = OpenCVDecoder()
        decoder.open('test_video.mp4')
        mock_cv2.VideoCapture.assert_called_once_with('test_video.mp4')


class TestVideoAdapterFactory:
    @patch('app.adapters.video_adapter.get_settings')
    def test_factory_selects_pyav(self, mock_settings):
        """With USE_OPENCV_FALLBACK=False, PyAVDecoder is selected."""
        settings = MagicMock()
        settings.USE_OPENCV_FALLBACK = False
        mock_settings.return_value = settings

        adapter = VideoAdapter('test_video.mp4')
        assert isinstance(adapter._decoder, PyAVDecoder)

    @patch('app.adapters.video_adapter.get_settings')
    def test_factory_selects_opencv(self, mock_settings):
        """With USE_OPENCV_FALLBACK=True, OpenCVDecoder is selected."""
        settings = MagicMock()
        settings.USE_OPENCV_FALLBACK = True
        mock_settings.return_value = settings

        adapter = VideoAdapter('test_video.mp4')
        assert isinstance(adapter._decoder, OpenCVDecoder)
