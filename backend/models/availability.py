from pydantic import BaseModel, ConfigDict
from typing import Optional

class MemberAvailability(BaseModel):
    model_config = ConfigDict(extra="ignore")
    availability_id: str
    user_id: str
    date: str
    status: str
    notes: Optional[str] = None

class MemberAvailabilityCreate(BaseModel):
    date: str
    status: str
    notes: Optional[str] = None
