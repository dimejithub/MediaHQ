from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "member"
    teams: List[str] = []
    primary_team: Optional[str] = None
    skills: List[str] = []
    availability: str = "available"
    phone: Optional[str] = None
    created_at: datetime

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime

class SessionData(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    skills: Optional[List[str]] = None
    availability: Optional[str] = None
    phone: Optional[str] = None
