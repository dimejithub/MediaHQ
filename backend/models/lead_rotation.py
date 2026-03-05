from pydantic import BaseModel, ConfigDict
from typing import Optional

class LeadRotation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    rotation_id: str
    week_number: int
    year: int
    lead_user_id: str
    backup_user_id: Optional[str] = None
    notes: Optional[str] = None

class LeadRotationCreate(BaseModel):
    week_number: int
    year: int
    lead_user_id: str
    backup_user_id: Optional[str] = None
    notes: Optional[str] = None
