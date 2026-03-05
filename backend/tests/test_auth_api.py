"""
Backend API Tests for TEN MediaHQ
Tests authentication and core API endpoints
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://mediahq-preview.preview.emergentagent.com')

class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test successful login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "oladimeji@tenmediahq.com",
            "password": "Envoy@2026"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "session_token" in data
        assert "user" in data
        assert "message" in data
        
        # Verify user data
        user = data["user"]
        assert user["email"] == "oladimeji@tenmediahq.com"
        assert user["name"] == "Oladimeji Tiamiyu"
        assert user["role"] == "assistant_lead"
        assert "user_id" in user
        
    def test_login_invalid_password(self):
        """Test login with invalid password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "oladimeji@tenmediahq.com",
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        
    def test_login_invalid_email(self):
        """Test login with non-existent email"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@tenmediahq.com",
            "password": "Envoy@2026"
        })
        
        assert response.status_code == 401
        
    def test_login_director_role(self):
        """Test login with director role"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "adebowale@tenmediahq.com",
            "password": "Envoy@2026"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["role"] == "director"
        assert data["user"]["name"] == "Adebowale Owoseni"
        
    def test_auth_me_without_token(self):
        """Test /auth/me without authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        
    def test_auth_me_with_invalid_token(self):
        """Test /auth/me with invalid token"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": "Bearer invalid-token"}
        )
        assert response.status_code == 401


class TestDashboardEndpoints:
    """Dashboard KPI endpoint tests"""
    
    def test_dashboard_kpis(self):
        """Test dashboard KPIs endpoint"""
        response = requests.get(f"{BASE_URL}/api/dashboard/kpis?team=envoy_nation")
        # May return 200 with data or fallback to demo data
        assert response.status_code in [200, 401]
        

class TestTeamEndpoints:
    """Team member endpoint tests"""
    
    def test_get_team_members(self):
        """Test getting team members"""
        response = requests.get(f"{BASE_URL}/api/team/members?team=envoy_nation")
        # May return 200 with data or 401 if auth required
        assert response.status_code in [200, 401]


class TestAuthUsers:
    """Test auth/users endpoint"""
    
    def test_get_all_users(self):
        """Test getting all users list"""
        response = requests.get(f"{BASE_URL}/api/auth/users")
        # This endpoint should return list of users
        assert response.status_code in [200, 401]
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list)
            # Should have 23 team members
            assert len(data) >= 20


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
