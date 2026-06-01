from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "StockPilot API"
    database_url: str
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    admin_email: str = "admin@stockpilot.com"
    admin_password: str = "admin123"
    auth_secret: str

    model_config = SettingsConfigDict(env_file=(".env", "../.env"), extra="ignore")

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
