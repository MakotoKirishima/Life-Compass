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
    # v2 fields
    weekly_hours_available: Optional[int] = None
    runway_months: Optional[str] = None
    success_definition: Optional[str] = None
    aspirational_self: Optional[str] = None
    perceived_barriers: Optional[List[str]] = None
    skills_demonstrated: Optional[List[str]] = None
    skills_in_progress: Optional[List[str]] = None
    anti_skills: Optional[List[str]] = None
    activity_interests: Optional[List[str]] = None
    problem_interests: Optional[List[str]] = None
    values_hierarchy: Optional[List[str]] = None

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
    subcategories: List[str] = []
    description: str
    common_tasks: List[str] = []
    required_skills: List[str] = []
    optional_skills: List[str] = []
    soft_skills: List[str] = []
    education_paths: List[str] = []
    alternative_paths: List[str] = []
    salary_entry: Optional[dict] = None
    salary_mid: Optional[dict] = None
    salary_senior: Optional[dict] = None
    market_prospect: str = "Sedang"
    growth_rate_5yr: Optional[str] = None
    ai_risk: str = "Sedang"
    ai_displacement_score: Optional[float] = None
    remote_availability: str = "Rendah"
    entry_barriers: List[str] = []
    interview_difficulty: int = 2
    career_ladder: List[str] = []
    management_track: bool = False
    adjacent_careers: List[str] = []
    bridge_careers: List[str] = []
    aspiration_careers: List[str] = []
    typical_team_size: Optional[str] = None
    pace: str = "sedang"
    autonomy_level: int = 3
    work_life_balance: int = 3
    thrives_on: List[str] = []
    struggles_with: List[str] = []
    holland_codes: List[str] = []
    burnout_risk_factors: List[str] = []
    source_notes: list = []
    status: str = "draft"
    last_reviewed_at: Optional[str] = None
    class Config:
        from_attributes = True

class CareerCreate(BaseModel):
    title: str
    category: str
    description: Optional[str] = None
    required_skills: List[str] = []
    optional_skills: List[str] = []
    soft_skills: List[str] = []
    education_paths: List[str] = []
    alternative_paths: List[str] = []
    salary_min: Optional[str] = None
    salary_max: Optional[str] = None
    market_prospect: str = "Sedang"
    ai_risk: str = "Sedang"
    entry_barriers: List[str] = []
    source_notes: list = []
    status: str = "draft"
    management_track: bool = False
    adjacent_careers: List[str] = []
    bridge_careers: List[str] = []

# --- v2 Scoring Output Schemas ---

class DimensionScore(BaseModel):
    raw: float = 0.0
    confidence: float = 0.0
    weight: float = 0.0
    reasoning: str = ""
    data_points: List[str] = []

class V2CareerDimensionScores(BaseModel):
    skills_alignment: DimensionScore = DimensionScore()
    interest_resonance: DimensionScore = DimensionScore()
    values_alignment: DimensionScore = DimensionScore()
    cognitive_fit: DimensionScore = DimensionScore()
    education_alignment: DimensionScore = DimensionScore()
    constraint_impact: DimensionScore = DimensionScore()
    environment_fit: DimensionScore = DimensionScore()
    market_timing: DimensionScore = DimensionScore()
    trajectory_alignment: DimensionScore = DimensionScore()

class GapItem(BaseModel):
    skill: str
    severity: str = "Medium"
    close_pathway: str = ""
    estimated_time: str = ""
    cost: str = ""

class SkillGapReport(BaseModel):
    critical_gaps: List[GapItem] = []
    important_gaps: List[GapItem] = []
    accelerator_gaps: List[GapItem] = []
    anti_skill_conflicts: List[dict] = []

class EducationGapReport(BaseModel):
    user_level: str = ""
    career_typical: str = ""
    career_minimum: str = ""
    recommendation: str = ""
    estimated_time: str = ""
    estimated_cost: str = ""

class PortfolioGapReport(BaseModel):
    missing: List[dict] = []
    present: List[str] = []

class InterviewGapReport(BaseModel):
    technical_readiness: str = "Perlu persiapan"
    behavioral_readiness: str = "Perlu persiapan"
    domain_readiness: str = "Perlu persiapan"
    gaps: List[str] = []

class PersonalizedTimeline(BaseModel):
    total_months: int = 6
    milestones: List[dict] = []
    urgent_path: Optional[str] = None

class GapAnalysis(BaseModel):
    skills: SkillGapReport = SkillGapReport()
    education: EducationGapReport = EducationGapReport()
    portfolio: PortfolioGapReport = PortfolioGapReport()
    interview: InterviewGapReport = InterviewGapReport()
    timeline: PersonalizedTimeline = PersonalizedTimeline()

class HiringReadinessReport(BaseModel):
    score: float = 0.0
    portfolio_completeness: float = 0.0
    skill_evidence: float = 0.0
    interview_preparedness: float = 0.0
    professional_presence: float = 0.0
    credential_legitimacy: float = 0.0

class V2CareerScoreResult(BaseModel):
    career_id: int
    title: str
    feasibility_flag: str = "REACHABLE_NOW"
    feasibility_reason: str = ""
    dimensions: V2CareerDimensionScores = V2CareerDimensionScores()
    dynamic_weights: dict = {}
    weighted_raw_score: float = 0.0
    confidence_score: float = 0.0
    final_adjusted_score: float = 0.0
    confidence_band: List[float] = [0, 0]
    tier: int = 3
    label: str = ""
    headline: str = ""
    reasoning: List[str] = []
    gap_analysis: Optional[GapAnalysis] = None
    hiring_readiness: Optional[HiringReadinessReport] = None
    personalized_timeline: Optional[PersonalizedTimeline] = None

class V2CareerIntelligenceReport(BaseModel):
    match_id: int
    assessment_version: str = "v2"
    summary: str = ""
    tier1: List[V2CareerScoreResult] = []
    tier2: List[V2CareerScoreResult] = []
    tier3: List[V2CareerScoreResult] = []
    pivot_map: Optional[List[dict]] = None
    experiment_plan: List[str] = []
    risk_note: str = ""

class CareerMatchOut(BaseModel):
    career_title: str
    score: float
    label: str
    reason: str

# Keep backward-compatible schemas
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

class PhaseInsightRequest(BaseModel):
    phase_id: str
    answers: dict

class ChallengeRequest(BaseModel):
    career_title: str
    user_argument: str
    original_score: float
    dimensions: Optional[dict] = None

class ChallengeResponse(BaseModel):
    mode: str  # "Reconsidering" | "Contextualizing" | "Validating"
    message: str
    adjusted_score: Optional[float] = None
    explanation: str

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
    weekly_hours_available: Optional[int] = None
    success_definition: Optional[str] = None
    aspirational_self: Optional[str] = None

class LandingContentOut(BaseModel):
    hero_title: str
    hero_subtitle: str
    cta_text: str
    testimonials: list = []

class LandingContentUpdate(BaseModel):
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    cta_text: Optional[str] = None

class AdminSettingsOut(BaseModel):
    ai_available: bool = False
    ai_provider: str = "none"
    gemini_available: bool = False
    gemini_key_set: bool = False
    r2_backup_enabled: bool = False
    career_data_version: int = 1
    announcement: str = ""
    class Config:
        from_attributes = True
