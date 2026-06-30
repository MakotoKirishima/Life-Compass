import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean, JSON, ForeignKey
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    google_id = Column(String, unique=True, nullable=True)
    display_name = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)
    auth_provider = Column(String, default="email")
    role = Column(String, default="user")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    token_hash = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class UserProfile(Base):
    __tablename__ = "user_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    stage = Column(String, nullable=True)
    education_level = Column(String, nullable=True)
    location = Column(String, nullable=True)
    interests = Column(JSON, default=list)
    work_values = Column(JSON, default=list)
    skills = Column(JSON, default=list)
    constraints = Column(JSON, default=list)
    work_preferences = Column(JSON, default=list)
    reflection = Column(Text, nullable=True)
    # v2 fields
    assessment_version = Column(String, default="v2")
    weekly_hours_available = Column(Integer, nullable=True)
    runway_months = Column(String, nullable=True)
    success_definition = Column(Text, nullable=True)
    aspirational_self = Column(Text, nullable=True)
    perceived_barriers = Column(JSON, default=list)
    cognitive_profile = Column(JSON, nullable=True)
    motivation_profile = Column(JSON, nullable=True)
    skills_demonstrated = Column(JSON, default=list)
    skills_implied = Column(JSON, default=list)
    skills_in_progress = Column(JSON, default=list)
    anti_skills = Column(JSON, default=list)
    activity_interests = Column(JSON, default=list)
    problem_interests = Column(JSON, default=list)
    inferred_holland = Column(String, nullable=True)
    values_hierarchy = Column(JSON, default=list)
    constraint_details = Column(JSON, default=list)
    environment_scenarios = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Career(Base):
    __tablename__ = "careers"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    category = Column(String, index=True)
    subcategories = Column(JSON, default=list)
    aliases = Column(JSON, default=list)
    description = Column(Text)
    day_in_the_life = Column(Text, nullable=True)
    common_misconceptions = Column(JSON, default=list)
    common_tasks = Column(JSON, default=list)
    required_skills = Column(JSON, default=list)
    optional_skills = Column(JSON, default=list)
    soft_skills = Column(JSON, default=list)
    anti_skills = Column(JSON, default=list)
    education_paths = Column(JSON, default=list)
    alternative_paths = Column(JSON, default=list)
    path_success_rates = Column(JSON, nullable=True)
    credential_weight = Column(Integer, default=3)
    salary_min = Column(String, nullable=True)
    salary_max = Column(String, nullable=True)
    salary_entry = Column(JSON, nullable=True)
    salary_mid = Column(JSON, nullable=True)
    salary_senior = Column(JSON, nullable=True)
    income_trajectory = Column(String, default="linear")
    market_prospect = Column(String, default="Sedang")
    global_demand = Column(String, nullable=True)
    growth_rate_5yr = Column(String, nullable=True)
    saturation_risk = Column(String, default="Rendah")
    ai_risk = Column(String, default="Sedang")
    ai_displacement_score = Column(Float, nullable=True)
    ai_displacement_timeline = Column(String, nullable=True)
    ai_affected_tasks = Column(JSON, default=list)
    ai_resilient_tasks = Column(JSON, default=list)
    remote_availability = Column(String, default="Rendah")
    geographic_hotspots = Column(JSON, default=list)
    entry_barriers = Column(JSON, default=list)
    time_to_first_job = Column(JSON, nullable=True)
    interview_difficulty = Column(Integer, default=2)
    typical_application_count = Column(String, nullable=True)
    gatekeeping_factors = Column(JSON, default=list)
    experience_catch_22 = Column(Integer, default=2)
    career_ladder = Column(JSON, default=list)
    time_to_senior = Column(String, nullable=True)
    time_to_expert = Column(String, nullable=True)
    management_track = Column(Boolean, default=False)
    ic_track = Column(Boolean, default=True)
    entrepreneurial_exit = Column(String, default="Rendah")
    common_pivots_from = Column(JSON, default=list)
    common_pivots_to = Column(JSON, default=list)
    adjacent_careers = Column(JSON, default=list)
    bridge_careers = Column(JSON, default=list)
    aspiration_careers = Column(JSON, default=list)
    specialization_options = Column(JSON, default=list)
    typical_team_size = Column(String, nullable=True)
    pace = Column(String, default="sedang")
    autonomy_level = Column(Integer, default=3)
    feedback_frequency = Column(String, default="bulanan")
    learning_culture = Column(Integer, default=3)
    bureaucracy_level = Column(Integer, default=3)
    work_life_balance = Column(Integer, default=3)
    travel_requirement = Column(String, default="none")
    thrives_on = Column(JSON, default=list)
    struggles_with = Column(JSON, default=list)
    holland_codes = Column(JSON, default=list)
    burnout_risk_factors = Column(JSON, default=list)
    longevity_predictors = Column(JSON, default=list)
    source_notes = Column(JSON, default=list)
    status = Column(String, default="draft")
    last_reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CareerMatch(Base):
    __tablename__ = "career_matches"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    profile_snapshot = Column(JSON, default=dict)
    results = Column(JSON, default=list)
    pivot_map = Column(JSON, nullable=True)
    gap_analysis = Column(JSON, nullable=True)
    hiring_readiness = Column(JSON, nullable=True)
    is_free_visible = Column(Boolean, default=True)
    cache_key = Column(String, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ExperimentPlan(Base):
    __tablename__ = "experiment_plans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    match_id = Column(Integer)
    career_title = Column(String)
    tasks = Column(JSON, default=list)
    status = Column(String, default="active")
    completion_rate = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ExperimentTaskStatus(Base):
    __tablename__ = "experiment_task_status"
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer)
    task_index = Column(Integer)
    done = Column(Boolean, default=False)
    note = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class CacheEntry(Base):
    __tablename__ = "cache"
    id = Column(Integer, primary_key=True, index=True)
    cache_key = Column(String, unique=True, index=True)
    data = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DeterministicCache(Base):
    __tablename__ = "deterministic_cache"
    id = Column(Integer, primary_key=True, index=True)
    hash_key = Column(String, unique=True, index=True)
    response_json = Column(JSON)
    prompt_key = Column(String, index=True)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SemanticCache(Base):
    __tablename__ = "semantic_cache"
    id = Column(Integer, primary_key=True, index=True)
    cache_key = Column(String, unique=True, index=True)
    prompt_text = Column(Text)
    embedding = Column(JSON)
    response_text = Column(Text)
    model_used = Column(String, default="gemini-1.5-flash")
    hit_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ChatLog(Base):
    __tablename__ = "chat_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    question = Column(Text)
    answer = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class LandingContent(Base):
    __tablename__ = "landing_content"
    id = Column(Integer, primary_key=True, index=True)
    hero_title = Column(String, default="")
    hero_subtitle = Column(String, default="")
    cta_text = Column(String, default="")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Testimonial(Base):
    __tablename__ = "testimonials"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    text = Column(Text)
    role = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AdminSetting(Base):
    __tablename__ = "admin_settings"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(Text)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
