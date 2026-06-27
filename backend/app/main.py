from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.config import settings
from app.routes import auth, discovery, career, payment, admin, chatbot

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Life Compass API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(discovery.router)
app.include_router(career.router)
app.include_router(payment.router)
app.include_router(admin.router)
app.include_router(chatbot.router)

@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}

@app.get("/api/sample-report")
def sample_report():
    return {
        "summary": "Kamu memiliki minat di bidang teknologi dan kreativitas. Dengan skill analisa dan desain yang kamu miliki, beberapa karir menarik bisa kamu coba.",
        "top_recommendation": {
            "career_title": "UI/UX Designer",
            "score": 85,
            "label": "Cocok Tinggi",
            "reason": "Minat desain + skill analisa cocok dengan tugas utama UI/UX Designer"
        },
        "exploration": {
            "career_title": "Frontend Developer",
            "score": 72,
            "label": "Cocok Sedang",
            "reason": "Kreativitas dan ketelitianmu berguna di pengembangan frontend"
        },
        "risk_note": "Pastikan kamu meng-update skill secara berkala mengikuti tren industri.",
        "experiment_plan": [
            "Hari 1: Cari 3 lowongan UI/UX Designer dan catat skill yang diminta",
            "Hari 2: Tonton 1 video tentang keseharian UI/UX Designer",
            "Hari 3: Coba redesign 1 aplikasi sederhana",
            "Hari 4: Hubungi 1 orang yang bekerja sebagai UI/UX Designer",
            "Hari 5: Baca artikel tentang perkembangan desain digital",
            "Hari 6: Bandingkan 2 jalur pendidikan untuk UI/UX Designer",
            "Hari 7: Diskusikan dengan teman tentang apa yang kamu pelajari"
        ]
    }
