from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_ENV: str = "development"
    DATABASE_URL: str = "sqlite:////data/life_compass.db"
    DATA_DIR: str = "/data"
    FRONTEND_URL: str = "http://localhost:3000"
    API_PUBLIC_URL: str = "http://localhost:8000"
    SECRET_KEY: str = ""
    REFRESH_TOKEN_SECRET: str = ""
    REFLECTION_ENCRYPTION_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    GOOGLE_CLIENT_ID: str = ""
    GEMINI_API_KEY: str = ""
    MAYAR_API_KEY: str = ""
    MAYAR_WEBHOOK_SECRET: str = ""
    MAYAR_PRODUCT_PRICE: int = 25000
    MAYAR_PRODUCT_TYPE: str = "full_report"
    ADMIN_EMAILS: str = ""
    INITIAL_ADMIN_EMAIL: str = ""
    INITIAL_ADMIN_PASSWORD: str = ""
    CORS_ALLOWED_ORIGINS: str = ""
    CLOUDFLARED_TOKEN: str = ""
    R2_BACKUP_ENABLED: bool = False
    R2_BUCKET: str = ""
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    CACHE_ENABLED: bool = True
    CAREER_DATA_VERSION: int = 1

    class Config:
        env_file = ".env"

settings = Settings()
