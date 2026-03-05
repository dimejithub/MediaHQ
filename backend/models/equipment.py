from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class Equipment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    equipment_id: str
    name: str
    category: str
    status: str = "available"
    checked_out_by: Optional[str] = None
    checked_out_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime

class EquipmentCreate(BaseModel):
    name: str
    category: str
    notes: Optional[str] = None

class EquipmentHandover(BaseModel):
    model_config = ConfigDict(extra="ignore")
    handover_id: str
    equipment_id: str
    from_team: str
    to_team: str
    from_user_id: str
    to_user_id: str
    condition_before: str
    condition_notes: Optional[str] = None
    photo_urls: List[str] = []
    handover_date: str
    created_at: datetime

class EquipmentHandoverCreate(BaseModel):
    equipment_id: str
    to_team: str
    to_user_id: str
    condition_before: str
    condition_notes: Optional[str] = None
    photo_urls: List[str] = []
