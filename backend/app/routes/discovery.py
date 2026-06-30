from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserProfile, CareerMatch, ExperimentPlan, ExperimentTaskStatus
from app.schemas import DiscoveryInput, ExperimentPlanOut, ExperimentTaskUpdate, PhaseInsightRequest, ChallengeRequest, ChallengeResponse
from app.auth import get_current_user
from app.gemini import score_careers, score_careers_v2, generate_summary, generate_experiment_plan, generate_phase_insight

router = APIRouter(prefix="/api/discovery", tags=["discovery"])

@router.post("/submit")
def submit_discovery(data: DiscoveryInput, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = UserProfile(
        user_id=current_user.id, stage=data.stage, education_level=data.education_level,
        location=data.location, interests=data.interests, work_values=data.work_values,
        skills=data.skills, constraints=data.constraints, work_preferences=data.work_preferences,
        reflection=data.reflection,
        # v2 fields
        weekly_hours_available=data.weekly_hours_available,
        runway_months=data.runway_months,
        success_definition=data.success_definition,
        aspirational_self=data.aspirational_self,
        perceived_barriers=data.perceived_barriers,
        skills_demonstrated=data.skills_demonstrated,
        skills_in_progress=data.skills_in_progress,
        anti_skills=data.anti_skills,
        activity_interests=data.activity_interests,
        problem_interests=data.problem_interests,
        values_hierarchy=data.values_hierarchy,
        assessment_version="v2",
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    profile_dict = {
        "stage": data.stage, "education_level": data.education_level,
        "location": data.location, "interests": data.interests,
        "work_values": data.work_values, "skills": data.skills,
        "constraints": data.constraints, "work_preferences": data.work_preferences,
        "reflection": data.reflection,
        "weekly_hours_available": data.weekly_hours_available,
        "runway_months": data.runway_months,
        "success_definition": data.success_definition,
        "aspirational_self": data.aspirational_self,
        "perceived_barriers": data.perceived_barriers or [],
        "skills_demonstrated": data.skills_demonstrated or [],
        "skills_in_progress": data.skills_in_progress or [],
        "anti_skills": data.anti_skills or [],
        "activity_interests": data.activity_interests or [],
        "problem_interests": data.problem_interests or [],
        "values_hierarchy": data.values_hierarchy or [],
    }

    # Use v2 scoring engine
    report = score_careers_v2(profile_dict, db)
    exploration = report.get("exploration_mode")

    # If exploration mode triggered, return micro-experiments instead
    if exploration and exploration.get("exploration_mode"):
        return {
            "match_id": 0, "summary": exploration.get("message", ""),
            "assessment_version": "v2", "exploration_mode": True,
            "micro_experiments": exploration.get("micro_experiments", []),
            "results": [], "tier1": [], "tier2": [], "tier3": [],
            "experiment_plan": [e.get("action_steps", "") for e in exploration.get("micro_experiments", []) if e.get("action_steps")],
        }

    summary = generate_summary(profile_dict)
    all_tier1 = report.get("tier1", [])
    all_tier2 = report.get("tier2", [])
    all_tier3 = report.get("tier3", [])
    all_results = all_tier1 + all_tier2 + all_tier3

    # Flatten to backward-compatible format
    flat_results = [
        {"career_id": r["career_id"], "title": r["title"],
         "score": r["final_adjusted_score"], "label": r["label"],
         "reason": r["headline"], "feasibility": r["feasibility_flag"],
         "dimensions": {k: {"raw": v.get("raw", 50) if isinstance(v, dict) else 50, "confidence": v.get("confidence", 0.5) if isinstance(v, dict) else 0.5}
                        for k, v in r.get("dimensions", {}).items()},
         "tier": r["tier"], "confidence_band": r.get("confidence_band", [0, 0]),
         "gap_analysis": r.get("gap_analysis")}
        for r in all_results
    ]

    match = CareerMatch(user_id=current_user.id, profile_snapshot=profile_dict,
                        results=flat_results,
                        pivot_map=report.get("pivot_map"),
                        gap_analysis=report.get("gap_analysis"),
                        is_free_visible=True)
    db.add(match)
    db.commit()
    db.refresh(match)

    top = flat_results[0] if flat_results else {"title": "Belum ada", "score": 0, "label": "", "reason": ""}
    alt = flat_results[1] if len(flat_results) > 1 else (flat_results[0] if flat_results else {"title": "", "score": 0, "label": "", "reason": ""})

    tasks = []
    if flat_results:
        tasks = generate_experiment_plan(top["title"], profile_dict)
        plan = ExperimentPlan(user_id=current_user.id, match_id=match.id, career_title=top["title"], tasks=tasks)
        db.add(plan)
        db.commit()

    risk_notes = []
    for c in flat_results[:3]:
        label = c.get("label", "")
        if "Conditional" in label or "Moderate" in label:
            risk_notes.append(f"{c['title']}: {c.get('reason', '')}")
    risk_note = "; ".join(risk_notes[:2]) or "Tidak ada risiko signifikan yang terdeteksi."

    # Collect survival strategy and transferable skills from tier 1 results
    survival_strategy = None
    transferable_skills = None
    if all_tier1 and len(all_tier1) > 0:
        survival_strategy = all_tier1[0].get("survival_strategy")
        transferable_skills = all_tier1[0].get("transferable_skills")

    return {
        "match_id": match.id, "summary": summary,
        "assessment_version": "v2",
        "top_recommendation": {"career_title": top["title"], "score": top.get("score", 0), "label": top.get("label", ""), "reason": top.get("reason", "")},
        "exploration": {"career_title": alt["title"], "score": alt.get("score", 0), "label": alt.get("label", ""), "reason": alt.get("reason", "")},
        "risk_note": risk_note, "experiment_plan": tasks, "results": flat_results,
        "tier1": all_tier1, "tier2": all_tier2, "tier3": all_tier3,
        "survival_strategy": survival_strategy, "transferable_skills": transferable_skills,
        "context_flags": report.get("context_flags"),
        "dynamic_weights": report.get("dynamic_weights"),
    }

@router.get("/history")
def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    matches = db.query(CareerMatch).filter(CareerMatch.user_id == current_user.id).order_by(CareerMatch.created_at.desc()).all()
    result = []
    for m in matches:
        top = m.results[0] if m.results else {}
        result.append({
            "match_id": m.id, "created_at": str(m.created_at),
            "top_result": top.get("title", ""),
            "score": top.get("score"),
            "label": top.get("label"),
        })
    return result

@router.get("/result/{match_id}")
def get_result(match_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    match = db.query(CareerMatch).filter(CareerMatch.id == match_id, CareerMatch.user_id == current_user.id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Result not found")
    results = match.results or []
    snapshot = match.profile_snapshot or {}
    top = results[0] if results else {}
    alt = results[1] if len(results) > 1 else (results[0] if results else {})
    summary = generate_summary(snapshot)
    plans = db.query(ExperimentPlan).filter(ExperimentPlan.match_id == match_id).all()
    experiment_plans = [p.tasks for p in plans if p.tasks]
    experiment_plan = experiment_plans[0] if experiment_plans else []
    risk_notes = []
    for c in results[:3]:
        if c.get("label") in ["Coba Dulu", "Kurang Cocok"] or "Conditional" in c.get("label", ""):
            risk_notes.append(f"{c['title']}: {c.get('reason', '')}")
    risk_note = "; ".join(risk_notes[:2]) or "Tidak ada risiko signifikan yang terdeteksi."
    # Extract tier1 results with gap analysis
    tier1 = [r for r in results if r.get("tier") == 1][:5]
    tier2 = [r for r in results if r.get("tier") == 2][:10]
    # Extract survival strategy and transferable skills from stored results
    survival_strategy = None
    transferable_skills = None
    tier1_results = [r for r in results if r.get("tier") == 1][:5]
    if tier1_results:
        survival_strategy = tier1_results[0].get("survival_strategy")
        transferable_skills = tier1_results[0].get("transferable_skills")

    return {
        "match_id": match.id, "summary": summary,
        "assessment_version": "v2",
        "top_recommendation": {"career_title": top.get("title", ""), "score": top.get("score", 0), "label": top.get("label", ""), "reason": top.get("reason", "")},
        "exploration": {"career_title": alt.get("title", ""), "score": alt.get("score", 0), "label": alt.get("label", ""), "reason": alt.get("reason", "")},
        "risk_note": risk_note, "results": results, "experiment_plan": experiment_plan,
        "tier1": tier1_results, "tier2": [r for r in results if r.get("tier") == 2][:10],
        "gap_analysis": match.gap_analysis,
        "pivot_map": match.pivot_map,
        "survival_strategy": survival_strategy,
        "transferable_skills": transferable_skills,
    }

@router.get("/experiments")
def get_experiments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plans = db.query(ExperimentPlan).filter(ExperimentPlan.user_id == current_user.id).order_by(ExperimentPlan.created_at.desc()).all()
    result = []
    for p in plans:
        task_status = db.query(ExperimentTaskStatus).filter(ExperimentTaskStatus.plan_id == p.id).all()
        status_map = {ts.task_index: ts for ts in task_status}
        tasks_with_status = []
        for i, task in enumerate(p.tasks or []):
            ts = status_map.get(i)
            tasks_with_status.append({"index": i, "task": task, "done": ts.done if ts else False, "note": ts.note if ts else None})
        result.append({
            "id": p.id, "match_id": p.match_id, "career_title": p.career_title,
            "tasks": p.tasks, "task_status": tasks_with_status, "status": p.status,
            "completion_rate": p.completion_rate, "created_at": str(p.created_at)
        })
    return result

@router.put("/experiments/{plan_id}/tasks/{task_index}")
def update_task(plan_id: int, task_index: int, data: ExperimentTaskUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.query(ExperimentPlan).filter(ExperimentPlan.id == plan_id, ExperimentPlan.user_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    ts = db.query(ExperimentTaskStatus).filter(ExperimentTaskStatus.plan_id == plan_id, ExperimentTaskStatus.task_index == task_index).first()
    if not ts:
        ts = ExperimentTaskStatus(plan_id=plan_id, task_index=task_index)
        db.add(ts)
    ts.done = data.done
    ts.note = data.note
    db.commit()
    return {"message": "Updated"}

@router.post("/insight")
def phase_insight(data: PhaseInsightRequest, current_user: User = Depends(get_current_user)):
    insight = generate_phase_insight(data.phase_id, data.answers)
    return {"insight": insight}

@router.post("/challenge")
def challenge_score(data: ChallengeRequest, current_user: User = Depends(get_current_user)):
    from app.gemini import evaluate_challenge
    result = evaluate_challenge(data.career_title, data.user_argument, data.original_score, data.dimensions)
    return result
