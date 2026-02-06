from pydantic import BaseModel
from typing import List, Optional

class GenerateRequest(BaseModel):
    prompt: str
    session_id: Optional[int] = None

class GenerateResponse(BaseModel):
    session_id: int
    code: str
    glb_url: str
    error: Optional[str] = None
