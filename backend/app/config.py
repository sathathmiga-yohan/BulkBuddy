from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


# Backend root directory
BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):

    # DATABASE SETTINGS

    DATABASE_HOST: str
    DATABASE_PORT: int = 3306
    DATABASE_USER: str
    DATABASE_PASSWORD: str
    DATABASE_NAME: str

    # JWT SETTINGS

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ENVIRONMENT FILE CONFIGURATION

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


# Single settings instance
settings = Settings()