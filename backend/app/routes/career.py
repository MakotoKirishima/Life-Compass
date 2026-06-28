from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Career
from app.schemas import CareerOut

router = APIRouter(prefix="/api/careers", tags=["careers"])

@router.get("/")
def list_careers(category: str = None, db: Session = Depends(get_db)):
    q = db.query(Career).filter(Career.status == "published")
    if category:
        q = q.filter(Career.category == category)
    careers = q.all()
    return [{"id": c.id, "title": c.title, "category": c.category, "description": (c.description or "")[:100] + "...", "market_prospect": c.market_prospect, "ai_risk": c.ai_risk} for c in careers]

@router.get("/{career_id}")
def get_career(career_id: int, db: Session = Depends(get_db)):
    c = db.query(Career).filter(Career.id == career_id).first()
    if not c:
        return {"error": "Not found"}, 404
    return {
        "id": c.id, "title": c.title, "category": c.category, "description": c.description,
        "common_tasks": c.common_tasks, "required_skills": c.required_skills,
        "optional_skills": c.optional_skills, "education_paths": c.education_paths,
        "salary_min": c.salary_min, "salary_max": c.salary_max,
        "market_prospect": c.market_prospect, "ai_risk": c.ai_risk,
        "entry_barriers": c.entry_barriers, "source_notes": c.source_notes,
        "status": c.status, "last_reviewed_at": str(c.last_reviewed_at) if c.last_reviewed_at else None
    }
