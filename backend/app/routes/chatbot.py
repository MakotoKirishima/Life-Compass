from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ChatLog, CareerMatch
from app.schemas import ChatRequest, ChatResponse
from app.gemini import chat_response, chat_response_stream
from app.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/api/chat", tags=["chat"])

class InterviewRequest(BaseModel):
    career_title: str
    user_answer: Optional[str] = None
    question: Optional[str] = None

class ResumeRequest(BaseModel):
    career_title: str
    cv_text: str

@router.post("/")
def chat(req: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ctx = _build_context(current_user, db)
    answer = chat_response(req.question, ctx if ctx else None, db=db)
    log = ChatLog(user_id=current_user.id, question=req.question, answer=answer)
    db.add(log)
    db.commit()
    return ChatResponse(answer=answer)

@router.post("/stream")
def chat_stream(req: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ctx = _build_context(current_user, db)
    async def generate():
        full = ""
        for chunk in chat_response_stream(req.question, ctx if ctx else None):
            full += chunk
            yield f"data: {chunk}\n\n"
        # Log full response
        log = ChatLog(user_id=current_user.id, question=req.question, answer=full)
        db.add(log)
        db.commit()
        yield "data: [DONE]\n\n"
    return StreamingResponse(generate(), media_type="text/event-stream")

def _build_context(current_user, db) -> dict:
    ctx = {}
    latest = db.query(CareerMatch).filter(CareerMatch.user_id == current_user.id).order_by(CareerMatch.created_at.desc()).first()
    if latest:
        results = latest.results or []
        top = results[0] if results else {}
        snapshot = latest.profile_snapshot or {}
        ctx = {
            "stage": snapshot.get("stage", ""),
            "education_level": snapshot.get("education_level", ""),
            "location": snapshot.get("location", ""),
            "interests": snapshot.get("interests", []),
            "skills": snapshot.get("skills", []),
            "skills_demonstrated": snapshot.get("skills_demonstrated", []),
            "constraints": snapshot.get("constraints", []),
            "weekly_hours_available": snapshot.get("weekly_hours_available", 0),
            "runway_months": snapshot.get("runway_months", ""),
            "success_definition": snapshot.get("success_definition", ""),
            "values_hierarchy": snapshot.get("values_hierarchy", []),
            "anti_skills": snapshot.get("anti_skills", []),
            "top_result": top.get("title", ""),
            "top_score": top.get("score", 0),
            "top_label": top.get("label", ""),
            "gap_analysis": latest.gap_analysis,
        }
    return ctx

@router.post("/interview")
def interview_simulator(req: InterviewRequest, current_user: User = Depends(get_current_user)):
    from app.gemini import _call_gemini, GEMINI_AVAILABLE
    if req.user_answer and req.question:
        # Evaluate user's answer
        prompt = f"""Kamu adalah HRD yang mewawancarai kandidat untuk posisi {req.career_title}.
Pertanyaan yang diajukan: "{req.question}"
Jawaban kandidat: "{req.user_answer}"

Evaluasi jawaban ini secara konstruktif. Beri skor 1-10 untuk:
1. Relevansi jawaban terhadap pertanyaan
2. Kemampuan storytelling / konkritnya contoh
3. Kesan profesional

Format JSON: {{"score": int, "strengths": [str], "improvements": [str], "example_answer": str}}"""
        result = _call_gemini(prompt)
        if result:
            from app.gemini import _clean_json
            import json
            try:
                cleaned = _clean_json(result)
                data = json.loads(cleaned)
                return data
            except (json.JSONDecodeError, TypeError):
                pass
        return {"score": 5, "strengths": ["Sudah mencoba menjawab"], "improvements": ["Lebih spesifik dengan contoh nyata"], "example_answer": "Coba gunakan formula STAR (Situation, Task, Action, Result) untuk struktur jawabanmu."}
    else:
        # Generate interview question
        prompt = f"""Kamu adalah HRD yang mewawancarai untuk posisi {req.career_title}.
Buat 1 pertanyaan behavioral/teknis yang menantang untuk kandidat.
Gunakan Bahasa Indonesia.
Pertanyaan harus spesifik untuk karir {req.career_title} dan menggali pengalaman nyata kandidat.
Output JSON: {{"question": str, "what_we_look_for": str, "tips": str}}"""
        result = _call_gemini(prompt)
        if result:
            from app.gemini import _clean_json
            import json
            try:
                cleaned = _clean_json(result)
                data = json.loads(cleaned)
                return data
            except (json.JSONDecodeError, TypeError):
                pass
        return {"question": f"Ceritakan pengalamanmu yang relevan dengan posisi {req.career_title}.", "what_we_look_for": "Contoh konkret tentang dampak yang pernah kamu buat.", "tips": "Gunakan metode STAR."}

@router.post("/resume-roast")
def resume_roaster(req: ResumeRequest, current_user: User = Depends(get_current_user)):
    from app.gemini import _call_gemini, GEMINI_AVAILABLE
    prompt = f"""Kamu adalah Senior Recruiter spesialis {req.career_title}. Analisis CV berikut dan beri kritik jujur.

CV:
```
{req.cv_text[:3000]}
```

Output JSON:
{{
    "overall_score": int (1-10),
    "strengths": [str],
    "critical_issues": [str],
    "quick_fixes": [str],
    "ats_optimization": str,
    "suggested_headline": str
}}

Gunakan Bahasa Indonesia yang konstruktif (tidak menyakitkan, tapi jujur)."""
    result = _call_gemini(prompt)
    if result:
        from app.gemini import _clean_json
        import json
        try:
            cleaned = _clean_json(result)
            data = json.loads(cleaned)
            return data
        except (json.JSONDecodeError, TypeError):
            pass
    return {
        "overall_score": 6,
        "strengths": ["CV sudah terstruktur dengan baik"],
        "critical_issues": ["Kurang kata kunci spesifik untuk ATS", "Pencapaian lebih baik dalam angka"],
        "quick_fixes": ["Tambahkan angka pada setiap pencapaian", "Sesuaikan kata kunci dengan deskripsi pekerjaan target"],
        "ats_optimization": "Tambahkan kata kunci dari job description target di bagian skills.",
        "suggested_headline": f"{req.career_title} | [Skill Utama] Spesialis"
    }
