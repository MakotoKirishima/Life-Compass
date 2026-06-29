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

from app.routes import auth, discovery, career, admin, chatbot
app.include_router(auth.router)
app.include_router(discovery.router)
app.include_router(career.router)
app.include_router(admin.router)
app.include_router(chatbot.router)
@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0", "gemini_available": bool(settings.GEMINI_API_KEY)}

@app.get("/api/sample-report")
def sample_report():
    return {
        "summary": "Kamu memiliki minat di bidang teknologi dan kreativitas. Dengan skill analisa dan desain yang kamu miliki, beberapa karir menarik bisa kamu coba.",
        "top_recommendation": {"career_title": "UI/UX Designer", "score": 85, "label": "Cocok Tinggi", "reason": "Minat desain + skill analisa cocok dengan tugas utama UI/UX Designer"},
        "exploration": {"career_title": "Frontend Developer", "score": 72, "label": "Cocok Sedang", "reason": "Kreativitas dan ketelitianmu berguna di pengembangan frontend"},
        "risk_note": "Pastikan kamu meng-update skill secara berkala.",
        "experiment_plan": [
            "Hari 1: Cari 3 lowongan UI/UX Designer dan catat skill yang diminta",
            "Hari 2: Tonton 1 video tentang keseharian UI/UX Designer",
            "Hari 3: Coba redesign 1 aplikasi sederhana",
            "Hari 4: Hubungi 1 orang yang bekerja sebagai UI/UX Designer",
            "Hari 5: Baca artikel tentang perkembangan desain digital",
            "Hari 6: Bandingkan 2 jalur pendidikan",
            "Hari 7: Diskusikan dengan teman"
        ]
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
def update_profile(data: dict, current_user=Depends(auth.get_current_user), db=Depends(auth.get_db)):
    from app.models import UserProfile
    if "display_name" in data and data["display_name"]:
        current_user.display_name = data["display_name"]
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).order_by(UserProfile.created_at.desc()).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
    for key in ["stage", "education_level", "location", "interests", "work_values", "skills", "constraints", "work_preferences", "reflection"]:
        if key in data:
            setattr(profile, key, data[key])
    db.commit()
    return {"message": "Profile updated"}
