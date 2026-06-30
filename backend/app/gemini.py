import json
import hashlib
import re
import math
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.config import settings
from app.models import Career, CacheEntry, DeterministicCache, SemanticCache

# --- Gemini AI Provider ---
GEMINI_AVAILABLE = False
_gemini_model = None

if settings.GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        GEMINI_AVAILABLE = True
    except Exception:
        pass

AI_AVAILABLE = GEMINI_AVAILABLE
AI_PROVIDER = "gemini" if GEMINI_AVAILABLE else "fallback"

def _call_gemini(prompt: str) -> str:
    if not GEMINI_AVAILABLE or not _gemini_model:
        return ""
    try:
        resp = _gemini_model.generate_content(prompt)
        return resp.text
    except Exception:
        return ""

def _call_gemini_stream(prompt: str):
    """Generator untuk streaming response dari Gemini."""
    if not GEMINI_AVAILABLE or not _gemini_model:
        yield ""
        return
    try:
        resp = _gemini_model.generate_content(prompt, stream=True)
        for chunk in resp:
            if chunk.text:
                yield chunk.text
    except Exception:
        yield ""

def _clean_json(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned.split("```json")[1].split("```")[0]
    elif cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1].split("```")[0]
    return cleaned.strip()

# --- Caching ---

def _get_cache(key: str, db: Session) -> dict | None:
    if not settings.CACHE_ENABLED:
        return None
    entry = db.query(CacheEntry).filter(CacheEntry.cache_key == key).first()
    return entry.data if entry else None

def _set_cache(key: str, data: dict, db: Session):
    if not settings.CACHE_ENABLED:
        return
    existing = db.query(CacheEntry).filter(CacheEntry.cache_key == key).first()
    if existing:
        existing.data = data
    else:
        db.add(CacheEntry(cache_key=key, data=data))
    db.commit()

# --- Deterministic Hash Cache (Section 3.3) ---

def _get_deterministic(prompt_key: str, params: dict, db: Session) -> dict | None:
    if not settings.CACHE_ENABLED:
        return None
    param_str = json.dumps(params, sort_keys=True, default=str)
    hash_key = hashlib.sha256(f"{prompt_key}:{param_str}".encode()).hexdigest()
    entry = db.query(DeterministicCache).filter(
        DeterministicCache.hash_key == hash_key,
        DeterministicCache.expires_at > datetime.utcnow()
    ).first()
    return entry.response_json if entry else None

def _set_deterministic(prompt_key: str, params: dict, response: dict, db: Session, expiry_days: int = 30):
    if not settings.CACHE_ENABLED:
        return
    param_str = json.dumps(params, sort_keys=True, default=str)
    hash_key = hashlib.sha256(f"{prompt_key}:{param_str}".encode()).hexdigest()
    existing = db.query(DeterministicCache).filter(DeterministicCache.hash_key == hash_key).first()
    if existing:
        existing.response_json = response
        existing.expires_at = datetime.utcnow() + timedelta(days=expiry_days)
    else:
        db.add(DeterministicCache(
            hash_key=hash_key, response_json=response,
            prompt_key=prompt_key,
            expires_at=datetime.utcnow() + timedelta(days=expiry_days)
        ))
    db.commit()

# --- Semantic Cache (Section 3.4) ---

def _get_embedding(text: str) -> list[float]:
    """Generate embedding vector via Gemini embedding API."""
    if not GEMINI_AVAILABLE:
        return []
    try:
        import google.generativeai as genai
        result = genai.embed_content(model="models/embedding-001", content=text)
        return result["embedding"]
    except Exception:
        return []

def _cosine_similarity(a: list[float], b: list[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)

def _get_semantic_cache(prompt: str, db: Session, threshold: float = 0.92) -> str | None:
    """Semantic cache: cari prompt mirip via cosine similarity di RAM."""
    if not settings.CACHE_ENABLED:
        return None
    embedding = _get_embedding(prompt)
    if not embedding:
        return None
    entries = db.query(SemanticCache).order_by(SemanticCache.created_at.desc()).limit(500).all()
    best_match = None
    best_sim = 0.0
    for e in entries:
        if not e.embedding:
            continue
        sim = _cosine_similarity(embedding, e.embedding)
        if sim > best_sim:
            best_sim = sim
            best_match = e
    if best_match and best_sim > threshold:
        best_match.hit_count = (best_match.hit_count or 1) + 1
        db.commit()
        return best_match.response_text
    return None

def _set_semantic_cache(prompt: str, response: str, db: Session):
    """Simpan prompt + embedding + response ke semantic cache."""
    if not settings.CACHE_ENABLED:
        return
    embedding = _get_embedding(prompt)
    if not embedding:
        return
    cache_key = hashlib.sha256(prompt.encode()).hexdigest()
    existing = db.query(SemanticCache).filter(SemanticCache.cache_key == cache_key).first()
    if existing:
        existing.response_text = response
        existing.hit_count = (existing.hit_count or 1) + 1
    else:
        db.add(SemanticCache(cache_key=cache_key, prompt_text=prompt, embedding=embedding,
                              response_text=response, model_used="gemini-1.5-flash"))
    db.commit()

def _parse_salary(salary_str: str | None) -> int | None:
    if not salary_str:
        return None
    digits = "".join(c for c in salary_str if c.isdigit() or c == ".")
    if not digits:
        return None
    return int(float(digits.replace(".", "")))

def _education_level_matches(education_level: str | None, career_education_paths: list) -> bool:
    if not education_level or not career_education_paths:
        return False
    el = education_level.lower()
    paths_lower = [p.lower() for p in career_education_paths]
    if "sma" in el or "smk" in el:
        return any("sma" in p or "smk" in p or "bootcamp" in p or "d3" in p for p in paths_lower)
    if "mahasiswa" in el or "s1" in el or "sarjana" in el:
        return any("s1" in p or "sarjana" in p for p in paths_lower)
    if "d3" in el or "diploma" in el:
        return any("d3" in p or "diploma" in p for p in paths_lower)
    if "s2" in el or "magister" in el:
        return any("s2" in p or "magister" in p for p in paths_lower)
    return False

# ======================================================================
# Section 4.1: Context Extraction (Gemini JSON Mode)
# ======================================================================

_context_schema = {
    "type": "object",
    "properties": {
        "contexts": {
            "type": "array",
            "items": {"type": "string", "enum": [
                "high_financial_urgency", "forced_career_change", "career_explorer_student",
                "career_switcher", "fresh_graduate", "low_confidence_profile",
                "high_autonomy_seeker", "risk_averse", "location_bound", "caregiver"
            ]}
        },
        "urgency_level": {"type": "integer", "minimum": 1, "maximum": 5},
        "perceived_self_efficacy": {"type": "integer", "minimum": 1, "maximum": 5},
        "has_transferable_skills": {"type": "boolean"},
    },
    "required": ["contexts", "urgency_level", "perceived_self_efficacy"]
}

def _extract_context_flags(profile: dict) -> dict:
    """Extract context flags from Phase 1 open-text answers using Gemini strict JSON."""
    if not GEMINI_AVAILABLE:
        return _fallback_context(profile)
    texts = {
        "success_definition": (profile.get("success_definition") or "")[:300],
        "aspirational_self": (profile.get("aspirational_self") or "")[:300],
        "perceived_barriers": profile.get("perceived_barriers", []),
        "stage": profile.get("stage", ""),
        "reflection": (profile.get("reflection") or "")[:500],
    }
    prompt = f"""Analisis situasi user berikut dan tentukan context flags yang aktif.

Input user:
{json.dumps(texts, ensure_ascii=False, indent=2)}

Tentukan context flags dari kamus berikut:
- high_financial_urgency: user butuh gaji segera, tekanan finansial tinggi
- forced_career_change: user dipaksa pindah karir (PHK, etc)
- career_explorer_student: user masih sekolah/kuliah dan eksplorasi
- career_switcher: user sudah bekerja tapi ingin ganti bidang
- fresh_graduate: baru lulus
- low_confidence_profile: user ragu-ragu, tidak yakin dengan diri sendiri
- high_autonomy_seeker: user ingin kebebasan dan kendali penuh
- risk_averse: user menghindari risiko
- location_bound: user terikat lokasi geografis
- caregiver: user punya tanggungan keluarga

Output JSON strict dengan schema yang ditentukan."""
    result = _call_gemini(prompt)
    if result:
        try:
            cleaned = _clean_json(result)
            ctx = json.loads(cleaned)
            return {
                "contexts": ctx.get("contexts", []),
                "urgency_level": min(max(int(ctx.get("urgency_level", 3)), 1), 5),
                "perceived_self_efficacy": min(max(int(ctx.get("perceived_self_efficacy", 3)), 1), 5),
                "has_transferable_skills": bool(ctx.get("has_transferable_skills", False)),
            }
        except (json.JSONDecodeError, KeyError, TypeError, ValueError):
            pass
    return _fallback_context(profile)

def _fallback_context(profile: dict) -> dict:
    stage = (profile.get("stage") or "").lower()
    constraints = [c.lower() for c in profile.get("constraints", [])]
    contexts = []
    if "butuh gaji cepat" in constraints:
        contexts.append("high_financial_urgency")
    if any(s in stage for s in ["pelajar", "mahasiswa"]):
        contexts.append("career_explorer_student")
    if "career switcher" in stage or "pindah karir" in stage:
        contexts.append("career_switcher")
    if "fresh graduate" in stage:
        contexts.append("fresh_graduate")
    if "takut" in str(constraints).lower():
        contexts.append("risk_averse")
    if "terikat lokasi" in constraints:
        contexts.append("location_bound")
    return {
        "contexts": contexts, "urgency_level": 3,
        "perceived_self_efficacy": 3, "has_transferable_skills": False,
    }

# ======================================================================
# v2 — Three-Pass Scoring Engine
# ======================================================================

# --- Pass 1: Feasibility Gate ---

FEASIBILITY_LABELS = {
    "REACHABLE_NOW": "Reachable Now",
    "REACHABLE_NEAR": "Reachable Near",
    "REACHABLE_LONG": "Reachable Long",
    "CONDITIONAL": "Conditional",
    "ASPIRATIONAL": "Aspirational",
}

FEASIBILITY_MULTIPLIERS = {
    "REACHABLE_NOW": 1.00,
    "REACHABLE_NEAR": 0.92,
    "REACHABLE_LONG": 0.80,
    "CONDITIONAL": 0.70,
    "ASPIRATIONAL": 0.55,
}

def _pass1_feasibility(profile: dict, career) -> tuple[str, str]:
    """Determine feasibility category: is this career reachable for this user?"""
    user_edu = (profile.get("education_level") or "").strip().lower()
    career_edu_paths = [p.lower() for p in (career.education_paths or [])]
    requires_degree = any("s1" in p or "sarjana" in p for p in career_edu_paths)
    has_degree = any(d in user_edu for d in ["s1", "sarjana", "s2", "magister", "s3", "doktor"])
    has_diploma = "d3" in user_edu or "diploma" in user_edu
    has_alt = any("bootcamp" in p or "sertifikasi" in p for p in career_edu_paths)

    # Check hard constraints
    user_constraints = set(c.lower() for c in profile.get("constraints", []))
    critical_skill = bool(profile.get("skills")) and bool(career.required_skills)
    has_any_skill = bool(set(s.lower() for s in profile.get("skills", [])) & set(s.lower() for s in (career.required_skills or [])))

    # Decision logic
    edu_ok = _education_level_matches(user_edu, career.education_paths or [])
    if edu_ok and (not career.required_skills or has_any_skill):
        return "REACHABLE_NOW", "Pendidikan dan skill dasar sesuai — kamu bisa mulai sekarang."

    if edu_ok and career.required_skills and not has_any_skill:
        return "REACHABLE_NEAR", "Pendidikan sesuai, tapi perlu melengkapi skill inti. Estimasi 6–12 bulan."

    if not edu_ok and requires_degree and has_degree is False and not has_alt:
        return "CONDITIONAL", "Butuh pendidikan formal (S1) atau jalur alternatif (bootcamp/sertifikasi)."

    if has_diploma or has_alt:
        return "REACHABLE_LONG", "Pendidikan butuh peningkatan. Dengan jalur alternatif, estimasi 2–3 tahun."

    if requires_degree and not has_degree:
        return "ASPIRATIONAL", "Butuh pendidikan formal yang signifikan. Karir ini untuk rencana jangka panjang."

    return "REACHABLE_NEAR", "Dapat dicapai dengan persiapan 6–18 bulan."

# --- Pass 2: Nine-Dimension Scoring ---

def _dim1_skills_alignment(profile: dict, career) -> dict:
    """Skills Alignment — 9-dim version with tiered weight"""
    claimed = set(s.lower() for s in profile.get("skills", []))
    demonstrated = set(s.lower() for s in profile.get("skills_demonstrated", []))
    in_progress = set(s.lower() for s in profile.get("skills_in_progress", []))
    anti = set(s.lower() for s in profile.get("anti_skills", []))
    implied = set(s.lower() for s in profile.get("skills_implied", []))

    req_core = set(s.lower() for s in (career.required_skills or []))
    req_tech = set(s.lower() for s in (career.optional_skills or []))
    soft = set(s.lower() for s in (career.soft_skills or []))
    anti_career = set(s.lower() for s in (career.anti_skills or []))

    raw = 0.0
    data_pts = []

    # Required core — demonstrated gets more weight
    core_matches = demonstrated & req_core
    raw += len(core_matches) * 3.0
    if core_matches:
        data_pts.append(f"Skill inti terkonfirmasi: {', '.join(list(core_matches)[:3])}")

    claimed_core = (claimed - demonstrated) & req_core
    raw += len(claimed_core) * 1.5

    # Required technical
    tech_matches = (demonstrated | claimed) & req_tech
    raw += len(tech_matches) * 2.0

    # Soft skills
    soft_matches = (demonstrated | claimed) & soft
    raw += len(soft_matches) * 1.0
    if soft_matches:
        data_pts.append(f"Soft skill cocok: {', '.join(list(soft_matches)[:3])}")

    # In-progress
    in_prog_match = in_progress & req_core
    raw += len(in_prog_match) * 0.5

    # Anti-skill penalties
    anti_conflicts = anti & (req_core | anti_career)
    raw -= len(anti_conflicts) * 3.0
    if anti_conflicts:
        data_pts.append(f"Anti-skill conflict: {', '.join(list(anti_conflicts)[:2])}")

    missing_core = req_core - (demonstrated | claimed | in_progress)
    missed_tech = req_tech - (demonstrated | claimed)

    raw = max(raw, 0)
    score = min(raw, 100)
    confidence = 0.5 + min(len(demonstrated) / max(len(req_core), 1), 0.5) if req_core else 0.5

    return {
        "raw": score,
        "confidence": confidence,
        "weight": 0.22,
        "reasoning": f"Kecocokan skill: {score:.0f}/100. {len(core_matches)} skill inti cocok, {len(in_prog_match)} dalam proses, {len(anti_conflicts)} konflik.",
        "data_points": data_pts,
        "missing_core": list(missing_core),
        "missing_tech": list(missed_tech - req_core),
    }

def _dim2_interest_resonance(profile: dict, career) -> dict:
    """Interest Resonance — domain, activity, problem, Holland"""
    domains = set(i.lower() for i in profile.get("interests", []))
    activities = set(a.lower() for a in profile.get("activity_interests", []))
    problems = set(p.lower() for p in profile.get("problem_interests", []))
    holland = (profile.get("inferred_holland") or "").upper()
    aspirational = (profile.get("aspirational_self") or "").lower()
    career_holland = set(h.upper() for h in (career.holland_codes or []))

    raw = 0.0
    data_pts = []

    # Domain match via category + title + description
    cat_lower = career.category.lower()
    title_lower = career.title.lower()
    desc_lower = (career.description or "").lower()
    domain_match = domains & (set(cat_lower.split()) | set(title_lower.split()))
    if domain_match:
        raw += 20
        data_pts.append(f"Bidang sesuai minat: {', '.join(list(domain_match)[:3])}")

    # Activity match vs day_in_the_life
    day_lower = (career.day_in_the_life or career.description or "").lower()
    activity_matches = [a for a in activities if a in day_lower]
    raw += min(len(activity_matches) * 8, 35)
    if activity_matches:
        data_pts.append(f"Aktivitas sesuai: {', '.join(activity_matches[:2])}")

    # Problem match vs thrives_on
    thrives = set(t.lower() for t in (career.thrives_on or []))
    problem_matches = problems & thrives
    raw += min(len(problem_matches) * 10, 25)
    if problem_matches:
        data_pts.append(f"Masalah yang disukai cocok: {', '.join(list(problem_matches)[:2])}")

    # Holland alignment
    if holland and career_holland:
        for ch in career_holland:
            if holland[:2] and ch and holland[0] == ch[0]:
                raw += 10
                data_pts.append(f"Kepribadian Holland cocok ({holland[:2]} vs {ch})")
                break

    # Aspirational bonus
    career_keywords = title_lower.split() + cat_lower.split()
    if any(kw in aspirational for kw in career_keywords):
        raw += 12
        data_pts.append("Karir ini disebut dalam aspirasi pengguna")

    score = min(raw, 100)
    conf = 0.6 if (domains or activities) else 0.4
    return {
        "raw": score,
        "confidence": conf,
        "weight": 0.18,
        "reasoning": f"Kecocokan minat: {score:.0f}/100. Berbasis domain, aktivitas, dan tipe masalah.",
        "data_points": data_pts,
    }

def _dim3_values_alignment(profile: dict, career) -> dict:
    """Values Alignment — using value hierarchy"""
    values = profile.get("values_hierarchy", []) or profile.get("work_values", [])
    if not values:
        return {"raw": 50, "confidence": 0.3, "weight": 0.20, "reasoning": "Data nilai kerja terbatas — skor netral.", "data_points": []}

    # Map values to career proxy signals
    value_proxies = {
        "gaji tinggi": 1 if career.income_trajectory in ["exponential", "variable"] else 0.5,
        "stabilitas": 1 if career.market_prospect == "Tinggi" else 0.5,
        "kreativitas": 1 if (career.creative_expression if hasattr(career, 'creative_expression') else career.creative_expression if False else True) else 0.5,
        "work-life balance": career.work_life_balance / 5.0 if career.work_life_balance else 0.5,
        "fleksibilitas": 1 if career.remote_availability in ["Tinggi", "Sedang"] else 0.5,
        "dampak sosial": 1 if career.category in ["Kesehatan", "Pendidikan", "Pemerintahan & BUMN"] else 0.3,
        "jenjang karir": 0.8 if career.management_track else 0.5,
        "kepemimpinan": 0.8 if career.management_track else 0.4,
    }

    raw = 0.0
    for i, v in enumerate(values):
        v_key = v.lower() if isinstance(v, str) else ""
        proxy = value_proxies.get(v_key, 0.5)
        pos_weight = 1.0 / (i + 1)
        raw += pos_weight * proxy * 20

    score = min(raw, 100)
    conf = min(0.3 + len(values) * 0.08, 0.85)
    return {
        "raw": score,
        "confidence": conf,
        "weight": 0.20,
        "reasoning": f"Kecocokan nilai: {score:.0f}/100. Hirarki nilai dibobot berdasarkan prioritas.",
        "data_points": [f"Nilai utama: {values[0] if values else 'Tidak ada'}"],
    }

def _dim4_cognitive_fit(profile: dict, career) -> dict:
    """Cognitive Fit — using cognitive profile vs psychological fit"""
    cognitive = profile.get("cognitive_profile", {})
    if not cognitive:
        return {"raw": 60, "confidence": 0.3, "weight": 0.12, "reasoning": "Data kognitif terbatas — skor netral.", "data_points": []}

    raw = 60
    data_pts = []
    struggles = set(s.lower() for s in (career.struggles_with or []))
    thrives = set(t.lower() for t in (career.thrives_on or []))

    # Adjust based on cognitive signals
    ambig = int(cognitive.get("ambiguity_tolerance", 3))
    structure = cognitive.get("structure_preference", 0)
    risk = int(cognitive.get("risk_tolerance", 3))

    env_pace = (career.pace or "").lower()
    if "cepat" in env_pace and risk >= 3:
        raw += 8
        data_pts.append("Toleransi risiko cocok dengan lingkungan kerja cepat")
    if "lambat" in env_pace and structure > 0:
        raw += 8
        data_pts.append("Preferensi struktur cocok dengan lingkungan terukur")

    burnout = [b.lower() for b in (career.burnout_risk_factors or [])]
    if burnout:
        raw -= 5
        data_pts.append(f"Faktor burnout terdeteksi: {burnout[0]}")

    score = min(raw, 100)
    return {
        "raw": score,
        "confidence": 0.5,
        "weight": 0.12,
        "reasoning": f"Kecocokan kognitif: {score:.0f}/100. Berdasarkan profil psikologis dan lingkungan kerja.",
        "data_points": data_pts,
    }

def _dim5_education_alignment(profile: dict, career) -> dict:
    """Education Alignment — spectrum of readiness"""
    user_edu = (profile.get("education_level") or "").strip().lower()
    career_paths = [p.lower() for p in (career.education_paths or [])]
    alt_paths_exists = bool(career.alternative_paths)
    requires_degree = any("s1" in p or "sarjana" in p for p in career_paths)

    raw = 0
    data_pts = []

    if _education_level_matches(user_edu, career_paths):
        raw = 100
        data_pts.append("Pendidikan sesuai dengan jalur karir")
    elif requires_degree and "bootcamp" in career_paths:
        raw = 70
        data_pts.append("Pendidikan formal diperlukan, bootcamp diterima")
    elif alt_paths_exists and not requires_degree:
        raw = 62
        data_pts.append("Jalur alternatif tersedia (bootcamp/otodidak)")
    elif requires_degree:
        raw = 38
        data_pts.append("Butuh pendidikan formal S1")
    else:
        raw = 50
        data_pts.append("Pendidikan tidak sepenuhnya sesuai")

    in_progress = profile.get("education_in_progress", False)
    if in_progress:
        raw = raw * 0.75

    return {
        "raw": raw,
        "confidence": 0.85,
        "weight": 0.08,
        "reasoning": f"Kecocokan pendidikan: {raw:.0f}/100.",
        "data_points": data_pts,
    }

def _dim6_constraint_impact(profile: dict, career) -> dict:
    """Constraint Impact — penalty/modifier/advantage"""
    constraints = profile.get("constraints", [])
    constraint_details = profile.get("constraint_details", [])
    if not constraints:
        return {"raw": 100, "confidence": 0.7, "weight": 0.10, "reasoning": "Tidak ada kendala signifikan.", "data_points": []}

    raw = 100
    data_pts = []
    cat = career.category or ""

    constraint_map = {
        "tidak bisa coding": {"cats": ["Teknologi (IT)"], "penalty": 20},
        "tidak bisa kuliah": {"penalty": 12},
        "takut matematika": {"cats": ["Teknologi (IT)", "Keuangan & Hukum"], "penalty": 15},
        "butuh gaji cepat": {"bonus": True, "bonus_val": 8},
        "terikat lokasi": {"cats": ["Pariwisata"], "penalty": 8},
        "biaya terbatas": {"penalty": 8},
    }

    for con in constraints:
        c_key = con.lower() if isinstance(con, str) else ""
        rule = constraint_map.get(c_key)
        if rule:
            penalty_cats = rule.get("cats", [])
            if penalty_cats and cat in penalty_cats:
                raw -= rule.get("penalty", 10)
                data_pts.append(f"Kendala '{con}' membatasi ({rule.get('penalty', 10)} poin)")
            elif not penalty_cats:
                raw -= rule.get("penalty", 5)
                data_pts.append(f"Kendala '{con}' perlu diatasi")
            if rule.get("bonus"):
                raw += rule.get("bonus_val", 5)
                data_pts.append(f"Kendala '{con}' jadi keuntungan di bidang ini")

    # Advantage constraints
    for cd in constraint_details:
        if isinstance(cd, dict) and cd.get("is_advantage"):
            raw += cd.get("severity", 1) * 3
            data_pts.append(f"Kendala '{cd.get('description', '')}' jadi keunggulan")

    score = max(min(raw, 100), 0)
    return {
        "raw": score,
        "confidence": 0.7,
        "weight": 0.10,
        "reasoning": f"Dampak kendala: {score:.0f}/100. {len(data_pts)} faktor kendala terdeteksi.",
        "data_points": data_pts,
    }

def _dim7_environment_fit(profile: dict, career) -> dict:
    """Work Environment Fit"""
    prefs = set(p.lower() for p in profile.get("work_preferences", []))
    raw = 50
    data_pts = []

    remote_pref = "remote" in prefs or "hybrid" in prefs
    remote_career = (career.remote_availability or "").lower()
    if remote_pref and remote_career in ["tinggi", "sedang"]:
        raw += 15
        data_pts.append("Preferensi remote cocok")

    if "startup" in prefs and (career.pace or "").lower() in ["cepat", "tinggi"]:
        raw += 10
        data_pts.append("Lingkungan startup cocok")

    if "perusahaan besar" in prefs and career.bureaucracy_level and career.bureaucracy_level >= 3:
        raw += 10
        data_pts.append("Lingkungan korporat cocok")

    autonomy = career.autonomy_level or 3
    if "freelance" in prefs and autonomy >= 4:
        raw += 10
        data_pts.append("Otonomi tinggi cocok untuk freelancer")

    balance = career.work_life_balance or 3
    if balance >= 4:
        raw += 5
        data_pts.append("Work-life balance baik")

    score = min(raw, 100)
    return {
        "raw": score,
        "confidence": 0.6,
        "weight": 0.05,
        "reasoning": f"Kecocokan lingkungan: {score:.0f}/100.",
        "data_points": data_pts,
    }

def _dim8_market_timing(profile: dict, career) -> dict:
    """Market Timing — real-world conditions"""
    raw = 75
    data_pts = []

    prospect = (career.market_prospect or "").lower()
    if "tinggi" in prospect:
        raw += 12
        data_pts.append("Prospek pasar tinggi")
    elif "rendah" in prospect:
        raw -= 10
        data_pts.append("Prospek pasar rendah")

    growth = career.growth_rate_5yr or ""
    if growth and "+" in growth:
        raw += 8
        data_pts.append(f"Pertumbuhan {growth} dalam 5 tahun")

    ai_score = career.ai_displacement_score
    if ai_score and ai_score > 0.5:
        raw -= 12
        data_pts.append("Risiko disrupsi AI tinggi dalam 3-5 tahun")
    elif ai_score and ai_score < 0.2:
        raw += 5
        data_pts.append("Risiko AI rendah — karir stabil")

    sat = (career.saturation_risk or "").lower()
    if "tinggi" in sat:
        raw -= 8
        data_pts.append("Pasar sudah jenuh")

    score = max(min(raw, 100), 0)
    return {
        "raw": score,
        "confidence": 0.4,
        "weight": 0.03,
        "reasoning": f"Kondisi pasar: {score:.0f}/100.",
        "data_points": data_pts,
    }

def _dim9_trajectory_alignment(profile: dict, career) -> dict:
    """Trajectory Alignment — does this career lead where user wants?"""
    raw = 50
    data_pts = []

    if career.management_track:
        raw += 10
        data_pts.append("Ada jalur manajemen")

    if career.ic_track:
        raw += 8
        data_pts.append("Ada jalur individual contributor")

    ent = (career.entrepreneurial_exit or "").lower()
    if ent in ["tinggi", "sedang"]:
        raw += 8
        data_pts.append(f"Potensi wirausaha: {career.entrepreneurial_exit}")

    if career.aspiration_careers:
        raw += 8
        data_pts.append(f"Dapat berkembang ke: {career.aspiration_careers[0]}")

    score = min(raw, 100)
    return {
        "raw": score,
        "confidence": 0.4,
        "weight": 0.02,
        "reasoning": f"Kecocokan lintasan: {score:.0f}/100.",
        "data_points": data_pts,
    }

# --- Pass 3: Synthesis and Dynamic Weighting (Section 4) ---

# Base Weights (Section 4.2)
BASE_WEIGHTS = {
    "skills_alignment":      0.22,
    "interest_resonance":    0.18,
    "values_alignment":      0.20,
    "cognitive_fit":         0.12,
    "education_alignment":   0.08,
    "constraint_impact":     0.10,
    "environment_fit":       0.05,
    "market_timing":         0.03,
    "trajectory_alignment":  0.02,
}

DIM_ORDER = [
    ("skills_alignment", 0.22), ("interest_resonance", 0.18), ("values_alignment", 0.20),
    ("cognitive_fit", 0.12), ("education_alignment", 0.08), ("constraint_impact", 0.10),
    ("environment_fit", 0.05), ("market_timing", 0.03), ("trajectory_alignment", 0.02),
]

# Weight Adjustments (Section 4.3)
WEIGHT_ADJUSTMENTS = {
    "high_financial_urgency": {
        "market_timing":        +0.09,
        "values_alignment":     -0.10,
        "education_alignment":  +0.05,
        "skills_alignment":     +0.04,
    },
    "forced_career_change": {
        "cognitive_fit":        +0.08,
        "skills_alignment":     +0.06,
        "education_alignment":  -0.04,
    },
    "career_explorer_student": {
        "interest_resonance":   +0.10,
        "market_timing":        -0.02,
        "trajectory_alignment": +0.06,
    },
    "career_switcher": {
        "cognitive_fit":        +0.08,
        "skills_alignment":     +0.06,
        "education_alignment":  -0.04,
        "interest_resonance":   -0.04,
    },
    "fresh_graduate": {
        "education_alignment":  +0.07,
        "interest_resonance":   +0.04,
        "trajectory_alignment": +0.04,
    },
    "risk_averse": {
        "constraint_impact":    +0.05,
        "values_alignment":     +0.04,
        "environment_fit":      +0.03,
    },
    "high_autonomy_seeker": {
        "environment_fit":      +0.05,
        "cognitive_fit":        +0.04,
        "trajectory_alignment": +0.03,
    },
    "location_bound": {
        "environment_fit":      +0.04,
        "constraint_impact":    +0.03,
        "market_timing":        +0.02,
    },
    "caregiver": {
        "constraint_impact":    +0.04,
        "environment_fit":      +0.03,
        "market_timing":        +0.03,
    },
}

def _dynamic_weights(context_flags: dict) -> dict:
    """Section 4.3: Adjust base weights based on active context flags."""
    weights = dict(BASE_WEIGHTS)
    active = context_flags.get("contexts", [])

    for flag in active:
        adj = WEIGHT_ADJUSTMENTS.get(flag, {})
        for dim, delta in adj.items():
            weights[dim] = weights.get(dim, 0.0) + delta

    # Clamp to prevent negative weights
    for k in weights:
        weights[k] = max(weights[k], 0.01)

    # Section 4.4: Normalize proportionally
    total = sum(weights.values())
    if total > 0:
        for k in weights:
            weights[k] = round(weights[k] / total, 4)

    return weights

def _normalize_weights(weights: dict) -> dict:
    """Section 4.4: Proportional normalization so sum = 1.0"""
    total = sum(weights.values())
    if total == 0:
        return weights
    return {k: v / total for k, v in weights.items()}

def _calculate_confidence_adjusted_score(dimension_scores: dict, dynamic_weights: dict) -> tuple:
    """Section 4.5: Weighted raw score → mean regression → adjusted score."""
    weighted_raw = 0.0
    confidence_factor = 0.0

    for dim_key, base_weight in DIM_ORDER:
        d = dimension_scores.get(dim_key, {})
        raw = d.get("raw", 50)
        conf = d.get("confidence", 0.5)
        w = dynamic_weights.get(dim_key, base_weight)
        weighted_raw += raw * w
        confidence_factor += conf * w

    # Mean regression
    adjusted_score = (weighted_raw * confidence_factor) + (50 * (1 - confidence_factor))

    return adjusted_score, confidence_factor, weighted_raw

def _calculate_confidence_band(final_score: float, mean_confidence: float) -> list:
    """Section 4.7: Uncertainty spread for confidence bands."""
    uncertainty_spread = 1 - mean_confidence
    lower = max(final_score * (1 - uncertainty_spread), 0)
    upper = min(final_score * (1 + uncertainty_spread), 100)
    return [round(lower, 1), round(upper, 1)]

def _compute_9dim_scores(profile: dict, career) -> dict:
    """Run all 9 dimensions for a single career"""
    d1 = _dim1_skills_alignment(profile, career)
    d2 = _dim2_interest_resonance(profile, career)
    d3 = _dim3_values_alignment(profile, career)
    d4 = _dim4_cognitive_fit(profile, career)
    d5 = _dim5_education_alignment(profile, career)
    d6 = _dim6_constraint_impact(profile, career)
    d7 = _dim7_environment_fit(profile, career)
    d8 = _dim8_market_timing(profile, career)
    d9 = _dim9_trajectory_alignment(profile, career)

    return {"skills_alignment": d1, "interest_resonance": d2, "values_alignment": d3,
            "cognitive_fit": d4, "education_alignment": d5, "constraint_impact": d6,
            "environment_fit": d7, "market_timing": d8, "trajectory_alignment": d9}

def _check_exploration_mode(all_results: list, profile: dict) -> dict | None:
    """Section 2 Poin 1: 'I Don't Know' Fallback — if all careers have confidence < 50%."""
    if not all_results:
        return None
    max_conf = max(r.get("confidence_score", 0) for r in all_results)
    if max_conf >= 0.50:
        return None
    # Generate exploration experiments via Gemini
    if GEMINI_AVAILABLE:
        texts = {
            "success_definition": (profile.get("success_definition") or "")[:300],
            "aspirational_self": (profile.get("aspirational_self") or "")[:300],
            "reflection": (profile.get("reflection") or "")[:500],
            "interests": profile.get("interests", [])[:3],
        }
        prompt = f"""User ini memiliki data yang sangat minim (Confidence < 50%).
Mereka menjawab ragu-ragu pada Phase Skills dan Interests.

Berdasarkan jawaban teks terbuka mereka di Phase 1, buatkan 3 "Micro-Experiments"
yang bisa mereka lakukan minggu ini (maksimal 3 jam per eksperimen)
untuk mengumpulkan data tentang diri mereka sendiri.

Input user:
{json.dumps(texts, ensure_ascii=False, indent=2)}

Output JSON array:
[{{"experiment_name": str, "action_steps": str, "what_to_observe": str}}]

Gunakan Bahasa Indonesia."""
        result = _call_gemini(prompt)
        if result:
            try:
                cleaned = _clean_json(result)
                experiments = json.loads(cleaned)
                return {
                    "exploration_mode": True,
                    "message": "Kami belum bisa memetakan karir Anda karena Anda belum memiliki cukup 'data points' tentang diri Anda. Alih-alih menebak, mari kita kumpulkan datanya. Cobalah 3 eksperimen ini untuk mengenali dirimu lebih baik.",
                    "micro_experiments": experiments,
                }
            except (json.JSONDecodeError, TypeError):
                pass
    return {
        "exploration_mode": True,
        "message": "Data yang kamu berikan masih terlalu umum. Coba lakukan eksplorasi kecil untuk mengenali minat dan skillmu lebih dalam sebelum kami bisa memberikan rekomendasi yang akurat.",
        "micro_experiments": [
            {"experiment_name": "Riset Bidang", "action_steps": "Cari 3 bidang yang menarik perhatianmu, baca deskripsi pekerjaan di Glints/Jobstreet", "what_to_observe": "Apa yang membuatmu penasaran? Apa yang membuatmu ragu?"},
            {"experiment_name": "Refleksi Pengalaman", "action_steps": "Tulis 3 momen dalam hidupmu saat kamu merasa paling bersemangat dan produktif", "what_to_observe": "Apa benang merah dari momen-momen itu? Orang, aktivitas, atau lingkungan?"},
            {"experiment_name": "Mini Project", "action_steps": "Pilih 1 bidang yang menarik, lakukan 1 proyek kecil (maks 3 jam) di bidang itu", "what_to_observe": "Apakah kamu menikmati prosesnya? Apakah kamu ingin melanjutkan?"},
        ],
    }

def _generate_survival_strategy(profile: dict, best_career) -> dict | None:
    """Section 2 Poin 2: Runway vs Timeline survival strategy."""
    weekly_hours = profile.get("weekly_hours_available", 0)
    runway_str = profile.get("runway_months", "")
    try:
        runway_months = int(str(runway_str).split("-")[0]) if "-" in str(runway_str) else 0
        if runway_str in ["12+", "none"]:
            return None
    except (ValueError, TypeError):
        return None

    timeline_months = 6
    if best_career and hasattr(best_career, "time_to_first_job") and best_career.time_to_first_job:
        timeline_months = 9

    if timeline_months <= runway_months or runway_months <= 0:
        return None

    if GEMINI_AVAILABLE:
        prompt = f"""Target karir: [{best_career.title if best_career else 'Karir'}]. Waktu belajar: {timeline_months} bulan.
Runway finansial user: {runway_months} bulan. Weekly hours available: {weekly_hours} jam.

Berikan "Survival Strategy" yang realistis dalam Bahasa Indonesia.
Sarankan 1-2 "Bridge/Survival Jobs" yang membutuhkan skill yang SUDAH dimiliki user saat ini
untuk menutupi biaya hidup sambil mereka belajar.

Output JSON: {{"bridge_jobs": [str], "strategy": str, "weekly_schedule": str}}"""
        result = _call_gemini(prompt)
        if result:
            try:
                cleaned = _clean_json(result)
                return json.loads(cleaned)
            except (json.JSONDecodeError, TypeError):
                pass

    return {
        "bridge_jobs": ["Admin Data Entry", "Customer Service Paruh Waktu"],
        "strategy": f"Dana Anda akan habis dalam {runway_months} bulan, tetapi persiapan karir target membutuhkan ~{timeline_months} bulan. Ambil pekerjaan paruh waktu yang tidak membutuhkan skill baru untuk menutupi biaya hidup sambil belajar di malam hari.",
        "weekly_schedule": f"{weekly_hours} jam/minggu untuk belajar karir target + 15-20 jam/minggu untuk survival job",
    }

def _generate_transferable_skills(profile: dict, career) -> list | None:
    """Section 2 Poin 3: Transferable Skill Translator for career switchers."""
    stage = (profile.get("stage") or "").lower()
    if "career switcher" not in stage and "pindah" not in stage:
        return None
    if GEMINI_AVAILABLE:
        prompt = f"""User adalah mantan profesi yang ingin beralih karir ke [{career.title if career else 'karir baru'}].
Bandingkan skill dari riwayat kerja lama mereka dengan requirement karir baru.
Identifikasi 3-5 "Transferable Skills" dan jelaskan bagaimana skill lama tersebut
diterjemahkan ke dalam bahasa industri baru. Gunakan nada yang memberdayakan.

Output JSON array:
[{{"old_skill": str, "new_skill": str, "explanation": str}}]

Gunakan Bahasa Indonesia."""
        result = _call_gemini(prompt)
        if result:
            try:
                cleaned = _clean_json(result)
                skills = json.loads(cleaned)
                if isinstance(skills, list) and len(skills) > 0:
                    return skills
            except (json.JSONDecodeError, TypeError):
                pass
    return None

_v2_LABEL_MAP = [
    (78, "Strong Match — Start Now"),
    (75, "Strong Match — Short Gap"),
    (65, "Good Match — Invest to Get There"),
    (60, "Conditional Match"),
    (50, "Moderate Match"),
    (0, "Aspirational — Map the Path"),
]

def _v2_label(score: float, feasibility: str) -> str:
    if feasibility == "REACHABLE_NOW" and score >= 78:
        return "Strong Match — Start Now"
    if feasibility == "REACHABLE_NEAR" and score >= 75:
        return "Strong Match — Short Gap"
    if score >= 65:
        return "Good Match — Invest to Get There"
    if score >= 60:
        return "Conditional Match"
    if score >= 50:
        return "Moderate Match"
    return "Aspirational — Map the Path"

def _compute_tier(score: float, feasibility: str) -> int:
    if feasibility in ["REACHABLE_NOW", "REACHABLE_NEAR"] and score >= 65:
        return 1
    if score >= 50:
        return 2
    return 3

def _generate_gap_analysis(profile: dict, career, dims: dict) -> dict:
    """Generate structured gap analysis"""
    d1 = dims.get("skills_alignment", {})
    missing_core = d1.get("missing_core", [])
    missing_tech = d1.get("missing_tech", [])

    critical = []
    for s in missing_core[:5]:
        critical.append({
            "skill": s, "severity": "High",
            "close_pathway": f"Pelajari {s} via kursus online atau project praktik",
            "estimated_time": "2-3 bulan",
            "cost": "Gratis - Rp 500.000",
        })

    important = []
    for s in missing_tech[:3]:
        important.append({
            "skill": s, "severity": "Medium",
            "close_pathway": f"Tingkatkan {s} dengan project kecil",
            "estimated_time": "1-2 bulan",
            "cost": "Gratis",
        })

    user_edu = profile.get("education_level", "-")
    career_edu = ", ".join(career.education_paths or ["-"])

    edu_gap = {
        "user_level": user_edu,
        "career_typical": career_edu,
        "career_minimum": career_edu,
        "recommendation": "Ambil kursus atau bootcamp jika pendidikan formal kurang sesuai",
        "estimated_time": "6-12 bulan",
        "estimated_cost": "Rp 1-10 juta",
    }

    return {
        "skills": {"critical_gaps": critical, "important_gaps": important,
                    "accelerator_gaps": [], "anti_skill_conflicts": []},
        "education": edu_gap,
        "portfolio": {"missing": [], "present": []},
        "interview": {"technical_readiness": "Perlu persiapan",
                      "behavioral_readiness": "Perlu persiapan",
                      "domain_readiness": "Perlu persiapan", "gaps": []},
        "timeline": {"total_months": 6, "milestones": [], "urgent_path": None},
    }

# --- Main v2 Scoring Entry Point ---

def score_careers_v2(profile: dict, db: Session) -> dict:
    """Three-Pass Scoring Engine (Section 4) returning full Career Intelligence Report"""
    careers = db.query(Career).filter(Career.status == "published").all()
    if not careers:
        return {"tier1": [], "tier2": [], "tier3": [], "summary": "Belum ada data karir.", "exploration_mode": None}

    # Step 1: Extract context flags (Section 4.1)
    context_flags = _extract_context_flags(profile)

    # Step 2: Determine dynamic weights (Section 4.2-4.4)
    dynamic_weights = _dynamic_weights(context_flags)

    # Step 3: Run all 9 dimensions for all careers (deterministic, no AI)
    all_results = []
    for c in careers:
        feasibility, feas_reason = _pass1_feasibility(profile, c)
        dims = _compute_9dim_scores(profile, c)

        # Section 4.5: Confidence-adjusted scoring with mean regression
        adjusted_score, mean_confidence, weighted_raw = _calculate_confidence_adjusted_score(dims, dynamic_weights)

        # Section 4.6: Feasibility multiplier
        feasibility_mult = FEASIBILITY_MULTIPLIERS.get(feasibility, 0.70)
        final_score = adjusted_score * feasibility_mult

        # Section 4.7: Confidence band
        band = _calculate_confidence_band(final_score, mean_confidence)

        label = _v2_label(final_score, feasibility)
        tier = _compute_tier(final_score, feasibility)

        all_results.append({
            "career_id": c.id, "title": c.title,
            "feasibility_flag": feasibility, "feasibility_reason": feas_reason,
            "dimensions": dims, "dynamic_weights": dynamic_weights,
            "weighted_raw_score": round(weighted_raw, 1),
            "confidence_score": round(mean_confidence, 2),
            "final_adjusted_score": round(final_score, 1),
            "confidence_band": band, "tier": tier, "label": label,
            "headline": f"{c.title}: {label}",
            "reasoning": [f"Skor {label}. Feasibility: {FEASIBILITY_LABELS.get(feasibility, feasibility)}. Confidence: {mean_confidence:.0%}."],
            "gap_analysis": _generate_gap_analysis(profile, c, dims) if tier == 1 else None,
            "hiring_readiness": None, "personalized_timeline": None,
        })

    all_results.sort(key=lambda x: x["final_adjusted_score"], reverse=True)

    # Check Exploration Mode (Section 2 Poin 1)
    exploration = _check_exploration_mode(all_results, profile)

    # Generate survival strategy (Section 2 Poin 2)
    best_career = careers[0] if careers else None
    if all_results and best_career:
        for r in all_results:
            if r["tier"] == 1 or (r["career_id"] and True):
                match_career = next((c for c in careers if c.id == r["career_id"]), None)
                if match_career:
                    survival = _generate_survival_strategy(profile, match_career)
                    r["survival_strategy"] = survival
                    transferable = _generate_transferable_skills(profile, match_career)
                    r["transferable_skills"] = transferable
                break

    # Try Gemini for narrative generation on Top 10 only (mitigate context window overload)
    if GEMINI_AVAILABLE and careers and not exploration:
        top10 = all_results[:10]
        career_text = json.dumps([
            {"id": c.id, "title": c.title, "category": c.category, "description": c.description,
             "required_skills": c.required_skills, "holland_codes": c.holland_codes}
            for c in careers if any(r["career_id"] == c.id for r in top10)
        ], ensure_ascii=False)

        prompt = f"""Kamu adalah asisten karir untuk Life Compass v2. Berikut data user:
{json.dumps(profile, ensure_ascii=False, indent=2)}

Context flags terdeteksi: {json.dumps(context_flags, ensure_ascii=False)}
Dynamic weights: {json.dumps(dynamic_weights, ensure_ascii=False)}

Bandingkan user dengan {len(top10)} karir berikut:
{career_text}

Untuk SETIAP karir di atas, berikan:
- headline: 1 kalimat spesifik dan personal (Bahasa Indonesia)
- reasoning: 1-2 kalimat analisis mengapa karir ini cocok/tidak (Bahasa Indonesia)

Output JSON array: [{{"career_id": int, "headline": str, "reasoning": [str]}}]"""
        ai_result = _call_gemini(prompt)
        if ai_result:
            try:
                cleaned = _clean_json(ai_result)
                narratives = json.loads(cleaned)
                nar_map = {n["career_id"]: n for n in narratives}
                for r in all_results:
                    if r["career_id"] in nar_map:
                        n = nar_map[r["career_id"]]
                        r["headline"] = n.get("headline", r["headline"])
                        r["reasoning"] = n.get("reasoning", r["reasoning"])
            except (json.JSONDecodeError, KeyError, TypeError):
                pass

    tier1 = [r for r in all_results if r["tier"] == 1][:5]
    tier2 = [r for r in all_results if r["tier"] == 2][:10]
    tier3 = [r for r in all_results if r["tier"] == 3]

    result = {
        "tier1": tier1, "tier2": tier2, "tier3": tier3,
        "summary": f"Analisis {len(all_results)} karir selesai. {len(tier1)} rekomendasi utama.",
        "context_flags": context_flags, "dynamic_weights": dynamic_weights,
        "exploration_mode": exploration,
    }
    return result

def _fallback_scoring_v2(profile: dict, careers: list) -> dict:
    """Fallback v2 scoring when Gemini is unavailable (uses same Section 4 math)"""
    context_flags = _fallback_context(profile)
    dynamic_weights = _dynamic_weights(context_flags)
    all_results = []

    for c in careers:
        feasibility, reason = _pass1_feasibility(profile, c)
        dims = _compute_9dim_scores(profile, c)
        adjusted_score, mean_confidence, weighted_raw = _calculate_confidence_adjusted_score(dims, dynamic_weights)
        feasibility_mult = FEASIBILITY_MULTIPLIERS.get(feasibility, 0.70)
        final_score = adjusted_score * feasibility_mult
        band = _calculate_confidence_band(final_score, mean_confidence)
        label = _v2_label(final_score, feasibility)
        tier = _compute_tier(final_score, feasibility)

        all_results.append({
            "career_id": c.id, "title": c.title,
            "feasibility_flag": feasibility, "feasibility_reason": reason,
            "dimensions": dims, "dynamic_weights": dynamic_weights,
            "weighted_raw_score": round(weighted_raw, 1),
            "confidence_score": round(mean_confidence, 2),
            "final_adjusted_score": round(final_score, 1),
            "confidence_band": band, "tier": tier, "label": label,
            "headline": f"{c.title}: {label}",
            "reasoning": [f"Skor {label}. Feasibility: {FEASIBILITY_LABELS.get(feasibility, feasibility)}."],
            "gap_analysis": _generate_gap_analysis(profile, c, dims) if tier == 1 else None,
        })

    all_results.sort(key=lambda x: x["final_adjusted_score"], reverse=True)
    exploration = _check_exploration_mode(all_results, profile)
    tier1 = [r for r in all_results if r["tier"] == 1][:5]
    tier2 = [r for r in all_results if r["tier"] == 2][:10]
    tier3 = [r for r in all_results if r["tier"] == 3]

    return {
        "tier1": tier1, "tier2": tier2, "tier3": tier3,
        "summary": f"Analisis {len(all_results)} karir selesai. {len(tier1)} rekomendasi utama.",
        "context_flags": context_flags, "dynamic_weights": dynamic_weights,
        "exploration_mode": exploration,
    }

# ======================================================================
# Legacy v1 functions (kept for backward compatibility)
# ======================================================================

# --- Scoring (v1) ---

_VALUE_CATEGORY_MAP = {
    "gaji tinggi": ["Teknologi (IT)", "Keuangan & Hukum", "Bisnis & Marketing", "Teknik non-IT"],
    "stabilitas": ["Pemerintahan & BUMN", "Pendidikan", "Kesehatan", "Keuangan & Hukum"],
    "kreativitas": ["Kreatif & Media", "Teknologi (IT)", "Bisnis & Marketing"],
    "fleksibilitas": ["Teknologi (IT)", "Kreatif & Media", "Bisnis & Marketing"],
    "dampak sosial": ["Kesehatan", "Pendidikan", "Pertanian & Kelautan", "Pemerintahan & BUMN"],
    "work-life balance": ["Pemerintahan & BUMN", "Pendidikan", "Pertanian & Kelautan"],
    "jenjang karir": ["Teknologi (IT)", "Keuangan & Hukum", "Bisnis & Marketing", "Teknik non-IT"],
    "kepemimpinan": ["Bisnis & Marketing", "Pemerintahan & BUMN", "Keuangan & Hukum"],
}

_CONSTRAINT_MAP = {
    "tidak bisa coding": {"penalty_categories": ["Teknologi (IT)"], "penalty": 10},
    "tidak bisa kuliah": {"penalty_if_no_bootcamp": True, "penalty": 8},
    "takut matematika": {"penalty_categories": ["Teknologi (IT)", "Keuangan & Hukum", "Teknik non-IT"], "penalty": 10},
    "butuh gaji cepat": {"bonus_industries": True, "bonus": 5},
    "tidak punya koneksi": {"penalty_categories": [], "penalty": 3},
    "usia": {"penalty_categories": [], "penalty": 3},
    "biaya terbatas": {"penalty_if_no_bootcamp": True, "penalty": 5},
    "terikat lokasi": {"penalty_categories": ["Pariwisata"], "penalty": 5},
}

_PREFERENCE_MAP = {
    "remote": ["Teknologi (IT)", "Kreatif & Media", "Bisnis & Marketing"],
    "hybrid": ["Teknologi (IT)", "Bisnis & Marketing", "Keuangan & Hukum"],
    "kantor": None,
    "freelance": ["Kreatif & Media", "Teknologi (IT)"],
    "startup": ["Teknologi (IT)", "Kreatif & Media"],
    "perusahaan besar": None,
    "pemerintahan": ["Pemerintahan & BUMN"],
    "wirausaha": ["Bisnis & Marketing"],
}

def _compute_dimension_scores(profile_data: dict, career) -> dict:
    user_interests = set(i.lower() for i in profile_data.get("interests", []))
    user_skills = set(s.lower() for s in profile_data.get("skills", []))
    user_values = set(v.lower() for v in profile_data.get("work_values", []))
    user_constraints = set(v.lower() for v in profile_data.get("constraints", []))
    user_preferences = set(v.lower() for v in profile_data.get("work_preferences", []))
    user_education = (profile_data.get("education_level") or "").strip()

    req_skills = set(s.lower() for s in (career.required_skills or []))
    opt_skills = set(s.lower() for s in (career.optional_skills or []))
    skill_overlap = user_skills & req_skills
    opt_overlap = user_skills & opt_skills
    skill_score = min(len(skill_overlap) * 7 + len(opt_overlap) * 3, 21)

    interest_score = 0
    cat_lower = career.category.lower()
    if any(kw in cat_lower for kw in user_interests):
        interest_score += 12
    title_lower = career.title.lower()
    if any(kw in title_lower for kw in user_interests):
        interest_score += 5
    elif not any(kw in cat_lower for kw in user_interests):
        desc_lower = (career.description or "").lower()
        if any(kw in desc_lower for kw in user_interests):
            interest_score += 5

    value_score = 0
    matched_values = []
    for v in user_values:
        target_cats = _VALUE_CATEGORY_MAP.get(v)
        if target_cats and career.category in target_cats:
            matched_values.append(v)
    if matched_values:
        value_score = min(len(matched_values) * 7, 14)

    edu_score = 0
    if _education_level_matches(user_education, career.education_paths or []):
        edu_score = 8
    elif user_education and "tidak bisa kuliah" in user_constraints and any(
        "s1" in (p or "").lower() or "sarjana" in (p or "").lower()
        for p in (career.education_paths or [])
    ):
        edu_score = -5

    constraint_penalty = 0
    for con in user_constraints:
        rule = _CONSTRAINT_MAP.get(con)
        if rule:
            penalty_cats = rule.get("penalty_categories")
            if penalty_cats and career.category in penalty_cats:
                constraint_penalty -= rule["penalty"]
            if rule.get("bonus_industries"):
                sal_max = _parse_salary(career.salary_max)
                if sal_max and sal_max >= 10_000_000:
                    constraint_penalty += rule["bonus"]
            if rule.get("penalty_if_no_bootcamp"):
                edu_paths = [p.lower() for p in (career.education_paths or [])]
                if not any("bootcamp" in p or "d3" in p or "sma" in p for p in edu_paths):
                    constraint_penalty -= rule["penalty_if_no_bootcamp"]

    pref_score = 0
    matched_prefs = []
    for p in user_preferences:
        target_cats = _PREFERENCE_MAP.get(p)
        if target_cats is None:
            matched_prefs.append(p)
        elif target_cats and career.category in target_cats:
            matched_prefs.append(p)
    if matched_prefs:
        pref_score = min(len(matched_prefs) * 3, 6)

    return {
        "skill": skill_score, "interest": interest_score,
        "value": value_score, "education": edu_score,
        "constraints": constraint_penalty, "preference": pref_score,
        "matched_skills": list(skill_overlap),
        "matched_values": matched_values,
        "matched_prefs": matched_prefs,
    }

def score_careers(profile_data: dict, db: Session) -> list[dict]:
    careers = db.query(Career).filter(Career.status == "published").all()
    if not careers:
        return []

    cache_key = hashlib.md5(
        (json.dumps(profile_data, sort_keys=True) + f"_v{settings.CAREER_DATA_VERSION}").encode()
    ).hexdigest()

    cached = _get_cache(cache_key, db)
    if cached:
        return cached["results"]

    if GEMINI_AVAILABLE and careers:
        career_text = json.dumps([
            {"id": c.id, "title": c.title, "category": c.category, "description": c.description,
             "required_skills": c.required_skills, "market_prospect": c.market_prospect, "ai_risk": c.ai_risk}
            for c in careers
        ], ensure_ascii=False)

        prompt = f"""Kamu adalah asisten karir untuk Life Compass. Berikut data user:
{json.dumps(profile_data, ensure_ascii=False, indent=2)}

Bandingkan dengan {len(careers)} data karir berikut:
{career_text}

Beri skor 0-100 untuk SETIAP karir berdasarkan:
1. Kecocokan minat (20%)
2. Kecocokan nilai kerja (20%)
3. Kedekatan skill (20%)
4. Kecocokan kendala (15%)
5. Kelayakan pasar (15%)
6. Risiko (10%)

Output: JSON array saja, tanpa teks lain.
Format: [{{"career_id": int, "title": str, "score": float, "label": str, "reason": str}}]
Label: Cocok Tinggi (>=80), Cocok Sedang (60-79), Coba Dulu (40-59), Kurang Cocok (<40)
Gunakan Bahasa Indonesia untuk field reason."""

        result = _call_gemini(prompt)
        if result:
            try:
                cleaned = _clean_json(result)
                results = json.loads(cleaned)
                career_map = {c.id: c for c in careers}
                for r in results:
                    c = career_map.get(r.get("career_id"))
                    if c:
                        r["dimensions"] = _compute_dimension_scores(profile_data, c)
                _set_cache(cache_key, {"results": results, "cache_key": cache_key}, db)
                return results
            except (json.JSONDecodeError, KeyError, IndexError):
                pass

    return _fallback_scoring(profile_data, careers, db)

def _fallback_scoring(profile_data: dict, careers: list, db: Session) -> list[dict]:
    results = []
    for c in careers:
        dims = _compute_dimension_scores(profile_data, c)
        score = 40.0 + dims["skill"] + dims["interest"] + dims["value"] + dims["education"] + dims["constraints"] + dims["preference"]
        reasons = []
        if dims["matched_skills"]:
            reasons.append(f"Skill cocok: {', '.join(dims['matched_skills'][:3])}")
        if dims["interest"] >= 12:
            reasons.append("Kategori sesuai minat")
        elif dims["interest"] >= 5:
            reasons.append("Ada ketertarikan di bidang ini")
        if dims["matched_values"]:
            reasons.append(f"Nilai sesuai: {', '.join(dims['matched_values'][:2])}")
        if dims["education"] > 0:
            reasons.append("Pendidikan sesuai")
        if dims["education"] < 0:
            reasons.append("Kendala pendidikan")
        if dims["constraints"] < 0:
            reasons.append("Ada kendala yang perlu diatasi")
        if dims["matched_prefs"]:
            reasons.append(f"Preferensi sesuai: {', '.join(dims['matched_prefs'][:2])}")
        score = min(score, 98)
        score = max(score, 5)
        if score >= 80:
            label = "Cocok Tinggi"
        elif score >= 60:
            label = "Cocok Sedang"
        elif score >= 40:
            label = "Coba Dulu"
        else:
            label = "Kurang Cocok"
        results.append({
            "career_id": c.id, "title": c.title, "score": round(score, 1),
            "label": label, "reason": "; ".join(reasons[:3]) if reasons else "Belum ada data cukup",
            "dimensions": dims,
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    cache_key = hashlib.md5(
        (json.dumps(profile_data, sort_keys=True) + f"_v{settings.CAREER_DATA_VERSION}").encode()
    ).hexdigest()
    _set_cache(cache_key, {"results": results, "cache_key": cache_key}, db)
    return results

# --- Summary Generation ---

def generate_summary(profile_data: dict) -> str:
    if not GEMINI_AVAILABLE:
        return _fallback_summary(profile_data)
    prompt = f"""Buat ringkasan profil karir 2-3 paragraf dalam Bahasa Indonesia dari data berikut:
{json.dumps(profile_data, ensure_ascii=False, indent=2)}
Fokus: interpretasi minat, nilai kerja, skill, dan kendala user. Beri insight tentang bagaimana kombinasi ini bisa diarahkan ke pilihan karir. Bahasa Indonesia yang ramah, suportif, dan personal. Jangan hanya menyebutkan data ulang — beri makna."""
    result = _call_gemini(prompt)
    if result:
        return result
    return _fallback_summary(profile_data)

def _fallback_summary(profile_data: dict) -> str:
    interests = profile_data.get("interests", [])
    skills = profile_data.get("skills", [])
    values = profile_data.get("work_values", [])
    stage = profile_data.get("stage", "")
    parts = [f"Kamu sedang dalam tahap: {stage}."]
    if interests:
        parts.append(f"Kamu tertarik pada: {', '.join(interests[:3])}.")
    if skills:
        parts.append(f"Keahlian: {', '.join(skills[:3])}.")
    if values:
        parts.append(f"Nilai kerja penting: {', '.join(values[:3])}.")
    return " ".join(parts)

# --- Experiment Plan ---

def generate_experiment_plan(career_title: str, profile_data: dict) -> list[str]:
    if not GEMINI_AVAILABLE:
        return _fallback_plan(career_title)
    prompt = f"""Buat rencana eksperimen 7 hari untuk karir "{career_title}" dalam Bahasa Indonesia. Profil user:
{json.dumps(profile_data, ensure_ascii=False, indent=2)}
Output: JSON array of 7 string tasks.
Aturan:
- Tugas harus konkret, murah (gratis atau < Rp 50.000), dan bisa selesai dalam 30-60 menit per hari.
- Setiap tugas harus spesifik untuk karir ini, bukan template umum.
- Variasikan: riset online, praktik mini, wawancara informasional, refleksi.
- Gunakan Bahasa Indonesia sehari-hari."""
    result = _call_gemini(prompt)
    if result:
        try:
            cleaned = _clean_json(result)
            return json.loads(cleaned)
        except (json.JSONDecodeError, IndexError):
            pass
    return _fallback_plan(career_title)

def _fallback_plan(career_title: str) -> list[str]:
    return [
        f"Hari 1: Cari 3 lowongan {career_title} di Jobstreet/Glints, catat skill wajib yang diminta",
        f"Hari 2: Tonton 1 video YouTube tentang keseharian {career_title} dari praktisi Indonesia",
        f"Hari 3: Coba 1 mini-project sederhana relevan dengan {career_title}",
        f"Hari 4: Cari dan hubungi 1 orang yang bekerja sebagai {career_title} via LinkedIn, tanya 3 hal tentang pekerjaannya",
        f"Hari 5: Baca artikel atau laporan industri tentang prospek dan gaji {career_title} di Indonesia",
        f"Hari 6: Bandingkan 2 jalur pendidikan/sertifikasi untuk masuk ke {career_title}",
        f"Hari 7: Tulis refleksi 1 paragraf: apa yang kamu pelajari minggu ini dan apakah kamu masih tertarik?"
    ]

# --- Roadmap ---

def generate_roadmap(career_title: str, profile_data: dict) -> list[str]:
    if not GEMINI_AVAILABLE:
        return _fallback_roadmap(career_title)
    prompt = f"""Buat rencana 30 hari untuk karir "{career_title}" dalam Bahasa Indonesia.
Output: JSON array of 4 tasks (minggu 1-4). Tugas harus konkret."""
    result = _call_gemini(prompt)
    if result:
        try:
            cleaned = _clean_json(result)
            return json.loads(cleaned)
        except Exception:
            pass
    return _fallback_roadmap(career_title)

def _fallback_roadmap(career_title: str) -> list[str]:
    return [
        f"Minggu 1: Pelajari dasar-dasar {career_title}",
        f"Minggu 2: Praktikkan skill dengan proyek kecil",
        f"Minggu 3: Bangun portofolio dan jaringan",
        f"Minggu 4: Apply ke lowongan entry-level"
    ]

# --- Skill Gap ---

def generate_skill_gap(career_title: str, user_skills: list[str], career_skills: list[str]) -> dict:
    if not GEMINI_AVAILABLE:
        return _fallback_skill_gap(user_skills, career_skills)
    prompt = f"""Analisis skill gap untuk karir {career_title}.
Skill user: {json.dumps(user_skills)}
Skill dibutuhkan: {json.dumps(career_skills)}
Output JSON: {{"matched": [str], "missing": [str], "recommendations": [str]}}"""
    result = _call_gemini(prompt)
    if result:
        try:
            cleaned = _clean_json(result)
            return json.loads(cleaned)
        except Exception:
            pass
    return _fallback_skill_gap(user_skills, career_skills)

def _fallback_skill_gap(user_skills: list[str], career_skills: list[str]) -> dict:
    user_set = set(s.lower() for s in user_skills)
    career_set = set(s.lower() for s in career_skills)
    return {
        "matched": [s for s in career_skills if s.lower() in user_set],
        "missing": [s for s in career_skills if s.lower() not in user_set],
        "recommendations": [f"Pelajari: {s}" for s in list(career_set - user_set)[:3]]
    }

# --- Family Discussion Script ---

def generate_family_script(career_title: str, profile_data: dict, reason: str) -> str:
    if not GEMINI_AVAILABLE:
        return f"Ibu/Ayah, setelah tes karir di Life Compass, aku dapat rekomendasi menjadi {career_title}. Ini cocok dengan minat dan keahlianku. Aku ingin menjelaskan kenapa aku memilih jalur ini dan apa rencanaku ke depan."
    prompt = f"""Buat skrip diskusi keluarga dalam Bahasa Indonesia. User mendapat rekomendasi karir: {career_title}.
Profil: {json.dumps(profile_data, ensure_ascii=False, indent=2)}
Alasan: {reason}
Buat poin-poin argumen 3-5 poin, bahasa santai tapi sopan."""
    result = _call_gemini(prompt)
    return result if result else f"Poin diskusi untuk {career_title}:\n1. Minatku cocok\n2. Prospek menjanjikan\n3. Aku punya rencana"

# --- Micro-Reward: Phase Insight Drop ---

PHASE_INSIGHT_PROMPTS = {
    "foundation": "User baru memulai discovery karir. Mereka menjawab: {answers}. Beri 1-2 kalimat insight yang memvalidasi keberanian mereka memulai perjalanan ini.",
    "skills": "User telah merefleksikan skill mereka: {answers}. Validasi usaha mereka untuk mengenali kemampuan diri.",
    "interests": "User telah mengidentifikasi minat dan aktivitas yang mereka nikmati: {answers}. Beri insight tentang bagaimana minat bisa menjadi kompas karir.",
    "values": "User telah merefleksikan nilai-nilai hidup dan trade-off karir mereka: {answers}. Validasi bahwa sadar akan prioritas adalah langkah besar.",
    "scenarios": "User menjawab skenario hipotetis tentang preferensi kerja: {answers}. Beri insight tentang pola kepribadian yang terlihat.",
    "barriers": "User telah mengidentifikasi hambatan dan keterbatasan mereka: {answers}. Validasi bahwa sadar akan tantangan adalah kekuatan.",
    "environment": "User memilih preferensi lingkungan kerja ideal: {answers}. Akhiri dengan insight bahwa mereka kini punya gambaran lebih jelas tentang tempat mereka bisa berkembang.",
}

def generate_phase_insight(phase_id: str, answers: dict) -> str:
    if not GEMINI_AVAILABLE or phase_id not in PHASE_INSIGHT_PROMPTS:
        return FALLBACK_INSIGHTS.get(phase_id, "Langkah kecil hari ini adalah fondasi untuk masa depan yang lebih jelas. Teruslah berefleksi!")
    prompt = PHASE_INSIGHT_PROMPTS[phase_id].format(answers=json.dumps(answers, ensure_ascii=False, indent=2))
    prompt += "\nBeri 1-2 kalimat insight singkat dalam Bahasa Indonesia yang hangat dan memvalidasi. Langsung ke insight, tanpa intro."
    result = _call_gemini(prompt)
    return result.strip() if result else FALLBACK_INSIGHTS.get(phase_id, "Setiap langkah refleksi membawamu lebih dekat pada karir yang sesuai.")

FALLBACK_INSIGHTS = {
    "foundation": "Kamu berani memulai perjalanan ini — itu sudah setengah dari perjuangan. Teruslah melangkah.",
    "skills": "Mengenali kemampuan diri adalah fondasi karir yang kokoh. Kamu sudah memiliki lebih dari yang kamu sadari.",
    "interests": "Minat adalah kompas alami dalam perjalanan karir. Semakin kamu kenali, semakin jelas arahmu.",
    "values": "Mengetahui apa yang benar-benar penting bagimu adalah kekuatan super. Banyak orang bekerja bertahun-tahun tanpa ini.",
    "scenarios": "Pola pilihanmu mengungkapkan banyak hal tentang bagaimana kamu akan berkembang di lingkungan kerja ideal.",
    "barriers": "Mengenali hambatan bukanlah kelemahan — itu peta jalan menuju solusi. Kamu sudah selangkah lebih maju.",
    "environment": "Sekarang kamu punya gambaran lebih jelas tentang lingkungan tempatmu bisa tumbuh. Langkah selanjutnya: temukan karir yang cocok!",
}

# --- Chatbot ---

CAREER_SYSTEM_PROMPT = """Kamu adalah mentor karir Indonesia untuk Life Compass. Tugasmu membantu pengguna dengan pertanyaan seputar karir, pendidikan, dan perencanaan kerja.

PEDOMAN RESPON:
1. Gunakan Bahasa Indonesia yang ramah, hangat, dan mendidik.
2. Beri saran yang praktis, realistis, dan sesuai konteks Indonesia.
3. Jika pertanyaan terlalu umum, ajukan 1-2 pertanyaan klarifikasi untuk memahami situasi pengguna.
4. Sarankan langkah konkret seperti eksperimen 7 hari, riset sederhana, atau skill yang bisa dipelajari gratis.
5. Jika ditanya tentang hasil Life Compass, bantu interpretasi skor dan dimensi.
6. Jangan pernah menjamin masa depan atau memberikan kepastian mutlak.
7. Jangan menggantikan konseling profesional (psikolog, konselor karir bersertifikat).
8. Jika pertanyaan di luar topik (medis, hukum, ilegal, berbahaya), arahkan kembali dengan ramah.
9. Jangan menyarankan pembayaran, premium, atau produk berbayar.
10. Jika ditanya tentang fitur Life Compass, jelaskan bahwa semua fitur gratis.

STRUKTUR RESPON YANG BAIK:
- Mulai dengan empati atau pengakuan terhadap pertanyaan.
- Beri analisis atau saran singkat (2-4 poin).
- Akhiri dengan pertanyaan terbuka atau saran langkah selanjutnya.

Contoh pertanyaan yang bisa ditanyakan:
- Apa yang paling kamu nikmati saat kuliah atau kerja sebelumnya?
- Skill apa yang paling sering kamu pakai?
- Coba cek hasil discovery di Life Compass untuk lihat rekomendasi awal."""

def chat_response(question: str, user_context: dict | None = None, db: Session | None = None) -> str:
    if not GEMINI_AVAILABLE:
        return _fallback_chat(question, user_context)
    
    # Check semantic cache first if db is provided
    if db and settings.CACHE_ENABLED:
        cached = _get_semantic_cache(question, db)
        if cached:
            return cached
    
    context = ""
    if user_context:
        parts = []
        if user_context.get("stage"):
            parts.append(f"- Tahap hidup: {user_context['stage']}")
        if user_context.get("education_level"):
            parts.append(f"- Pendidikan: {user_context['education_level']}")
        if user_context.get("interests"):
            parts.append(f"- Minat: {', '.join(user_context['interests'][:5])}")
        if user_context.get("skills"):
            parts.append(f"- Skill: {', '.join(user_context['skills'][:5])}")
        if user_context.get("skills_demonstrated"):
            parts.append(f"- Skill terbukti: {', '.join(user_context['skills_demonstrated'][:5])}")
        if user_context.get("constraints"):
            parts.append(f"- Batasan: {', '.join(user_context['constraints'][:3])}")
        if user_context.get("values_hierarchy"):
            parts.append(f"- Nilai utama: {', '.join(user_context['values_hierarchy'][:3])}")
        if user_context.get("anti_skills"):
            parts.append(f"- Anti-skill: {', '.join(user_context['anti_skills'][:3])}")
        if user_context.get("top_result"):
            parts.append(f"- Rekomendasi teratas: {user_context['top_result']} (skor {user_context.get('top_score', 0)}%, label: {user_context.get('top_label', '')})")
        if user_context.get("gap_analysis"):
            ga = user_context["gap_analysis"]
            if isinstance(ga, dict) and "skills" in ga:
                gaps = ga["skills"].get("critical_gaps", [])
                if gaps:
                    parts.append(f"- Critical gaps: {', '.join(g.get('skill', '') for g in gaps[:3])}")
        if user_context.get("runway_months") and user_context["runway_months"] not in ("none", "", None):
            parts.append(f"- Runway finansial: {user_context['runway_months']} bulan")
        if user_context.get("weekly_hours_available"):
            parts.append(f"- Waktu tersedia: {user_context['weekly_hours_available']} jam/minggu")
        if parts:
            context = "KONTEKS PENGGUNA:\n" + "\n".join(parts) + "\n\n"
    system_prompt = CAREER_SYSTEM_PROMPT + "\n\n" + context if context else CAREER_SYSTEM_PROMPT
    try:
        chat = _gemini_model.start_chat(system_instruction=system_prompt)
        resp = chat.send_message(question)
        text = resp.text
        if db:
            _set_semantic_cache(question, text, db)
        return text
    except Exception:
        return _fallback_chat(question, user_context)

def chat_response_stream(question: str, user_context: dict | None = None):
    """Streaming version of chat_response."""
    if not GEMINI_AVAILABLE:
        yield _fallback_chat(question, user_context)
        return
    context = ""
    if user_context:
        parts = []
        if user_context.get("stage"):
            parts.append(f"- Tahap hidup: {user_context['stage']}")
        if user_context.get("education_level"):
            parts.append(f"- Pendidikan: {user_context['education_level']}")
        if user_context.get("interests"):
            parts.append(f"- Minat: {', '.join(user_context['interests'][:5])}")
        if user_context.get("skills"):
            parts.append(f"- Skill: {', '.join(user_context['skills'][:5])}")
        if user_context.get("skills_demonstrated"):
            parts.append(f"- Skill terbukti: {', '.join(user_context['skills_demonstrated'][:5])}")
        if user_context.get("constraints"):
            parts.append(f"- Batasan: {', '.join(user_context['constraints'][:3])}")
        if user_context.get("values_hierarchy"):
            parts.append(f"- Nilai utama: {', '.join(user_context['values_hierarchy'][:3])}")
        if user_context.get("anti_skills"):
            parts.append(f"- Anti-skill: {', '.join(user_context['anti_skills'][:3])}")
        if user_context.get("top_result"):
            parts.append(f"- Rekomendasi teratas: {user_context['top_result']} (skor {user_context.get('top_score', 0)}%, label: {user_context.get('top_label', '')})")
        if user_context.get("gap_analysis"):
            ga = user_context["gap_analysis"]
            if isinstance(ga, dict) and "skills" in ga:
                gaps = ga["skills"].get("critical_gaps", [])
                if gaps:
                    parts.append(f"- Critical gaps: {', '.join(g.get('skill', '') for g in gaps[:3])}")
        if user_context.get("runway_months") and user_context["runway_months"] not in ("none", "", None):
            parts.append(f"- Runway finansial: {user_context['runway_months']} bulan")
        if user_context.get("weekly_hours_available"):
            parts.append(f"- Waktu tersedia: {user_context['weekly_hours_available']} jam/minggu")
        if parts:
            context = "KONTEKS PENGGUNA:\n" + "\n".join(parts) + "\n\n"
    system_prompt = CAREER_SYSTEM_PROMPT + "\n\n" + context if context else CAREER_SYSTEM_PROMPT
    try:
        chat = _gemini_model.start_chat(system_instruction=system_prompt)
        resp = chat.send_message(question, stream=True)
        for chunk in resp:
            if chunk.text:
                yield chunk.text
    except Exception:
        yield _fallback_chat(question, user_context)

def _fallback_chat(question: str, user_context: dict | None = None) -> str:
    q = question.lower()
    if user_context and user_context.get("top_result"):
        return (
            "Asisten sedang offline, tapi aku punya info dari hasil discovery-mu!\n\n"
            f"**Rekomendasi teratas**: {user_context['top_result']} "
            f"(skor {user_context.get('top_score', 0)}%)\n\n"
            "Coba:\n"
            "1. **Lihat detail hasil** di menu Result\n"
            "2. **Mulai eksperimen 7 hari** untuk mencoba karir ini\n"
            "3. **Tanya nanti** saat asisten online kembali"
        )
    if "gratis" in q or "free" in q or "bayar" in q or "harga" in q or "rp" in q:
        return "Life Compass 100% gratis. Semua fitur bisa diakses tanpa biaya."
    if "cara" in q or "pakai" in q:
        return "1. Daftar 2. Isi discovery 3. Dapat hasil 4. Eksplorasi laporan lengkap."
    if "beda" in q or "chatgpt" in q:
        return "Life Compass menggunakan data karir Indonesia + discovery terstruktur 9 dimensi, bukan tebakan biasa."
    if "aman" in q or "data" in q or "privasi" in q:
        return "Data dienkripsi, tidak dijual ke pihak ketiga, dan kamu bisa hapus akun kapan saja."
    if any(kw in q for kw in ["karir", "karier", "jurusan", "skill", "belajar", "kerja", "prospek", "gaji", "pendidikan", "pkwi", "magang", "interview", "wawancara", "cv", "portofolio", "sma", "smk", "kuliah", "lulus", "fresh graduate", "pindah karir", "bakat", "minat", "tes", "cocok"]):
        return (
            "Wah, pertanyaan bagus! 😊 Sayangnya saat ini asisten Life Compass sedang offline "
            "dan belum terhubung ke Gemini.\n\n"
            "Tapi kamu tetap bisa mulai dengan:\n"
            "1. **Isi Discovery** di dashboard — 7 fase, 9 dimensi penilaian\n"
            "2. **Dapatkan Career Intelligence Report** dengan gap analysis\n"
            "3. **Coba Eksperimen 7 hari** untuk uji karir pilihanmu\n\n"
            "Atau cek halaman FAQ: /faq"
        )
    return (
        "Pertanyaanmu agak di luar fokus Life Compass. Aku bisa bantu jika pertanyaannya berkaitan dengan "
        "arah karir, jurusan, skill, rencana belajar, eksperimen 7 hari, atau cara memakai fitur Life Compass.\n\n"
        "Contoh:\n"
        "- \"Aku bingung pilih karir setelah SMA\"\n"
        "- \"Skill apa yang harus kupelajari untuk data analyst?\"\n"
        "- \"Aku suka desain dan teknologi, cocoknya ke mana?\""
    )

# --- Challenge Mode ---

def evaluate_challenge(career_title: str, user_argument: str, original_score: float, dimensions: dict | None = None) -> dict:
    """Evaluasi argumen user yang menantang skor sistem.
    Returns: {mode: str, message: str, adjusted_score: float | None, explanation: str}
    """
    if not GEMINI_AVAILABLE:
        return {
            "mode": "Validating",
            "message": "Terima kasih sudah memberikan perspektifmu! Karena asisten AI sedang offline, argumenmu tetap kami catat. Skor tidak berubah.",
            "adjusted_score": None,
            "explanation": "Sistem sedang offline. Argumenmu akan ditinjau oleh tim kami."
        }
    dims_str = ""
    if dimensions:
        dims_str = "\nDimensi saat ini:\n" + "\n".join(f"- {k}: {v}" for k, v in dimensions.items())
    prompt = f"""Kamu adalah sistem evaluasi skor karir yang adil dan jujur. User tidak setuju dengan skor yang diberikan sistem.

Karir: {career_title}
Skor sistem: {original_score}
{dims_str}

Argumen user:
"{user_argument}"

Tugasmu:
1. Evaluasi argumen user secara objektif.
2. Tentukan mode respons:
   - "Reconsidering" = Argumen user valid, skor perlu disesuaikan (ubah skor ±5-15 poin)
   - "Contextualizing" = Argumen user masuk akal tapi tidak mengubah skor secara fundamental (skor tetap atau ±1-3 poin)
   - "Validating" = Argumen user sudah diakomodasi oleh sistem. Skor tetap.
3. Berikan penjelasan yang jujur dan hangat dalam Bahasa Indonesia.
4. Jika reconsidering, berikan adjusted_score yang baru.

Output JSON strict:
{{"mode": "Reconsidering" | "Contextualizing" | "Validating", "explanation": str, "adjusted_score": float | null}}
"""
    result = _call_gemini(prompt)
    if result:
        try:
            cleaned = _clean_json(result)
            data = json.loads(cleaned)
            mode = data.get("mode", "Validating")
            expl = data.get("explanation", "Argumenmu tercatat.")
            adjusted = data.get("adjusted_score")
            msg = ""
            if mode == "Reconsidering":
                msg = f"Kamu benar! Setelah mengevaluasi argumenmu, sistem merevisi skor."
            elif mode == "Contextualizing":
                msg = "Argumenmu masuk akal. Sistem mempertahankan skor tapi dengan konteks baru."
            else:
                msg = "Perspektifmu kami hargai. Skor sistem sudah mengakomodasi hal ini."
            return {"mode": mode, "message": msg, "adjusted_score": adjusted, "explanation": expl}
        except (json.JSONDecodeError, TypeError):
            pass
    return {
        "mode": "Validating",
        "message": "Terima kasih! Argumenmu telah tercatat. Skor tetap dipertahankan.",
        "adjusted_score": None,
        "explanation": "Sistem gagal memproses evaluasi. Silakan coba lagi."
    }
