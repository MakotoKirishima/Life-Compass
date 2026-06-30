from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Career
from app.schemas import CareerOut

router = APIRouter(prefix="/api/careers", tags=["careers"])

@router.get("/")
def list_careers(category: str = None, search: str = None, min_ai_risk: str = None, remote: str = None, db: Session = Depends(get_db)):
    q = db.query(Career).filter(Career.status == "published")
    if category:
        q = q.filter(Career.category == category)
    if search:
        q = q.filter(Career.title.ilike(f"%{search}%") | Career.description.ilike(f"%{search}%"))
    if min_ai_risk:
        risk_map = {"Rendah": 0, "Sedang": 1, "Tinggi": 2}
        min_val = risk_map.get(min_ai_risk, 0)
        careers_list = q.all()
        result = []
        for c in careers_list:
            c_risk = risk_map.get(c.ai_risk or "Sedang", 1)
            if c_risk >= min_val:
                result.append(c)
        return [_career_summary(c) for c in result]
    careers = q.all()
    return [_career_summary(c) for c in careers]

def _career_summary(c):
    return {
        "id": c.id, "title": c.title, "category": c.category,
        "subcategories": c.subcategories or [],
        "description": ((c.description or "")[:150] + "...") if len(c.description or "") > 150 else (c.description or ""),
        "market_prospect": c.market_prospect,
        "ai_risk": c.ai_risk,
        "ai_displacement_score": c.ai_displacement_score,
        "remote_availability": c.remote_availability or "Rendah",
        "education_paths": (c.education_paths or [])[:2],
        "salary_entry": c.salary_entry,
        "salary_mid": c.salary_mid,
        "growth_rate_5yr": c.growth_rate_5yr,
        "holland_codes": (c.holland_codes or [])[:3],
        "work_life_balance": c.work_life_balance,
        "interview_difficulty": c.interview_difficulty,
    }

@router.get("/{career_id}")
def get_career(career_id: int, db: Session = Depends(get_db)):
    c = db.query(Career).filter(Career.id == career_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Career not found")
    return {
        "id": c.id, "title": c.title, "category": c.category, "description": c.description,
        "common_tasks": c.common_tasks, "required_skills": c.required_skills,
        "optional_skills": c.optional_skills, "education_paths": c.education_paths,
        "salary_min": c.salary_min, "salary_max": c.salary_max,
        "market_prospect": c.market_prospect, "ai_risk": c.ai_risk,
        "entry_barriers": c.entry_barriers, "source_notes": c.source_notes,
        "status": c.status, "last_reviewed_at": str(c.last_reviewed_at) if c.last_reviewed_at else None
    }
