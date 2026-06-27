from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class LoginRequest(BaseModel):
    email: Optional[str] = None
    google_token: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int

class DiscoveryInput(BaseModel):
    stage: str
    education_level: Optional[str] = None
    location: Optional[str] = None
    interests: List[str] = []
    work_values: List[str] = []
    skills: List[str] = []
    constraints: List[str] = []
    work_preferences: dict = {}
    reflection: Optional[str] = None

class CareerOut(BaseModel):
    id: int
    title: str
    category: str
    description: str
    common_tasks: List[str] = []
    required_skills: List[str] = []
    optional_skills: List[str] = []
    education_paths: List[str] = []
    salary_min: Optional[str] = None
    salary_max: Optional[str] = None
    market_prospect: str = "Sedang"
    ai_risk: str = "Sedang"
    class Config:
        from_attributes = True

class CareerMatchOut(BaseModel):
    id: int
    career_title: str
    score: float
    label: str
    reason: str

class SnapshotOut(BaseModel):
    match_id: int
    summary: str
    top_recommendation: CareerMatchOut
    exploration: CareerMatchOut
    risk_note: str
    experiment_plan: List[str]
    is_paid_unlocked: bool = False

class FullReportOut(BaseModel):
    recommendations: List[CareerMatchOut]
    skill_gap: dict
    roadmap: List[str]
    family_script: str
    pdf_url: Optional[str] = None

class AdminUserOut(BaseModel):
    id: int
    email: Optional[str] = None
    display_name: Optional[str] = None
    created_at: datetime
    has_paid: bool = False

class AdminStats(BaseModel):
    total_users: int
    completed_discovery: int
    total_payments: int
    revenue: int

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
