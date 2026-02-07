"""
Fallback data for TEN MediaHQ when MongoDB is unavailable.
This ensures the app works even without database connectivity.
"""

# Predefined team members
TEAM_MEMBERS = [
    {"user_id": "user_adebowale", "name": "Adebowale Owoseni", "email": "adebowale@tenmediahq.com", "role": "director", "teams": ["envoy_nation", "e_nation"], "primary_team": "envoy_nation", "skills": ["Leadership", "Vision"], "availability": "available", "picture": None},
    {"user_id": "user_adeola", "name": "Adeola Hilton", "email": "adeola@tenmediahq.com", "role": "team_lead", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["Camera", "Directing"], "availability": "available", "picture": None},
    {"user_id": "user_oladimeji", "name": "Oladimeji Tiamiyu", "email": "oladimeji@tenmediahq.com", "role": "assistant_lead", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["Sound", "Livestream"], "availability": "available", "picture": None},
    {"user_id": "user_michel", "name": "Michel Adimula", "email": "michel@tenmediahq.com", "role": "unit_head", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["Graphics", "ProPresenter"], "availability": "available", "picture": None},
    {"user_id": "user_oluseye", "name": "Oluseye Ogunleye", "email": "oluseye@tenmediahq.com", "role": "unit_head", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["Camera", "Video"], "availability": "available", "picture": None},
    {"user_id": "user_oladipupo", "name": "Oladipupo Hilton", "email": "oladipupo@tenmediahq.com", "role": "unit_head", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["Lighting", "Stage"], "availability": "available", "picture": None},
    {"user_id": "user_jasper", "name": "Jasper Eromon", "email": "jasper@tenmediahq.com", "role": "member", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["Camera"], "availability": "available", "picture": None},
    {"user_id": "user_gabriel", "name": "Gabriel Oladipo", "email": "gabriel@tenmediahq.com", "role": "member", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["Sound"], "availability": "available", "picture": None},
    {"user_id": "user_joshua", "name": "Joshua Awojide", "email": "joshua@tenmediahq.com", "role": "member", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["Livestream"], "availability": "available", "picture": None},
    {"user_id": "user_boluwatife", "name": "Boluwatife Akinola", "email": "boluwatife@tenmediahq.com", "role": "member", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["Graphics"], "availability": "available", "picture": None},
    {"user_id": "user_damilola", "name": "Damilola Oyeleke", "email": "damilola@tenmediahq.com", "role": "member", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["ProPresenter"], "availability": "available", "picture": None},
    {"user_id": "user_emmanuel", "name": "Emmanuel Adeyemi", "email": "emmanuel@tenmediahq.com", "role": "member", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["Camera"], "availability": "available", "picture": None},
    {"user_id": "user_david", "name": "David Oluwaseun", "email": "david@tenmediahq.com", "role": "member", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["Sound"], "availability": "available", "picture": None},
    {"user_id": "user_samuel", "name": "Samuel Okonkwo", "email": "samuel@tenmediahq.com", "role": "member", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["Lighting"], "availability": "available", "picture": None},
    {"user_id": "user_peter", "name": "Peter Adeleke", "email": "peter@tenmediahq.com", "role": "member", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["Camera"], "availability": "available", "picture": None},
    {"user_id": "user_john", "name": "John Okafor", "email": "john@tenmediahq.com", "role": "member", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["Sound"], "availability": "available", "picture": None},
    {"user_id": "user_michael", "name": "Michael Eze", "email": "michael@tenmediahq.com", "role": "member", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["Livestream"], "availability": "available", "picture": None},
    {"user_id": "user_andrew", "name": "Andrew Nnamdi", "email": "andrew@tenmediahq.com", "role": "member", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["Graphics"], "availability": "available", "picture": None},
    {"user_id": "user_philip", "name": "Philip Chukwu", "email": "philip@tenmediahq.com", "role": "member", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["Camera"], "availability": "available", "picture": None},
    {"user_id": "user_stephen", "name": "Stephen Obiora", "email": "stephen@tenmediahq.com", "role": "member", "teams": ["envoy_nation"], "primary_team": "envoy_nation", "skills": ["Sound"], "availability": "available", "picture": None},
    {"user_id": "user_daniel", "name": "Daniel Amaechi", "email": "daniel@tenmediahq.com", "role": "member", "teams": ["e_nation"], "primary_team": "e_nation", "skills": ["Camera"], "availability": "available", "picture": None},
    {"user_id": "user_matthew", "name": "Matthew Ikenna", "email": "matthew@tenmediahq.com", "role": "member", "teams": ["e_nation"], "primary_team": "e_nation", "skills": ["Sound"], "availability": "available", "picture": None},
    {"user_id": "user_mark", "name": "Mark Chibueze", "email": "mark@tenmediahq.com", "role": "member", "teams": ["e_nation"], "primary_team": "e_nation", "skills": ["Livestream"], "availability": "available", "picture": None},
]

# Predefined services
SERVICES = [
    {"service_id": "svc_sunday_main", "title": "Sunday Morning Service", "date": "2026-02-08", "time": "11:00", "type": "sunday_service", "team": "envoy_nation", "team_id": "envoy_nation", "description": "Main Sunday worship service"},
    {"service_id": "svc_sunday_tce", "title": "The Commissioned Envoy Service", "date": "2026-02-08", "time": "14:00", "type": "sunday_service", "team": "e_nation", "team_id": "e_nation", "description": "TCE afternoon service"},
    {"service_id": "svc_midweek", "title": "Midweek Leicester Blessings", "date": "2026-02-11", "time": "18:30", "type": "midweek", "team": "envoy_nation", "team_id": "envoy_nation", "description": "Wednesday midweek service"},
    {"service_id": "svc_tuesday", "title": "Tuesday Standup Meeting", "date": "2026-02-10", "time": "20:00", "type": "standup", "team": "envoy_nation", "team_id": "envoy_nation", "description": "Weekly team standup"},
    {"service_id": "svc_rehearsal", "title": "Technical Rehearsal", "date": "2026-02-07", "time": "17:00", "type": "rehearsal", "team": "envoy_nation", "team_id": "envoy_nation", "description": "Equipment and tech rehearsal"},
]

# Predefined equipment
EQUIPMENT = [
    {"equipment_id": "equip_001", "name": "Sony PTZ Camera 1", "category": "camera", "status": "available", "team": "envoy_nation", "notes": "Main pulpit camera"},
    {"equipment_id": "equip_002", "name": "Sony PTZ Camera 2", "category": "camera", "status": "available", "team": "envoy_nation", "notes": "Wide angle camera"},
    {"equipment_id": "equip_003", "name": "Blackmagic ATEM Mini Pro", "category": "video_switcher", "status": "available", "team": "envoy_nation", "notes": "Main video switcher"},
    {"equipment_id": "equip_004", "name": "Shure SM58 Microphone", "category": "audio", "status": "checked_out", "team": "envoy_nation", "notes": "Handheld mic", "checked_out_by": "user_gabriel"},
    {"equipment_id": "equip_005", "name": "Behringer X32 Mixer", "category": "audio", "status": "available", "team": "envoy_nation", "notes": "Main audio mixer"},
    {"equipment_id": "equip_006", "name": "MacBook Pro M2", "category": "computer", "status": "checked_out", "team": "envoy_nation", "notes": "Livestream computer", "checked_out_by": "user_joshua"},
]

# Dashboard KPIs
def get_dashboard_kpis():
    return {
        "total_members": len(TEAM_MEMBERS),
        "total_services": len(SERVICES),
        "total_equipment": len(EQUIPMENT),
        "available_equipment": len([e for e in EQUIPMENT if e["status"] == "available"]),
        "upcoming_services": SERVICES[:3],
        "pending_rotas": 2
    }

# Teams
TEAMS = [
    {"team_id": "envoy_nation", "name": "Envoy Nation", "description": "Main church media team", "member_count": 20},
    {"team_id": "e_nation", "name": "E-Nation (TCE)", "description": "The Commissioned Envoy team", "member_count": 3}
]

def get_user_by_email(email):
    """Get user by email from fallback data"""
    for member in TEAM_MEMBERS:
        if member["email"].lower() == email.lower():
            return member
    return None

def get_user_by_id(user_id):
    """Get user by ID from fallback data"""
    for member in TEAM_MEMBERS:
        if member["user_id"] == user_id:
            return member
    return None
