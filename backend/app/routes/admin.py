import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, CareerMatch, Career, LandingContent, Testimonial, AdminSetting
from app.auth import get_admin_user
from app.config import settings
from app.gemini import GEMINI_AVAILABLE, AI_AVAILABLE, AI_PROVIDER

from datetime import datetime

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats")
def get_stats(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    total_users = db.query(User).filter(User.deleted_at.is_(None)).count()
    completed = db.query(CareerMatch).distinct(CareerMatch.user_id).count()
    return {"total_users": total_users, "completed_discovery": completed}

@router.get("/users")
def list_users(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    users = db.query(User).filter(User.deleted_at.is_(None)).order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        result.append({"id": u.id, "email": u.email, "display_name": u.display_name, "created_at": str(u.created_at)})
    return result

@router.get("/users/{user_id}")
def get_user_detail(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    discoveries = db.query(CareerMatch).filter(CareerMatch.user_id == u.id).count()
    return {
        "id": u.id, "email": u.email, "display_name": u.display_name,
        "auth_provider": u.auth_provider, "created_at": str(u.created_at),
        "discovery_count": discoveries
    }

@router.put("/landing-page")
def update_landing_page(data: dict, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    lc = db.query(LandingContent).first()
    if not lc:
        lc = LandingContent()
        db.add(lc)
    for key in ["hero_title", "hero_subtitle", "cta_text"]:
        if key in data:
            setattr(lc, key, data[key])
    if "testimonials" in data and isinstance(data["testimonials"], list):
        db.query(Testimonial).delete()
        for t in data["testimonials"]:
            db.add(Testimonial(name=t.get("name", ""), text=t.get("text", ""), role=t.get("role", ""), sort_order=t.get("sort_order", 0)))
    db.commit()
    return {"message": "Landing page updated"}

@router.get("/landing-page")
def get_landing_page(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    lc = db.query(LandingContent).first()
    testimonials = db.query(Testimonial).order_by(Testimonial.sort_order).all()
    if not lc:
        return {"hero_title": "Temukan Arah Karirmu", "hero_subtitle": "Direction Map dalam 10 menit", "cta_text": "Mulai Sekarang", "testimonials": [{"name": t.name, "text": t.text, "role": t.role} for t in testimonials]}
    return {"hero_title": lc.hero_title, "hero_subtitle": lc.hero_subtitle, "cta_text": lc.cta_text, "testimonials": [{"name": t.name, "text": t.text, "role": t.role} for t in testimonials]}

@router.get("/careers")
def admin_list_careers(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    q = db.query(Career).order_by(Career.created_at.desc())
    careers = q.all()
    return [{"id": c.id, "title": c.title, "category": c.category, "description": (c.description or "")[:100], "market_prospect": c.market_prospect, "ai_risk": c.ai_risk, "status": c.status} for c in careers]

@router.post("/careers")
def admin_create_career(data: dict, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    career = Career(
        title=data.get("title", ""), category=data.get("category", ""),
        description=data.get("description", ""), common_tasks=data.get("common_tasks", []),
        required_skills=data.get("required_skills", []), optional_skills=data.get("optional_skills", []),
        education_paths=data.get("education_paths", []), salary_min=data.get("salary_min"),
        salary_max=data.get("salary_max"), market_prospect=data.get("market_prospect", "Sedang"),
        ai_risk=data.get("ai_risk", "Sedang"), entry_barriers=data.get("entry_barriers", []),
        source_notes=data.get("source_notes", []), status=data.get("status", "draft")
    )
    db.add(career)
    db.commit()
    db.refresh(career)
    settings.CAREER_DATA_VERSION += 1
    return {"id": career.id, "message": "Career created"}

@router.put("/careers/{career_id}")
def admin_update_career(career_id: int, data: dict, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    career = db.query(Career).filter(Career.id == career_id).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    for key in ["title", "category", "description", "common_tasks", "required_skills", "optional_skills", "education_paths", "salary_min", "salary_max", "market_prospect", "ai_risk", "entry_barriers", "source_notes", "status"]:
        if key in data:
            setattr(career, key, data[key])
    if data.get("status") == "published":
        career.last_reviewed_at = datetime.utcnow()
        settings.CAREER_DATA_VERSION += 1
    db.commit()
    return {"message": "Updated"}

@router.delete("/careers/{career_id}")
def admin_delete_career(career_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    career = db.query(Career).filter(Career.id == career_id).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    db.delete(career)
    db.commit()
    return {"message": "Deleted"}

@router.post("/careers/generate")
def admin_generate_career(data: dict, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    if not GEMINI_AVAILABLE:
        return {"description": f"{data.get('title', '')} adalah karir di bidang {data.get('category', '')} di Indonesia.", "common_tasks": ["Tugas harian", "Koordinasi", "Pelaporan"], "required_skills": ["Komunikasi", "Analisa"], "optional_skills": ["Kepemimpinan"], "education_paths": ["S1", "D3"], "salary_min": "Rp5.000.000", "salary_max": "Rp15.000.000", "market_prospect": "Sedang", "ai_risk": "Sedang"}
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = f"""Generate data karir untuk "{data.get('title')}" di bidang "{data.get('category')}" di Indonesia.
Output JSON: {{"description": str, "common_tasks": [str], "required_skills": [str], "optional_skills": [str], "education_paths": [str], "salary_min": str, "salary_max": str, "market_prospect": "Tinggi/Sedang/Rendah", "ai_risk": "Tinggi/Sedang/Rendah"}}
Bahasa Indonesia. Salary marked as 'Perkiraan/Estimasi'. Market prospect dan ai risk berdasarkan riset umum."""
    try:
        resp = model.generate_content(prompt)
        text = resp.text.strip()
        if text.startswith("```json"):
            text = text.split("```json")[1].split("```")[0]
        elif text.startswith("```"):
            text = text.split("```")[1].split("```")[0]
        return json.loads(text.strip())
    except Exception:
        return {"description": "Gagal generate", "common_tasks": [], "required_skills": [], "optional_skills": [], "education_paths": [], "salary_min": "", "salary_max": "", "market_prospect": "Sedang", "ai_risk": "Sedang"}

@router.get("/settings")
def get_settings(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    announcement = db.query(AdminSetting).filter(AdminSetting.key == "announcement").first()
    return {
        "ai_available": AI_AVAILABLE,
        "ai_provider": AI_PROVIDER,
        "gemini_available": GEMINI_AVAILABLE,
        "gemini_key_set": bool(settings.GEMINI_API_KEY),
        "r2_backup_enabled": settings.R2_BACKUP_ENABLED,
        "career_data_version": settings.CAREER_DATA_VERSION,
        "announcement": announcement.value if announcement else ""
    }

@router.put("/settings")
def update_settings(data: dict, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    for key, value in data.items():
        if key == "announcement":
            setting = db.query(AdminSetting).filter(AdminSetting.key == "announcement").first()
            if not setting:
                setting = AdminSetting(key="announcement")
                db.add(setting)
            setting.value = str(value)
    db.commit()
    return {"message": "Settings updated"}
