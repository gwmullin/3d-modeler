import os
from pydantic import BaseModel

class Settings(BaseModel):
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-pro")
    DATABASE_URL: str = "sqlite:///./cadquery_genai.db"

settings = Settings()
