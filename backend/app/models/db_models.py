from datetime import datetime
import uuid
from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    analyses = relationship("AnalysisRecord", back_populates="user", cascade="all, delete-orphan")


class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    sport_type = Column(String(50), nullable=False)
    overall_score = Column(Float, nullable=False)
    filename = Column(String, nullable=False)
    impact_timestamp = Column(Float, nullable=True)

    
    # Critical Fix: Use JSONB for heavily nested/large payloads
    video_metadata = Column(JSONB, nullable=False)
    critical_events = Column(JSONB, nullable=False)
    coaching_insights = Column(JSONB, nullable=False)
    kinematic_timeline = Column(JSONB, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="analyses")
