# AuraKinematics

> **Monocular 3D Biomechanical AI Analyzer for Cricket & Badminton**

An enterprise-grade, zero-sensor sports kinematics application that transforms standard 2D smartphone videos into 3D biomechanical coaching feedback.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AuraKinematics                       │
├──────────────┬──────────────────┬────────────────────────┤
│   backend/   │      web/       │       mobile/          │
│  FastAPI     │   Next.js 14    │       Flutter          │
│  Python 3.10+│   App Router    │       Dart             │
├──────────────┴──────────────────┴────────────────────────┤
│                  AI Pipeline                            │
│  PyAV → CLAHE → YOLOv8-Pose → MediaPipe → Savitzky-Golay│
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Web Frontend
```bash
cd web
npm install
npm run dev
```

### Mobile
```bash
cd mobile
flutter pub get
flutter run
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.10+, FastAPI, Pydantic |
| AI Models | MediaPipe BlazePose, YOLOv8-Pose |
| Math Engine | NumPy, SciPy (Savitzky-Golay) |
| Pre-processing | Albumentations (CLAHE) |
| Video Ingestion | PyAV (primary), OpenCV (fallback) |
| Web Frontend | Next.js 14, TailwindCSS, Framer Motion, Recharts |
| Mobile | Flutter, Dart |

## License

MIT
