from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./life_compass.db"
    SECRET_KEY: str = "life-compass-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    GEMINI_API_KEY: str = ""
    GOOGLE_CLIENT_ID: str = ""
    MAYAR_API_KEY: str = ""
    MAYAR_WEBHOOK_SECRET: str = ""
    FRONTEND_URL: str = "http://localhost:3000"
    CACHE_ENABLED: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
