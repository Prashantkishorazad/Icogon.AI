from datetime import datetime
from typing import Optional

from pydantic import BaseModel


# ============================================================
# CREATE PROJECT
# ============================================================

class ProjectCreate(BaseModel):
    name: str
    description: str


# ============================================================
# PROJECT RESPONSE
# ============================================================

class ProjectResponse(BaseModel):
    id: str
    user_id: Optional[str] = None

    name: str
    description: Optional[str] = None
    prompt: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None