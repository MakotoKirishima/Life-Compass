from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserProfile, CareerMatch, ExperimentPlan
from app.schemas import DiscoveryInput
from app.auth import get_current_user
from app.gemini import score_careers, generate_summary, generate_experiment_plan

router = APIRouter(prefix="/api/discovery", tags=["discovery"])

@router.post("/submit")
def submit_discovery(
    data: DiscoveryInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = UserProfile(
        user_id=current_user.id,
        stage=data.stage,
        education_level=data.education_level,
        location=data.location,
        interests=data.interests,
        work_values=data.work_values,
        skills=data.skills,
        constraints=data.constraints,
        work_preferences=data.work_preferences,
        reflection=data.reflection
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    profile_dict = {
        "stage": data.stage, "education_level": data.education_level,
        "location": data.location, "interests": data.interests,
        "work_values": data.work_values, "skills": data.skills,
        "constraints": data.constraints, "work_preferences": data.work_preferences
    }

    scored = score_careers(profile_dict, db)

    summary = generate_summary(profile_dict)

    match = CareerMatch(
        user_id=current_user.id,
        profile_snapshot=profile_dict,
        results=scored,
        is_free_visible=True
    )
    db.add(match)
    db.commit()
    db.refresh(match)

    top = scored[0] if scored else {"title": "Belum ada", "score": 0, "label": "Coba Dulu", "reason": ""}
    alt = scored[1] if len(scored) > 1 else scored[0] if scored else {"title": "Belum ada", "score": 0, "label": "Coba Dulu", "reason": ""}

    if scored:
        tasks = generate_experiment_plan(top["title"], profile_dict)
        plan = ExperimentPlan(
            user_id=current_user.id,
            match_id=match.id,
            career_title=top["title"],
            tasks=tasks
        )
        db.add(plan)
        db.commit()

    risk_notes = []
    for c in scored[:3]:
        if c.get("label") in ["Coba Dulu", "Kurang Cocok"]:
            risk_notes.append(f"{c['title']}: {c['reason']}")
    risk_note = "; ".join(risk_notes[:2]) or "Tidak ada risiko signifikan yang terdeteksi."

    return {
        "match_id": match.id,
        "summary": summary,
        "top_recommendation": {"career_title": top["title"], "score": top["score"], "label": top["label"], "reason": top["reason"]},
        "exploration": {"career_title": alt["title"], "score": alt["score"], "label": alt["label"], "reason": alt["reason"]},
        "risk_note": risk_note,
        "experiment_plan": tasks if scored else [],
        "is_paid_unlocked": False
    }

@router.get("/history")
def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    matches = db.query(CareerMatch).filter(
        CareerMatch.user_id == current_user.id
    ).order_by(CareerMatch.created_at.desc()).all()
    return [
        {
            "match_id": m.id,
            "created_at": str(m.created_at),
            "top_result": m.results[0]["title"] if m.results else "",
            "is_paid": not m.is_free_visible
        }
        for m in matches
    ]

@router.get("/result/{match_id}")
def get_result(match_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    match = db.query(CareerMatch).filter(
        CareerMatch.id == match_id, CareerMatch.user_id == current_user.id
    ).first()
    if not match:
        return {"error": "Not found"}, 404

    from app.models import UserEntitlement
    paid = db.query(UserEntitlement).filter(
        UserEntitlement.user_id == current_user.id,
        UserEntitlement.product_type == "full_report",
        UserEntitlement.status == "active"
    ).first()

    results = match.results or []
    top = results[0] if results else {}
    alt = results[1] if len(results) > 1 else results[0] if results else {}

    summary = match.profile_snapshot.get("_summary", "Ringkasan tidak tersedia")

    return {
        "match_id": match.id,
        "summary": summary,
        "top_recommendation": {"career_title": top.get("title",""), "score": top.get("score",0), "label": top.get("label",""), "reason": top.get("reason","")},
        "exploration": {"career_title": alt.get("title",""), "score": alt.get("score",0), "label": alt.get("label",""), "reason": alt.get("reason","")},
        "risk_note": "",
        "is_paid_unlocked": bool(paid)
    }
