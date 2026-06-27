import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean, JSON
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    google_id = Column(String, unique=True, nullable=True)
    display_name = Column(String, nullable=True)
    auth_provider = Column(String, default="google")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

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
    work_preferences = Column(JSON, default=dict)
    reflection = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Career(Base):
    __tablename__ = "careers"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    category = Column(String, index=True)
    description = Column(Text)
    common_tasks = Column(JSON, default=list)
    required_skills = Column(JSON, default=list)
    optional_skills = Column(JSON, default=list)
    education_paths = Column(JSON, default=list)
    salary_min = Column(String, nullable=True)
    salary_max = Column(String, nullable=True)
    market_prospect = Column(String, default="Sedang")
    ai_risk = Column(String, default="Sedang")
    entry_barriers = Column(JSON, default=list)
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

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    provider = Column(String, default="mayar")
    external_reference = Column(String, unique=True, nullable=True)
    amount = Column(Integer)
    currency = Column(String, default="IDR")
    status = Column(String, default="pending")
    product_type = Column(String, default="full_report")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class UserEntitlement(Base):
    __tablename__ = "user_entitlements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    product_type = Column(String)
    status = Column(String, default="active")
    starts_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

class CacheEntry(Base):
    __tablename__ = "cache"
    id = Column(Integer, primary_key=True, index=True)
    cache_key = Column(String, unique=True, index=True)
    data = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ChatLog(Base):
    __tablename__ = "chat_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    question = Column(Text)
    answer = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
