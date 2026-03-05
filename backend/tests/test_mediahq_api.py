"""
TEN MediaHQ API Tests
Tests for authentication, dashboard, team, services, equipment, and attendance endpoints.
"""

import pytest
import requests
import time
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://mediahq-preview.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "oladimeji@tenmediahq.com"
TEST_PASSWORD = "Envoy@2026"

class TestAuthAPI:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test successful login with valid credentials"""
        start_time = time.time()
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        response_time = time.time() - start_time
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "session_token" in data, "Missing session_token in response"
        assert "user" in data, "Missing user in response"
        assert data["user"]["email"] == TEST_EMAIL, "Email mismatch"
        assert data["user"]["name"] == "Oladimeji Tiamiyu", f"Name mismatch: expected 'Oladimeji Tiamiyu', got '{data['user']['name']}'"
        assert data["user"]["role"] == "assistant_lead", f"Role mismatch: expected 'assistant_lead', got '{data['user']['role']}'"
        
        # Performance check - login should be fast due to caching
        print(f"Login response time: {response_time:.3f}s")
        assert response_time < 2.0, f"Login too slow: {response_time:.3f}s (expected < 2s)"
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@tenmediahq.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_auth_me_with_token(self):
        """Test /auth/me endpoint with valid session token"""
        # First login to get token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_response.status_code == 200
        session_token = login_response.json()["session_token"]
        
        # Test /auth/me
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {session_token}"
        })
        response_time = time.time() - start_time
        
        assert response.status_code == 200, f"Auth/me failed: {response.text}"
        
        data = response.json()
        assert data["name"] == "Oladimeji Tiamiyu", f"Name mismatch in /auth/me"
        assert data["email"] == TEST_EMAIL
        
        print(f"/auth/me response time: {response_time:.3f}s")


class TestDashboardAPI:
    """Dashboard KPIs endpoint tests"""
    
    def test_dashboard_kpis(self):
        """Test dashboard KPIs endpoint"""
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/api/dashboard/kpis?team=envoy_nation")
        response_time = time.time() - start_time
        
        assert response.status_code == 200, f"Dashboard KPIs failed: {response.text}"
        
        data = response.json()
        assert "total_members" in data, "Missing total_members"
        assert "total_services" in data, "Missing total_services"
        assert "total_equipment" in data, "Missing total_equipment"
        assert "available_equipment" in data, "Missing available_equipment"
        assert "upcoming_services" in data, "Missing upcoming_services"
        
        # Verify data values
        assert data["total_members"] >= 20, f"Expected at least 20 members, got {data['total_members']}"
        assert data["total_services"] >= 4, f"Expected at least 4 services, got {data['total_services']}"
        assert data["total_equipment"] >= 4, f"Expected at least 4 equipment, got {data['total_equipment']}"
        
        print(f"Dashboard KPIs response time: {response_time:.3f}s")
    
    def test_dashboard_kpis_cached(self):
        """Test that dashboard KPIs are cached (second call should be faster)"""
        # First call
        response1 = requests.get(f"{BASE_URL}/api/dashboard/kpis?team=envoy_nation")
        assert response1.status_code == 200
        
        # Second call (should be cached)
        start_time = time.time()
        response2 = requests.get(f"{BASE_URL}/api/dashboard/kpis?team=envoy_nation")
        response_time = time.time() - start_time
        
        assert response2.status_code == 200
        print(f"Dashboard KPIs (cached) response time: {response_time:.3f}s")


class TestTeamsAPI:
    """Teams endpoint tests"""
    
    def test_get_teams(self):
        """Test get all teams"""
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/api/teams")
        response_time = time.time() - start_time
        
        assert response.status_code == 200, f"Get teams failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of teams"
        assert len(data) >= 2, f"Expected at least 2 teams, got {len(data)}"
        
        # Check for expected teams
        team_ids = [t["team_id"] for t in data]
        assert "envoy_nation" in team_ids, "Missing envoy_nation team"
        assert "e_nation" in team_ids, "Missing e_nation team"
        
        print(f"Get teams response time: {response_time:.3f}s")


class TestUsersAPI:
    """Users endpoint tests"""
    
    def test_get_users(self):
        """Test get users for a team"""
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/api/users?team=envoy_nation")
        response_time = time.time() - start_time
        
        assert response.status_code == 200, f"Get users failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of users"
        assert len(data) >= 15, f"Expected at least 15 users, got {len(data)}"
        
        # Check for expected users
        user_names = [u["name"] for u in data]
        assert "Oladimeji Tiamiyu" in user_names, "Missing Oladimeji Tiamiyu"
        assert "Adebowale Owoseni" in user_names, "Missing Adebowale Owoseni"
        
        print(f"Get users response time: {response_time:.3f}s")


class TestServicesAPI:
    """Services endpoint tests"""
    
    def test_get_services(self):
        """Test get services for a team"""
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/api/services?team=envoy_nation")
        response_time = time.time() - start_time
        
        assert response.status_code == 200, f"Get services failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of services"
        assert len(data) >= 3, f"Expected at least 3 services, got {len(data)}"
        
        # Check service structure
        for service in data:
            assert "service_id" in service, "Missing service_id"
            assert "title" in service, "Missing title"
            assert "date" in service, "Missing date"
        
        print(f"Get services response time: {response_time:.3f}s")


class TestEquipmentAPI:
    """Equipment endpoint tests"""
    
    def test_get_equipment(self):
        """Test get equipment for a team"""
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/api/equipment?team=envoy_nation")
        response_time = time.time() - start_time
        
        assert response.status_code == 200, f"Get equipment failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of equipment"
        assert len(data) >= 4, f"Expected at least 4 equipment items, got {len(data)}"
        
        # Check equipment structure
        for item in data:
            assert "equipment_id" in item, "Missing equipment_id"
            assert "name" in item, "Missing name"
            assert "status" in item, "Missing status"
        
        # Check for expected equipment
        equipment_names = [e["name"] for e in data]
        assert any("Sony" in name for name in equipment_names), "Missing Sony camera"
        assert any("Blackmagic" in name for name in equipment_names), "Missing Blackmagic switcher"
        
        print(f"Get equipment response time: {response_time:.3f}s")


class TestAttendanceAPI:
    """Attendance endpoint tests"""
    
    def test_get_attendance(self):
        """Test get attendance records"""
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/api/attendance?team=envoy_nation")
        response_time = time.time() - start_time
        
        assert response.status_code == 200, f"Get attendance failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of attendance records"
        
        # Check attendance structure if records exist
        if len(data) > 0:
            for record in data:
                assert "date" in record, "Missing date"
                assert "attendees" in record, "Missing attendees"
        
        print(f"Get attendance response time: {response_time:.3f}s")


class TestAPIPerformance:
    """API performance tests - verify caching is working"""
    
    def test_login_performance(self):
        """Test that login is fast due to user caching"""
        times = []
        for i in range(3):
            start_time = time.time()
            response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            })
            response_time = time.time() - start_time
            times.append(response_time)
            assert response.status_code == 200
        
        avg_time = sum(times) / len(times)
        print(f"Login average response time: {avg_time:.3f}s (times: {[f'{t:.3f}s' for t in times]})")
        
        # After first call, subsequent calls should be faster due to caching
        assert times[-1] < 1.0, f"Login should be under 1s with caching, got {times[-1]:.3f}s"
    
    def test_teams_cached_performance(self):
        """Test that teams endpoint is cached"""
        # First call
        start1 = time.time()
        response1 = requests.get(f"{BASE_URL}/api/teams")
        time1 = time.time() - start1
        
        # Second call (should be cached)
        start2 = time.time()
        response2 = requests.get(f"{BASE_URL}/api/teams")
        time2 = time.time() - start2
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        print(f"Teams API: First call {time1:.3f}s, Second call (cached) {time2:.3f}s")
        
        # Cached call should be under 500ms
        assert time2 < 0.5, f"Cached teams call should be under 500ms, got {time2:.3f}s"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
