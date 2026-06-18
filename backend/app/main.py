"""
AuraKinematics — Application Entry Point
==========================================
Configures the FastAPI application with lifespan management, CORS
middleware, router inclusion, and a root informational endpoint.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes.analysis import router as analysis_router
from app.routes.auth import router as auth_router

logger = logging.getLogger(__name__)


# --------------------------------------------------------------------- #
# Lifespan                                                               #
# --------------------------------------------------------------------- #


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan handler.

    Runs startup tasks before ``yield`` and shutdown tasks after.
    """
    settings = get_settings()

    # ---- Startup ----------------------------------------------------- #
    log_level = getattr(settings, "AURA_LOG_LEVEL", "INFO")
    logging.basicConfig(
        level=getattr(logging, log_level.upper(), logging.INFO),
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    logger.info("AuraKinematics starting up …")
    logger.info(
        "Environment: %s",
        getattr(settings, "AURA_ENVIRONMENT", "development"),
    )

    yield

    # ---- Shutdown ---------------------------------------------------- #
    logger.info("AuraKinematics shutting down …")


# --------------------------------------------------------------------- #
# Application factory                                                    #
# --------------------------------------------------------------------- #

settings = get_settings()

app = FastAPI(
    title="AuraKinematics",
    description=(
        "Enterprise-grade monocular 3-D biomechanics analysis API. "
        "Upload a sports video and receive joint-angle timelines, "
        "coaching insights, and an overall performance score."
    ),
    version=getattr(settings, "AURA_VERSION", "0.1.0"),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# --------------------------------------------------------------------- #
# CORS middleware                                                        #
# --------------------------------------------------------------------- #

_allowed_origins: list[str] = getattr(
    settings,
    "AURA_CORS_ORIGINS",
    ["http://localhost:3000", "http://localhost:5173"],
)
# Normalise: the setting may arrive as a comma-separated string.
if isinstance(_allowed_origins, str):
    _allowed_origins = [o.strip() for o in _allowed_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------------------------- #
# Router inclusion                                                       #
# --------------------------------------------------------------------- #

app.include_router(analysis_router)
app.include_router(auth_router)

# --------------------------------------------------------------------- #
# Root endpoint                                                          #
# --------------------------------------------------------------------- #


@app.get("/", tags=["meta"], summary="Service information")
async def root() -> dict:
    """Return basic service metadata."""
    return {
        "service": "AuraKinematics",
        "version": getattr(settings, "AURA_VERSION", "0.1.0"),
        "docs": "/docs",
        "health": "/api/v1/health",
    }
