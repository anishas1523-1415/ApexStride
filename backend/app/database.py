import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# The application requires a dual-engine architecture:
# 1. FastAPI uses asyncpg for non-blocking I/O during API routes.
# 2. Celery workers use psycopg2 for synchronous, multi-process compatible writes.

DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")  # local default for dev without docker
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DB_NAME = os.getenv("POSTGRES_DB", "aurakinematics")

# Check for production provided URL first
_PROD_URL = os.getenv("DATABASE_URL")

# Async Engine (For FastAPI)
if _PROD_URL:
    # If production url is provided (e.g., Neon/Supabase), convert it to asyncpg
    ASYNC_DATABASE_URL = _PROD_URL.replace("postgresql://", "postgresql+asyncpg://")
else:
    ASYNC_DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Sync Engine (For Celery Worker)
if _PROD_URL:
    # Use direct postgresql driver for sync engine or standard psycopg2
    SYNC_DATABASE_URL = _PROD_URL.replace("postgresql://", "postgresql+psycopg2://")
else:
    SYNC_DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    
sync_engine = create_engine(SYNC_DATABASE_URL, echo=False)
SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

# FastAPI Dependency
async def get_async_db():
    async with AsyncSessionLocal() as session:
        yield session
