from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # API Settings
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    API_WORKERS: int = int(os.getenv("API_WORKERS", "1"))
    API_RELOAD: bool = os.getenv("API_RELOAD", "true").lower() == "true"

    # OpenAI Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = "gpt-4"
    OPENAI_TEMPERATURE: float = 0.7
    OPENAI_MAX_TOKENS: int = 2000

    # CORS Settings
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]
    CORS_METHODS: List[str] = ["*"]
    CORS_HEADERS: List[str] = ["*"]

    # File Storage
    DATA_DIR: str = os.getenv("DATA_DIR", "/app/data")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "/app/uploads")
    EXPORT_DIR: str = os.getenv("EXPORT_DIR", "/app/exports")
    MAX_UPLOAD_SIZE: int = int(os.getenv("MAX_UPLOAD_SIZE", "100000000"))  # 100MB
    FILE_CLEANUP_HOURS: int = int(os.getenv("FILE_CLEANUP_HOURS", "24"))

    # Security
    API_KEY_HEADER: str = os.getenv("API_KEY_HEADER", "X-API-Key")
    DEFAULT_API_KEY: str = os.getenv("DEFAULT_API_KEY", "dev_key_123")

    # Workflow Settings
    MAX_NODES_PER_WORKFLOW: int = 50
    MAX_CONCURRENT_EXECUTIONS: int = 5
    EXECUTION_TIMEOUT: int = 3600  # 1 hour

    # AI Analysis Settings
    MIN_CONFIDENCE_THRESHOLD: float = 0.7
    MAX_SUGGESTIONS: int = 3
    ANALYSIS_TIMEOUT: int = 300  # 5 minutes

    # Kaggle Settings
    KAGGLE_USERNAME: str = os.getenv("KAGGLE_USERNAME", "")
    KAGGLE_KEY: str = os.getenv("KAGGLE_KEY", "")

    # Environment Settings
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="allow",
        case_sensitive=True
    )

settings = Settings() 