from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Any
from datetime import datetime
import re

EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

class RegisterRequest(BaseModel):
    email: str
    password: str
    display_name: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not EMAIL_RE.match(v):
            raise ValueError("Format email tidak valid")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password minimal 6 karakter")
        return v

class LoginRequest(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    google_token: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: int

class RefreshRequest(BaseModel):
    refresh_token: str

class DiscoveryInput(BaseModel):
    stage: str
    education_level: Optional[str] = None
    location: Optional[str] = None
    interests: List[str] = []
    work_values: List[str] = []
    skills: List[str] = []
    constraints: List[str] = []
    work_preferences: list = []
    reflection: Optional[str] = None

    @field_validator("stage")
    @classmethod
    def validate_stage(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Stage wajib diisi")
        return v

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
    entry_barriers: List[str] = []
    source_notes: list = []
    status: str = "draft"
    last_reviewed_at: Optional[str] = None
    class Config:
        from_attributes = True

class CareerCreate(BaseModel):
    title: str
    category: str
    description: Optional[str] = None
    common_tasks: List[str] = []
    required_skills: List[str] = []
    optional_skills: List[str] = []
    education_paths: List[str] = []
    salary_min: Optional[str] = None
    salary_max: Optional[str] = None
    market_prospect: str = "Sedang"
    ai_risk: str = "Sedang"
    entry_barriers: List[str] = []
    source_notes: list = []
    status: str = "draft"

class CareerMatchOut(BaseModel):
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

class ExperimentPlanOut(BaseModel):
    id: int
    match_id: int
    career_title: str
    tasks: list
    task_status: List[dict] = []
    status: str
    completion_rate: float
    created_at: str

class ExperimentTaskUpdate(BaseModel):
    done: bool
    note: Optional[str] = None

class AdminStats(BaseModel):
    total_users: int
    completed_discovery: int

class AdminUserOut(BaseModel):
    id: int
    email: Optional[str] = None
    display_name: Optional[str] = None
    created_at: str

class AdminUserDetail(BaseModel):
    id: int
    email: Optional[str] = None
    display_name: Optional[str] = None
    auth_provider: str = ""
    created_at: str
    discovery_count: int = 0

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str

class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    stage: Optional[str] = None
    education_level: Optional[str] = None
    location: Optional[str] = None
    interests: Optional[List[str]] = None
    work_values: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    constraints: Optional[List[str]] = None
    work_preferences: Optional[list] = None
    reflection: Optional[str] = None

class LandingContentOut(BaseModel):
    hero_title: str
    hero_subtitle: str
    cta_text: str
    price: int
    testimonials: list = []

class LandingContentUpdate(BaseModel):
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    cta_text: Optional[str] = None
    price: Optional[int] = None

class AdminSettingsOut(BaseModel):
    gemini_available: bool
    gemini_key_set: bool
    r2_backup_enabled: bool
    career_data_version: int
    announcement: str = ""
    class Config:
        from_attributes = True


