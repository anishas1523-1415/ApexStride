# AuraKinematics

> **Enterprise-grade monocular 3-D biomechanics analysis API** — powered by
> YOLOv8-Pose, MediaPipe, and vector-based kinematic computation.

---

## 📖 Overview

AuraKinematics is the backend engine of the **ApexStride** platform.  It
accepts a sports video filmed with any consumer-grade camera, runs real-time
pose estimation, computes joint kinematics (angles, angular velocities), and
returns structured coaching insights — all through a simple REST API.

### Key Capabilities

| Capability | Detail |
|---|---|
| Pose estimation | YOLOv8-Pose (primary) with MediaPipe holistic fallback |
| Kinematic analysis | Vector-based joint angle computation + Savitzky-Golay smoothed angular velocity |
| Pre-processing | CLAHE adaptive histogram equalisation, Albumentations augmentation pipeline |
| Coaching engine | Sport-specific rule engine that emits actionable insights & critical events |
| Video decoding | Adapter pattern — hardware-accelerated PyAV with OpenCV fallback |
| Supported sports | Cricket batting, cricket bowling, badminton smash, badminton drop |

---

## 🚀 Quick Start

### 1. Create a virtual environment

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the development server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The interactive API docs are available at
[http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI) and
[http://localhost:8000/redoc](http://localhost:8000/redoc) (ReDoc).

---

## 🗂 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py            # Pydantic BaseSettings (AURA_ env prefix)
│   ├── main.py              # FastAPI application entry-point
│   ├── adapters/            # Video decoding adapters (PyAV / OpenCV)
│   │   └── __init__.py
│   ├── engine/              # Kinematic computation engine
│   │   └── __init__.py
│   ├── models/              # Pydantic v2 request/response schemas
│   │   ├── __init__.py
│   │   └── schemas.py
│   ├── pipeline/            # Frame-level pre-processing pipeline
│   │   └── __init__.py
│   └── routes/              # FastAPI route modules
│       └── __init__.py
├── tests/
│   └── __init__.py
├── requirements.txt
└── README.md                # ← You are here
```

---

## 🔌 API Endpoints

### `GET /`

Root endpoint — returns a welcome message with API version and documentation
link.

### `GET /api/v1/health`

Health-check endpoint.

**Response (200)**

```json
{
  "status": "healthy",
  "version": "v1",
  "app_name": "AuraKinematics"
}
```

### `POST /api/v1/analyze`

Upload a video for biomechanical analysis.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `file` | form-data | `UploadFile` | ✅ | Video file (MP4, AVI, MOV) |
| `sport_type` | form-data | `string` | ✅ | One of `cricket_batting`, `cricket_bowling`, `badminton_smash`, `badminton_drop` |

**Response (200)** — see `AnalysisResponse` schema in `app/models/schemas.py`.

---

## 🏛 Architecture Overview

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │  HTTP (multipart/form-data)
       ▼
┌──────────────┐
│   FastAPI     │  Routes layer
│   Routes      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Adapter     │  Video decoding (PyAV / OpenCV fallback)
│   Layer       │
└──────┬───────┘
       │  raw frames (numpy arrays)
       ▼
┌──────────────┐
│   Pipeline    │  Pre-processing (CLAHE, augmentation, pose estimation)
│   Layer       │
└──────┬───────┘
       │  pose landmarks per frame
       ▼
┌──────────────┐
│   Engine      │  Kinematic computation (angles, angular velocities)
│   Layer       │
└──────┬───────┘
       │  FrameKinematics timeline
       ▼
┌──────────────┐
│   Coaching    │  Sport-specific rule engine → insights & events
│   Engine      │
└──────┬───────┘
       │  AnalysisResponse
       ▼
┌──────────────┐
│   Client      │
└──────────────┘
```

### Design Patterns

- **Adapter Pattern** — Swappable video decoders (PyAV primary, OpenCV
  fallback) behind a common interface.
- **Pipeline Pattern** — Composable, ordered frame transformations (histogram
  equalisation → augmentation → pose estimation).
- **Strategy Pattern** — Sport-specific coaching rule-sets selected at
  runtime.

---

## ⚙️ Environment Variables

All settings can be overridden via environment variables prefixed with
`AURA_`.

| Variable | Default | Description |
|---|---|---|
| `AURA_APP_NAME` | `AuraKinematics` | Application display name |
| `AURA_API_VERSION` | `v1` | API version string |
| `AURA_USE_OPENCV_FALLBACK` | `False` | Force OpenCV decoder instead of PyAV |
| `AURA_YOLO_CONFIDENCE_THRESHOLD` | `0.5` | YOLOv8-Pose confidence cutoff |
| `AURA_YOLO_MODEL_NAME` | `yolov8n-pose.pt` | YOLOv8 model weights file |
| `AURA_MEDIAPIPE_MIN_DETECTION_CONFIDENCE` | `0.5` | MediaPipe detection threshold |
| `AURA_MEDIAPIPE_MIN_TRACKING_CONFIDENCE` | `0.5` | MediaPipe tracking threshold |
| `AURA_CLAHE_CLIP_LIMIT` | `2.0` | CLAHE contrast-limit |
| `AURA_CLAHE_TILE_GRID_SIZE` | `(8, 8)` | CLAHE tile grid dimensions |
| `AURA_SAVGOL_WINDOW_LENGTH` | `7` | Savitzky-Golay filter window |
| `AURA_SAVGOL_POLYORDER` | `3` | Savitzky-Golay polynomial order |
| `AURA_CHUNK_SIZE` | `64` | Frames decoded per batch |
| `AURA_MAX_VIDEO_SIZE_MB` | `500` | Maximum upload size in megabytes |
| `AURA_UPLOAD_DIR` | `uploads` | Directory for temporary uploads |

---

## 🧪 Testing

Run the full test suite with:

```bash
pytest
```

Run with verbose output:

```bash
pytest -v
```

Run a specific test file:

```bash
pytest tests/test_schemas.py -v
```

---

## 📄 License

This project is part of the **ApexStride** platform and is intended for
academic and research use.
