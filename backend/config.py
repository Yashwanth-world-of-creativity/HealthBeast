from pydantic_settings import BaseSettings
from typing import List
import json

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "healthbeast"
    
    JWT_SECRET: str = "super_secret_healthbeast_token_hash_keys_longevity_99"
    JWT_ALGORITHM: str = "HS256"
    
    GOOGLE_API_KEY: str = ""
    
    CORS_ORIGINS: str = '["http://localhost:3000"]'

    @property
    def cors_origins_list(self) -> List[str]:
        try:
            return json.loads(self.CORS_ORIGINS)
        except Exception:
            return ["http://localhost:3000", "http://localhost:3001"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
