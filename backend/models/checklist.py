from pydantic import BaseModel, ConfigDict
from typing import List, Dict
from datetime import datetime

class ChecklistItem(BaseModel):
    item_id: str
    text: str
    completed: bool = False

class Checklist(BaseModel):
    model_config = ConfigDict(extra="ignore")
    checklist_id: str
    service_id: str
    title: str
    items: List[ChecklistItem]
    created_at: datetime

class ChecklistCreate(BaseModel):
    service_id: str
    title: str
    items: List[Dict[str, str]]
