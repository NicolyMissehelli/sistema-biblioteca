from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Sistema de Biblioteca API"
    database_url: str = "sqlite:///./biblioteca.db"
    jwt_secret: str = "troque-esta-chave"
    access_token_expire_minutes: int = 60
    cors_origins: str = "http://localhost:3000"
    create_initial_admin: bool = False
    initial_admin_email: str = "admin@biblioteca.local"
    initial_admin_password: str = "TroqueEstaSenha"
    fine_per_day: float = 1.00

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
