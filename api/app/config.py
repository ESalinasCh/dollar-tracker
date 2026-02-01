from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings."""
    
    # API Settings
    api_host: str = "0.0.0.0"
    api_port: int = 3001
    api_title: str = "Dollar Tracker API"
    api_version: str = "1.0.0"
    
    # Cache
    cache_ttl: int = 60  # seconds
    
    # Database
    mongo_url: str = "mongodb://localhost:27017"
    mongo_db_name: str = "dollar_tracker"
    
    # External APIs
    # External APIs
    dolar_api_url: str = "https://bo.dolarapi.com/v1"
    exchange_rate_api_url: str = "https://api.exchangerate-api.com/v4"
    
    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    
    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
