import json
import hashlib
from sqlalchemy.orm import Session
from app.config import settings
from app.models import Career, CacheEntry

GEMINI_AVAILABLE = False
model = None

if settings.GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        GEMINI_AVAILABLE = True
    except Exception:
        pass

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

def _call_gemini(prompt: str) -> str:
    if not GEMINI_AVAILABLE or not model:
        return ""
    try:
        resp = model.generate_content(prompt)
        return resp.text
    except Exception:
        return ""

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

Output: JSON array saja, tanpa teks lain. Format: [{{"career_id": int, "title": str, "score": float, "label": str, "reason": str}}]
Label: Cocok Tinggi (>=80), Cocok Sedang (60-79), Coba Dulu (40-59), Kurang Cocok (<40)"""

        result = _call_gemini(prompt)
        if result:
            try:
                cleaned = result.strip()
                if cleaned.startswith("```json"):
                    cleaned = cleaned.split("```json")[1].split("```")[0]
                elif cleaned.startswith("```"):
                    cleaned = cleaned.split("```")[1].split("```")[0]
                results = json.loads(cleaned.strip())
                _set_cache(cache_key, {"results": results, "cache_key": cache_key}, db)
                return results
            except (json.JSONDecodeError, KeyError, IndexError):
                pass

    return _fallback_scoring(profile_data, careers, db)

def _fallback_scoring(profile_data: dict, careers: list, db: Session) -> list[dict]:
    results = []
    user_interests = set(i.lower() for i in profile_data.get("interests", []))
    user_skills = set(s.lower() for s in profile_data.get("skills", []))
    user_values = set(v.lower() for v in profile_data.get("work_values", []))

    for c in careers:
        score = 50.0
        reasons = []

        career_skills = set(s.lower() for s in (c.required_skills or []))
        overlap = user_skills & career_skills
        if overlap:
            score += len(overlap) * 5
            reasons.append(f"Skill cocok: {', '.join(list(overlap)[:3])}")

        if user_interests:
            cat_match = any(kw in c.category.lower() for kw in user_interests)
            if cat_match:
                score += 10
                reasons.append("Kategori sesuai minat")

        score = min(score, 98)

        if score >= 80:
            label = "Cocok Tinggi"
        elif score >= 60:
            label = "Cocok Sedang"
        elif score >= 40:
            label = "Coba Dulu"
        else:
            label = "Kurang Cocok"

        results.append({
            "career_id": c.id,
            "title": c.title,
            "score": round(score, 1),
            "label": label,
            "reason": "; ".join(reasons[:2]) if reasons else "Belum ada data cukup"
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    cache_key = hashlib.md5(
        (json.dumps(profile_data, sort_keys=True) + f"_v{settings.CAREER_DATA_VERSION}").encode()
    ).hexdigest()
    _set_cache(cache_key, {"results": results, "cache_key": cache_key}, db)
    return results

def generate_summary(profile_data: dict) -> str:
    if not GEMINI_AVAILABLE:
        return _fallback_summary(profile_data)

    prompt = f"""Buat ringkasan profil karir 2-3 paragraf dalam Bahasa Indonesia dari data berikut:
{json.dumps(profile_data, ensure_ascii=False, indent=2)}

Fokus: minat, nilai kerja, skill, dan kendala user. Bahasa Indonesia yang ramah."""
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

def generate_experiment_plan(career_title: str, profile_data: dict) -> list[str]:
    if not GEMINI_AVAILABLE:
        return _fallback_plan(career_title)

    prompt = f"""Buat rencana eksperimen 7 hari untuk karir "{career_title}" dalam Bahasa Indonesia. Profil user:
{json.dumps(profile_data, ensure_ascii=False, indent=2)}

Output: JSON array of 7 string tasks. Tugas harus konkret, murah, dan bisa dilakukan dalam 30-60 menit per hari."""
    result = _call_gemini(prompt)
    if result:
        try:
            cleaned = result.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned.split("```json")[1].split("```")[0]
            elif cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1].split("```")[0]
            return json.loads(cleaned.strip())
        except (json.JSONDecodeError, IndexError):
            pass
    return _fallback_plan(career_title)

def _fallback_plan(career_title: str) -> list[str]:
    return [
        f"Hari 1: Cari 3 lowongan {career_title} dan catat skill yang diminta",
        f"Hari 2: Tonton 1 video tentang keseharian {career_title}",
        f"Hari 3: Coba 1 mini-project sederhana di bidang ini",
        f"Hari 4: Hubungi 1 orang yang bekerja sebagai {career_title}",
        f"Hari 5: Baca artikel tentang perkembangan karir ini",
        f"Hari 6: Bandingkan 2 jalur pendidikan untuk masuk ke bidang ini",
        f"Hari 7: Diskusikan dengan teman/keluarga tentang apa yang kamu pelajari"
    ]

def generate_roadmap(career_title: str, profile_data: dict) -> list[str]:
    if not GEMINI_AVAILABLE:
        return _fallback_roadmap(career_title)
    prompt = f"""Buat rencana 30 hari untuk karir "{career_title}" dalam Bahasa Indonesia.
Output: JSON array of 4 tasks (minggu 1-4). Tugas harus konkret."""
    result = _call_gemini(prompt)
    if result:
        try:
            cleaned = result.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned.split("```json")[1].split("```")[0]
            elif cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1].split("```")[0]
            return json.loads(cleaned.strip())
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
            cleaned = result.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned.split("```json")[1].split("```")[0]
            elif cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1].split("```")[0]
            return json.loads(cleaned.strip())
        except Exception:
            pass
    return _fallback_skill_gap(user_skills, career_skills)

def _fallback_skill_gap(user_skills: list[str], career_skills: list[str]) -> dict:
    user_set = set(s.lower() for s in user_skills)
    career_set = set(s.lower() for s in career_skills)
    matched = list(user_set & career_set)
    missing = list(career_set - user_set)
    return {
        "matched": [s for s in career_skills if s.lower() in user_set],
        "missing": [s for s in career_skills if s.lower() not in user_set],
        "recommendations": [f"Pelajari: {s}" for s in missing[:3]]
    }

def generate_family_script(career_title: str, profile_data: dict, reason: str) -> str:
    if not GEMINI_AVAILABLE:
        return f"Ibu/Ayah, setelah tes karir di Life Compass, aku dapat rekomendasi menjadi {career_title}. Ini cocok dengan minat dan keahlianku. Aku ingin menjelaskan kenapa aku memilih jalur ini dan apa rencanaku ke depan."
    prompt = f"""Buat skrip diskusi keluarga dalam Bahasa Indonesia. User mendapat rekomendasi karir: {career_title}.
Profil: {json.dumps(profile_data, ensure_ascii=False, indent=2)}
Alasan: {reason}
Buat poin-poin argumen 3-5 poin, bahasa santai tapi sopan."""
    result = _call_gemini(prompt)
    return result if result else f"Poin diskusi untuk {career_title}:\n1. Minatku cocok\n2. Prospek menjanjikan\n3. Aku punya rencana"

def chat_response(question: str) -> str:
    if not GEMINI_AVAILABLE:
        return _fallback_chat(question)

    system_prompt = """Kamu adalah asisten resmi Life Compass. Tugasmu hanya menjawab pertanyaan seputar:
- Cara menggunakan Life Compass
- Fitur gratis vs berbayar (Free Snapshot gratis, Full Report Rp25.000)
- Cara pembayaran (Mayar.id, Rp25.000 sekali bayar, akses seumur hidup)
- Cara baca hasil rekomendasi
- Kebijakan privasi
- Cara hapus akun

Jika ditanya di luar topik, jawab: "Maaf, saya hanya bisa membantu pertanyaan seputar Life Compass."
Gunakan Bahasa Indonesia yang ramah."""
    try:
        chat = model.start_chat(system_instruction=system_prompt)
        resp = chat.send_message(question)
        return resp.text
    except Exception:
        return _fallback_chat(question)

def _fallback_chat(question: str) -> str:
    q = question.lower()
    if "gratis" in q or "free" in q:
        return "Direction Snapshot GRATIS. Full Report Rp25.000."
    if "bayar" in q or "harga" in q or "rp" in q:
        return "Full Report Rp25.000 via Mayar.id (QRIS/VA/Transfer)."
    if "cara" in q or "pakai" in q:
        return "1. Daftar 2. Isi discovery 3. Dapat hasil 4. Upgrade jika mau."
    if "beda" in q or "chatgpt" in q:
        return "Life Compass pake data 80+ karir Indonesia + discovery terstruktur."
    if "aman" in q or "data" in q or "privasi" in q:
        return "Data dienkripsi, tidak dijual, bisa hapus akun kapan saja."
    return "Maaf, saya hanya bisa membantu seputar Life Compass. Cek FAQ di /faq."
