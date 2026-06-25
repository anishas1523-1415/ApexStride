import os
import logging
from celery import shared_task
from app.worker import celery_app
from app.database import SyncSessionLocal
from app.models.db_models import AnalysisRecord
import uuid
import gc

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, name="analyze_video_task")
def analyze_video_task(self, video_path: str, sport_type: str, user_id: str) -> dict:
    try:
        self.update_state(state='PROGRESS', meta={'status': 'Analyzing video...'})
        # Import here to avoid circular imports between tasks and routes.analysis
        from app.routes.analysis import _run_pipeline
        response = _run_pipeline(video_path, sport_type)
        
        # 1. Upload to Supabase Storage
        from supabase import create_client, Client
        supabase_url = os.environ.get("SUPABASE_URL", "https://lfupiwhrfrowpnxrhxgf.supabase.co")
        supabase_key = os.environ.get("SUPABASE_ANON_KEY", "sb_publishable_L9vIcMWtWmxnvBmePdTVsQ_eq0oUXvF")
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Ensure bucket exists (or fails gracefully)
        try:
            supabase.storage.get_bucket("videos")
        except Exception:
            try:
                supabase.storage.create_bucket("videos")
            except:
                pass
                
        file_ext = os.path.splitext(video_path)[1]
        storage_path = f"{user_id}/{uuid.uuid4().hex}{file_ext}"
        
        with open(video_path, 'rb') as f:
            supabase.storage.from_("videos").upload(file=f, path=storage_path, file_options={"content-type": f"video/{file_ext[1:]}"})
            
        video_url = supabase.storage.from_("videos").get_public_url(storage_path)

        # 1.5 Generate Gemini Summary
        gemini_summary = None
        gemini_api_key = os.environ.get("GEMINI_API_KEY")
        if gemini_api_key:
            try:
                from google import genai
                client = genai.Client(api_key=gemini_api_key)
                insights_text = " ".join([i.message for i in response.coaching_insights])
                prompt = f"Act as an elite sports coach. Summarize this performance for a {sport_type} athlete who scored {response.overall_score}/100. Insights: {insights_text}. Keep it exactly 3 short sentences. Be encouraging but direct."
                gemini_res = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
                if gemini_res and gemini_res.text:
                    gemini_summary = gemini_res.text
            except Exception as e:
                logger.error(f"Gemini API error: {e}")

        # 2. Save to database using synchronous engine context manager
        with SyncSessionLocal() as db:
            from app.models.db_models import Achievement, UserAchievement
            
            record = AnalysisRecord(
                user_id=uuid.UUID(user_id),
                sport_type=sport_type,
                overall_score=response.overall_score,
                filename=os.path.basename(video_path),
                impact_timestamp=response.impact_timestamp,
                video_metadata=response.video_metadata.model_dump(),
                critical_events=[e.model_dump() for e in response.critical_events],
                coaching_insights=[i.model_dump() for i in response.coaching_insights],
                kinematic_timeline=[f.model_dump() for f in response.kinematic_timeline],
                video_url=video_url,
                gemini_summary=gemini_summary
            )
            db.add(record)
            
            # Evaluate Gamification
            achievements = db.query(Achievement).all()
            for ach in achievements:
                if response.overall_score >= ach.criteria_score_threshold:
                    # Check if already has it
                    existing = db.query(UserAchievement).filter_by(user_id=uuid.UUID(user_id), achievement_id=ach.id).first()
                    if not existing:
                        new_ua = UserAchievement(user_id=uuid.UUID(user_id), achievement_id=ach.id)
                        db.add(new_ua)
                        logger.info(f"User {user_id} unlocked achievement: {ach.title}")

            db.commit()

        response.gemini_summary = gemini_summary
        return response.model_dump()
    except Exception as e:
        logger.exception("Task failed.")
        raise
    finally:
        if video_path and os.path.exists(video_path):
            try:
                os.unlink(video_path)
            except OSError:
                pass
        
        # Explicit memory cleanup
        try:
            del response
        except NameError:
            pass
        gc.collect()
