from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    service_id: str
    title: str
    date: str
    time: str
    type: str
    team: str = "envoy_nation"
    is_combined: bool = False
    description: Optional[str] = None
    created_by: str
    created_at: datetime

class ServiceCreate(BaseModel):
    title: str
    date: str
    time: str
    type: str
    team: str = "envoy_nation"
    is_combined: bool = False
    description: Optional[str] = None
