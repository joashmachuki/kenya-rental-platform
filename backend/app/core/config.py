from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./rental_platform.db"
    SECRET_KEY: str = "kenya-rental-platform-secret-key-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 5242880

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
