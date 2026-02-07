from pydantic import BaseModel, ConfigDict
from datetime import datetime

class InAppNotification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    notification_id: str
    user_id: str
    title: str
    message: str
    type: str
    read: bool = False
    created_at: datetime

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: str
