import os
import logging
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.database import engine, Base
from app.config import settings
from app.auth import rate_limit_middleware

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("lifecompass")

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Life Compass API", version="1.0.0")

app.middleware("http")(rate_limit_middleware)
app.add_middleware(SecurityHeadersMiddleware)

origins = ["http://localhost:3000", "http://localhost:8000"]
if settings.APP_ENV == "production":
    origins = []
if settings.FRONTEND_URL and settings.FRONTEND_URL not in origins:
    origins.append(settings.FRONTEND_URL)
if settings.CORS_ALLOWED_ORIGINS:
    origins.extend([o.strip() for o in settings.CORS_ALLOWED_ORIGINS.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    os.makedirs(settings.DATA_DIR, exist_ok=True)
    _seed_initial_data()
    _seed_admin()
    _log_config_status()

def _log_config_status():
    required = ["SECRET_KEY", "REFRESH_TOKEN_SECRET"]
    optional = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI", "GEMINI_API_KEY"]
    deployment = ["COOKIE_DOMAIN", "CORS_ALLOWED_ORIGINS", "FRONTEND_URL", "API_PUBLIC_URL"]
    for key in required:
        if not getattr(settings, key, ""):
            logger.warning("%s is not set — authentication will fail", key)
        else:
            logger.info("%s is set", key)
    for key in optional:
        if not getattr(settings, key, ""):
            logger.info("%s is not set — related feature disabled", key)
        else:
            logger.info("%s is set", key)
    for key in deployment:
        if not getattr(settings, key, ""):
            logger.warning("%s is not set — deployment config incomplete", key)
        else:
            logger.info("%s is set", key)
    google_missing = []
    for key in ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI"]:
        if not getattr(settings, key, ""):
            google_missing.append(key)
    if google_missing:
        logger.info("Google OAuth not fully configured (missing: %s)", ", ".join(google_missing))
    else:
        logger.info("Google OAuth configured")

def _seed_initial_data():
    from sqlalchemy.orm import Session
    from app.database import SessionLocal
    from app.models import Career
    from app.init_data import INITIAL_CAREERS
    db: Session = SessionLocal()
    try:
        count = db.query(Career).count()
        if count == 0:
            for data in INITIAL_CAREERS:
                career = Career(**data, status="published")
                db.add(career)
            db.commit()
            logger.info("Seeded %d careers", len(INITIAL_CAREERS))
    finally:
        db.close()

def _seed_admin():
    from sqlalchemy.orm import Session
    from app.database import SessionLocal
    from app.models import User
    from app.auth import hash_password
    if not settings.INITIAL_ADMIN_EMAIL or not settings.INITIAL_ADMIN_PASSWORD:
        return
    db: Session = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == settings.INITIAL_ADMIN_EMAIL).first()
        if not existing:
            user = User(
                email=settings.INITIAL_ADMIN_EMAIL,
                display_name="Admin",
                password_hash=hash_password(settings.INITIAL_ADMIN_PASSWORD),
                auth_provider="email",
                role="admin"
            )
            db.add(user)
            db.commit()
            logger.info("Admin seeded")
    finally:
        db.close()

from app.schemas import ProfileUpdate
from app.routes import auth, discovery, career, admin, chatbot
app.include_router(auth.router)
app.include_router(discovery.router)
app.include_router(career.router)
app.include_router(admin.router)
app.include_router(chatbot.router)
@app.get("/api/health")
def health():
    from app.gemini import AI_AVAILABLE, AI_PROVIDER
    return {
        "status": "ok",
        "version": "1.0.0",
        "ai_available": AI_AVAILABLE,
        "ai_provider": AI_PROVIDER,
        "gemini_available": bool(settings.GEMINI_API_KEY),
    }

@app.get("/api/sample-report")
def sample_report():
    dims_uiux_v2 = {
        "skills_alignment": {"raw": 82, "confidence": 0.7},
        "interest_resonance": {"raw": 90, "confidence": 0.8},
        "values_alignment": {"raw": 75, "confidence": 0.6},
        "cognitive_fit": {"raw": 70, "confidence": 0.5},
        "education_alignment": {"raw": 60, "confidence": 0.8},
        "constraint_impact": {"raw": 85, "confidence": 0.7},
        "environment_fit": {"raw": 78, "confidence": 0.6},
        "market_timing": {"raw": 72, "confidence": 0.4},
        "trajectory_alignment": {"raw": 65, "confidence": 0.4},
    }
    dims_frontend_v2 = {
        "skills_alignment": {"raw": 70, "confidence": 0.6},
        "interest_resonance": {"raw": 75, "confidence": 0.7},
        "values_alignment": {"raw": 65, "confidence": 0.5},
        "cognitive_fit": {"raw": 72, "confidence": 0.5},
        "education_alignment": {"raw": 60, "confidence": 0.8},
        "constraint_impact": {"raw": 60, "confidence": 0.6},
        "environment_fit": {"raw": 82, "confidence": 0.6},
        "market_timing": {"raw": 80, "confidence": 0.5},
        "trajectory_alignment": {"raw": 70, "confidence": 0.4},
    }
    tier1 = [
        {"career_id": 3, "title": "UI/UX Designer",
         "feasibility_flag": "REACHABLE_NOW", "feasibility_reason": "Pendidikan dan skill dasar sesuai",
         "final_adjusted_score": 78, "weighted_raw_score": 85, "confidence_score": 0.78,
         "confidence_band": [65, 88], "tier": 1, "label": "Strong Match — Start Now",
         "headline": "UI/UX Designer cocok denganmu karena minat desain dan analisa yang kuat.",
         "reasoning": ["Minat desain + skill analisa cocok dengan tugas utama UI/UX Designer",
                       "Skill Figma bisa dipelajari dalam 2-3 bulan",
                       "Prospek pasar UI/UX di Indonesia sedang naik (+18% year-over-year)"],
         "dimensions": dims_uiux_v2,
         "gap_analysis": {
             "skills": {"critical_gaps": [
                 {"skill": "Figma", "severity": "High", "close_pathway": "Ikuti tutorial Figma (gratis) dan buat 1 portofolio case study",
                  "estimated_time": "2-3 bulan", "cost": "Gratis"},
                 {"skill": "User Research", "severity": "High", "close_pathway": "Praktik wawancara dengan 3 teman",
                  "estimated_time": "1 bulan", "cost": "Gratis"},
             ], "important_gaps": [], "accelerator_gaps": [], "anti_skill_conflicts": []},
             "education": {"user_level": "SMA/SMK", "career_typical": "S1 Desain Komunikasi Visual, Bootcamp UI/UX",
                           "career_minimum": "Bootcamp/Portofolio", "recommendation": "Bootcamp atau kursus online + portofolio",
                           "estimated_time": "6-12 bulan", "estimated_cost": "Rp 1-5 juta"},
             "portfolio": {"missing": [], "present": []},
             "interview": {"technical_readiness": "Perlu persiapan", "behavioral_readiness": "Perlu persiapan",
                           "domain_readiness": "Perlu persiapan", "gaps": []},
             "timeline": {"total_months": 6, "milestones": [], "urgent_path": None},
         },
         "hiring_readiness": None, "personalized_timeline": None},
    ]
    tier2 = [
        {"career_id": 1, "title": "Frontend Developer",
         "feasibility_flag": "REACHABLE_NEAR", "feasibility_reason": "Butuh skill programming dasar",
         "final_adjusted_score": 68, "weighted_raw_score": 72, "confidence_score": 0.65,
         "confidence_band": [55, 80], "tier": 2, "label": "Good Match — Invest to Get There",
         "headline": "Frontend Developer: butuh belajar coding, tapi kreativitasmu jadi nilai plus.",
         "reasoning": ["Kreativitas dan ketelitianmu berguna di pengembangan frontend",
                       "Butuh belajar HTML/CSS/JavaScript — estimasi 3-6 bulan"],
         "dimensions": dims_frontend_v2,
         "gap_analysis": None, "hiring_readiness": None, "personalized_timeline": None},
    ]
    return {
        "match_id": 0, "summary": "Kamu memiliki minat di bidang teknologi dan kreativitas. Dengan 9 dimensi penilaian dan 3-pass scoring engine, kami menemukan bahwa UI/UX Designer adalah rekomendasi utama — dengan feasibility REACHABLE_NOW. Gap utama: Figma dan User Research. Timeline: 6 bulan ke hiring-ready.",
        "assessment_version": "v2",
        "top_recommendation": {"career_title": "UI/UX Designer", "score": 78, "label": "Strong Match — Start Now", "reason": "Minat desain + skill analisa cocok dengan tugas utama UI/UX Designer"},
        "exploration": {"career_title": "Frontend Developer", "score": 68, "label": "Good Match — Invest to Get There", "reason": "Kreativitas dan ketelitianmu berguna di pengembangan frontend"},
        "risk_note": "Pastikan kamu meng-update skill secara berkala. Beberapa posisi mungkin memerlukan portofolio yang kuat. AI displacement risk UI/UX: Rendah (20%).",
        "experiment_plan": [
            "Hari 1: Cari 3 lowongan UI/UX Designer di Glints/Jobstreet, catat skill yang paling sering diminta",
            "Hari 2: Tonton 1 video YouTube 'Day in the Life' UI/UX Designer dari praktisi Indonesia",
            "Hari 3: Coba redesign 1 halaman aplikasi favoritmu pakai Figma (gratis)",
            "Hari 4: Cari dan follow 3 desainer Indonesia di LinkedIn/Dribbble, amati portofolio mereka",
            "Hari 5: Baca 1 artikel tentang perbedaan UI vs UX di Medium atau Glints Blog",
            "Hari 6: Ikuti 1 tutorial Figma pemula (30 menit) dan buat satu komponen sederhana",
            "Hari 7: Tulis refleksi: apa yang paling kamu suka dari minggu ini? Masih tertarik?"
        ],
        "results": [
            {"title": "UI/UX Designer", "score": 78, "label": "Strong Match — Start Now", "reason": "Minat desain + skill analisa cocok", "dimensions": dims_uiux_v2, "feasibility_flag": "REACHABLE_NOW", "tier": 1, "final_adjusted_score": 78, "confidence_band": [65, 88]},
            {"title": "Frontend Developer", "score": 68, "label": "Good Match — Invest to Get There", "reason": "Kreativitas dan ketelitianmu berguna", "dimensions": dims_frontend_v2, "feasibility_flag": "REACHABLE_NEAR", "tier": 2, "final_adjusted_score": 68, "confidence_band": [55, 80]},
        ],
        "tier1": tier1, "tier2": tier2, "tier3": [],
        "gap_analysis": tier1[0]["gap_analysis"],
        "pivot_map": {"UI/UX Designer": ["Frontend Developer (Adjacent)", "Product Manager (Aspiration)"]},
    }

@app.get("/api/user/profile")
def get_profile(current_user=Depends(auth.get_current_user), db=Depends(auth.get_db)):
    from app.models import UserProfile
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).order_by(UserProfile.created_at.desc()).first()
    return {
        "display_name": current_user.display_name,
        "email": current_user.email,
        "stage": profile.stage if profile else None,
        "interests": profile.interests if profile else [],
        "skills": profile.skills if profile else [],
        "work_values": profile.work_values if profile else [],
    }

@app.put("/api/user/profile")
def update_profile(data: ProfileUpdate, current_user=Depends(auth.get_current_user), db=Depends(auth.get_db)):
    from app.models import UserProfile
    update_data = data.model_dump(exclude_unset=True)
    if "display_name" in update_data and update_data["display_name"]:
        current_user.display_name = update_data["display_name"]
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).order_by(UserProfile.created_at.desc()).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
    for key in ["stage", "education_level", "location", "interests", "work_values", "skills", "constraints", "work_preferences", "reflection"]:
        if key in update_data:
            setattr(profile, key, update_data[key])
    db.commit()
    return {"message": "Profile updated"}
