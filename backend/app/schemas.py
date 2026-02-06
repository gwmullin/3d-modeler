from pydantic import BaseModel
from typing import List, Optional

class GenerateRequest(BaseModel):
    prompt: str
    session_id: Optional[int] = None
    image: Optional[str] = None # Base64 encoded image data

class GenerateResponse(BaseModel):
    session_id: int
    code: str
    glb_url: str
    error: Optional[str] = None
