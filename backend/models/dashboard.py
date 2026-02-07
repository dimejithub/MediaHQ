from pydantic import BaseModel

class TeamSummary(BaseModel):
    team: str
    total_members: int
    total_services: int
    total_rotas: int
    total_reports: int
    avg_reliability: float
    upcoming_services: int
