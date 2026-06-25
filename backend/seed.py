"""
AuraKinematics – Database Seed Script
======================================
Seeds the gamification achievements and a dummy Ghost Baseline into the PostgreSQL database.
"""

import asyncio
import os
import sys

# Ensure backend directory is in sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import AsyncSessionLocal
from app.models.db_models import Achievement, GhostBaseline
from sqlalchemy.future import select

async def seed_data():
    async with AsyncSessionLocal() as db:
        # --- Seed Achievements ---
        achievements = [
            {
                "title": "Aura Initiate",
                "description": "Complete an analysis with a solid form score.",
                "icon": "🏅",
                "criteria_score_threshold": 50.0
            },
            {
                "title": "Mechanics Master",
                "description": "Achieve a biomechanical score over 75.",
                "icon": "🔥",
                "criteria_score_threshold": 75.0
            },
            {
                "title": "Kinematic Perfection",
                "description": "Achieve a near-perfect biomechanical score of 90+.",
                "icon": "💎",
                "criteria_score_threshold": 90.0
            }
        ]
        
        for ach in achievements:
            result = await db.execute(select(Achievement).filter(Achievement.title == ach["title"]))
            if not result.scalars().first():
                db.add(Achievement(**ach))
                print(f"Added achievement: {ach['title']}")
        
        # --- Seed Ghost Baseline ---
        # Provide a minimal dummy timeline so the app won't crash when querying
        # Real pro data would go here
        result = await db.execute(select(GhostBaseline).filter(GhostBaseline.sport_type == "cricket_cover_drive"))
        if not result.scalars().first():
            dummy_baseline = {
                "sport_type": "cricket_cover_drive",
                "kinematic_timeline": [
                    {
                        "landmarks": {
                            "LEFT_SHOULDER": {"x": 0.5, "y": 0.3, "z": 0, "visibility": 1.0},
                            "RIGHT_SHOULDER": {"x": 0.6, "y": 0.3, "z": 0, "visibility": 1.0},
                            "LEFT_ELBOW": {"x": 0.45, "y": 0.5, "z": 0, "visibility": 1.0},
                            "RIGHT_ELBOW": {"x": 0.65, "y": 0.5, "z": 0, "visibility": 1.0},
                            "LEFT_WRIST": {"x": 0.5, "y": 0.6, "z": 0, "visibility": 1.0},
                            "RIGHT_WRIST": {"x": 0.6, "y": 0.6, "z": 0, "visibility": 1.0},
                            "LEFT_HIP": {"x": 0.5, "y": 0.7, "z": 0, "visibility": 1.0},
                            "RIGHT_HIP": {"x": 0.6, "y": 0.7, "z": 0, "visibility": 1.0},
                            "LEFT_KNEE": {"x": 0.45, "y": 0.85, "z": 0, "visibility": 1.0},
                            "RIGHT_KNEE": {"x": 0.65, "y": 0.85, "z": 0, "visibility": 1.0},
                            "LEFT_ANKLE": {"x": 0.4, "y": 0.95, "z": 0, "visibility": 1.0},
                            "RIGHT_ANKLE": {"x": 0.7, "y": 0.95, "z": 0, "visibility": 1.0}
                        },
                        "joint_angles": []
                    }
                ]
            }
            db.add(GhostBaseline(**dummy_baseline))
            print("Added Ghost Baseline: cricket_cover_drive")

        await db.commit()
        print("Database seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
