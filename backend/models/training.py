from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class TrainingVideo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    video_id: str
    title: str
    youtube_url: str
    category: str
    duration: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime

class TrainingVideoCreate(BaseModel):
    title: str
    youtube_url: str
    category: str
    duration: Optional[str] = None
    description: Optional[str] = None

class TrainingMaterial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    material_id: str
    title: str
    url: str
    type: str
    category: str
    description: Optional[str] = None
    created_at: datetime

class TrainingMaterialCreate(BaseModel):
    title: str
    url: str
    type: str
    category: str
    description: Optional[str] = None

class TrainingProgress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    video_id: str
    completed: bool = False
    completed_at: Optional[datetime] = None
