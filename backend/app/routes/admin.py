from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from app.database import get_db
from app.models import User, UserProfile, CareerMatch, Payment, UserEntitlement
from app.auth import get_admin_user

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats")
def get_stats(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    total_users = db.query(User).filter(User.deleted_at.is_(None)).count()
    completed = db.query(CareerMatch).distinct(CareerMatch.user_id).count()
    payments = db.query(Payment).filter(Payment.status == "completed").all()
    total_revenue = sum(p.amount for p in payments)

    return {
        "total_users": total_users,
        "completed_discovery": completed,
        "total_payments": len(payments),
        "revenue": total_revenue
    }

@router.get("/users")
def list_users(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    users = db.query(User).filter(User.deleted_at.is_(None)).order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        paid = db.query(UserEntitlement).filter(
            UserEntitlement.user_id == u.id,
            UserEntitlement.status == "active"
        ).first()
        result.append({
            "id": u.id, "email": u.email, "display_name": u.display_name,
            "created_at": str(u.created_at), "has_paid": bool(paid)
        })
    return result

@router.get("/payments")
def list_payments(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    payments = db.query(Payment).order_by(Payment.created_at.desc()).all()
    return [
        {
            "id": p.id, "user_id": p.user_id, "amount": p.amount,
            "status": p.status, "product_type": p.product_type,
            "created_at": str(p.created_at)
        }
        for p in payments
    ]

@router.put("/landing-page")
def update_landing_page(data: dict, admin: User = Depends(get_admin_user)):
    import json, os
    path = "landing_content.json"
    existing = {}
    if os.path.exists(path):
        with open(path) as f:
            existing = json.load(f)
    existing.update(data)
    with open(path, "w") as f:
        json.dump(existing, f, indent=2)
    return {"message": "Landing page updated", "data": existing}

@router.get("/landing-page")
def get_landing_page():
    import json, os
    path = "landing_content.json"
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return {
        "hero_title": "Temukan Arah Karirmu",
        "hero_subtitle": "Free Direction Map dalam 10 menit",
        "cta_text": "Mulai Sekarang",
        "testimonials": [],
        "price": 25000
    }

@router.post("/career/generate")
def generate_career(data: dict, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    from app.gemini import GEMINI_AVAILABLE
    if not GEMINI_AVAILABLE:
        return {
            "description": f"{data.get('title', '')} adalah karir di bidang {data.get('category', '')}.",
            "common_tasks": ["Tugas 1", "Tugas 2", "Tugas 3"],
            "required_skills": ["Skill A", "Skill B"],
            "optional_skills": ["Skill C"],
            "education_paths": ["Pendidikan formal", "Bootcamp"],
            "salary_min": "Rp5.000.000",
            "salary_max": "Rp15.000.000",
            "market_prospect": "Sedang",
            "ai_risk": "Sedang"
        }
    prompt = f"""Generate draf data karir untuk Indonesia dalam Bahasa Indonesia:
Nama: {data.get('title')}
Kategori: {data.get('category')}
Keyword: {data.get('keywords', '')}

Output JSON: {{"description": str, "common_tasks": [str], "required_skills": [str], "optional_skills": [str], "education_paths": [str], "salary_min": str, "salary_max": str, "market_prospect": "Tinggi/Sedang/Rendah", "ai_risk": "Tinggi/Sedang/Rendah"}}"""
    import google.generativeai as genai
    genai.configure(api_key="")
    from app.config import settings
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        try:
            resp = model.generate_content(prompt)
            import json
            text = resp.text.strip()
            if text.startswith("```json"):
                text = text.split("```json")[1].split("```")[0]
            elif text.startswith("```"):
                text = text.split("```")[1].split("```")[0]
            return json.loads(text.strip())
        except Exception:
            pass
    return {"description": "Data tidak tersedia", "common_tasks": [], "required_skills": [], "optional_skills": [], "education_paths": [], "salary_min": "", "salary_max": "", "market_prospect": "Sedang", "ai_risk": "Sedang"}
