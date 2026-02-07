from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class ServiceReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    report_id: str
    service_id: str
    attendees: List[str]
    issues: Optional[str] = None
    equipment_status: Optional[str] = None
    improvements: Optional[str] = None
    next_steps: Optional[str] = None
    submitted_by: str
    created_at: datetime

class ServiceReportCreate(BaseModel):
    service_id: str
    attendees: List[str]
    issues: Optional[str] = None
    equipment_status: Optional[str] = None
    improvements: Optional[str] = None
    next_steps: Optional[str] = None
