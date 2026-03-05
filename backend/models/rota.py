from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Optional
from datetime import datetime

class RotaAssignment(BaseModel):
    assignment_id: str
    user_id: str
    role: str
    status: str = "pending"

class Rota(BaseModel):
    model_config = ConfigDict(extra="ignore")
    rota_id: str
    service_id: str
    team: str = "envoy_nation"
    assignments: List[RotaAssignment]
    notes: Optional[str] = None
    created_at: datetime

class RotaCreate(BaseModel):
    service_id: str
    assignments: List[Dict[str, str]]
    notes: Optional[str] = None

class RotaConfirm(BaseModel):
    status: str
