from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Career
from app.auth import get_current_user, get_admin_user
from app.models import User

router = APIRouter(prefix="/api/careers", tags=["careers"])

@router.get("/")
def list_careers(category: str = "", db: Session = Depends(get_db)):
    q = db.query(Career).filter(Career.status == "published")
    if category:
        q = q.filter(Career.category == category)
    careers = q.all()
    return [
        {
            "id": c.id, "title": c.title, "category": c.category,
            "description": c.description[:100] + "..." if c.description and len(c.description) > 100 else c.description,
            "market_prospect": c.market_prospect
        }
        for c in careers
    ]

@router.get("/{career_id}")
def get_career(career_id: int, db: Session = Depends(get_db)):
    c = db.query(Career).filter(Career.id == career_id).first()
    if not c:
        return {"error": "Not found"}, 404
    return {
        "id": c.id, "title": c.title, "category": c.category,
        "description": c.description, "common_tasks": c.common_tasks,
        "required_skills": c.required_skills, "optional_skills": c.optional_skills,
        "education_paths": c.education_paths,
        "salary_min": c.salary_min, "salary_max": c.salary_max,
        "market_prospect": c.market_prospect, "ai_risk": c.ai_risk
    }

@router.post("/admin")
def create_career(data: dict, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    career = Career(
        title=data.get("title", ""), category=data.get("category", ""),
        description=data.get("description", ""),
        common_tasks=data.get("common_tasks", []),
        required_skills=data.get("required_skills", []),
        optional_skills=data.get("optional_skills", []),
        education_paths=data.get("education_paths", []),
        salary_min=data.get("salary_min"), salary_max=data.get("salary_max"),
        market_prospect=data.get("market_prospect", "Sedang"),
        ai_risk=data.get("ai_risk", "Sedang"),
        status="published"
    )
    db.add(career)
    db.commit()
    db.refresh(career)
    return {"id": career.id, "message": "Career created"}

@router.put("/admin/{career_id}")
def update_career(career_id: int, data: dict, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    career = db.query(Career).filter(Career.id == career_id).first()
    if not career:
        return {"error": "Not found"}, 404
    for key, val in data.items():
        if hasattr(career, key) and key != "id":
            setattr(career, key, val)
    db.commit()
    return {"message": "Updated"}

@router.delete("/admin/{career_id}")
def delete_career(career_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    career = db.query(Career).filter(Career.id == career_id).first()
    if career:
        db.delete(career)
        db.commit()
    return {"message": "Deleted"}
