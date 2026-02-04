#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class TENMediaHQAPITester:
    def __init__(self, base_url: str = "https://churchmedia-central.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = "test_session_1770233896140"  # From MongoDB setup
        self.user_id = "test-user-1770233896140"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.created_resources = {}  # Track created resources for cleanup

    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            print(f"❌ {test_name} - FAILED: {details}")

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, expected_status: int = 200) -> tuple[bool, Dict]:
        """Make authenticated API request"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.session_token}'
        }
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}
            
            if not success:
                print(f"   Status: {response.status_code}, Expected: {expected_status}")
                if response.text:
                    print(f"   Response: {response.text[:200]}...")
            
            return success, response_data

        except Exception as e:
            return False, {"error": str(e)}

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication Endpoints...")
        
        # Test /api/auth/me
        success, data = self.make_request('GET', 'auth/me')
        if success and data.get('user_id') == self.user_id:
            self.log_result("GET /api/auth/me", True)
        else:
            self.log_result("GET /api/auth/me", False, f"Expected user_id {self.user_id}, got {data}")

        # Test /api/auth/logout
        success, data = self.make_request('POST', 'auth/logout')
        self.log_result("POST /api/auth/logout", success, str(data) if not success else "")

    def test_dashboard_endpoints(self):
        """Test dashboard KPI endpoints"""
        print("\n📊 Testing Dashboard Endpoints...")
        
        success, data = self.make_request('GET', 'dashboard/kpis')
        if success:
            required_fields = ['total_members', 'total_services', 'total_equipment', 'available_equipment', 'upcoming_services', 'pending_rotas']
            missing_fields = [field for field in required_fields if field not in data]
            if not missing_fields:
                self.log_result("GET /api/dashboard/kpis", True)
            else:
                self.log_result("GET /api/dashboard/kpis", False, f"Missing fields: {missing_fields}")
        else:
            self.log_result("GET /api/dashboard/kpis", False, str(data))

    def test_team_endpoints(self):
        """Test team management endpoints"""
        print("\n👥 Testing Team Endpoints...")
        
        # Get all team members
        success, data = self.make_request('GET', 'team/members')
        if success and isinstance(data, list):
            self.log_result("GET /api/team/members", True)
            if data:
                # Test get specific member
                member_id = data[0].get('user_id')
                if member_id:
                    success, member_data = self.make_request('GET', f'team/members/{member_id}')
                    self.log_result(f"GET /api/team/members/{member_id}", success, str(member_data) if not success else "")
        else:
            self.log_result("GET /api/team/members", False, str(data))

        # Test get all skills
        success, data = self.make_request('GET', 'team/skills')
        if success and 'skills' in data:
            self.log_result("GET /api/team/skills", True)
        else:
            self.log_result("GET /api/team/skills", False, str(data))

        # Test update team member (admin permission required)
        if hasattr(self, 'test_member_id'):
            update_data = {"availability": "busy"}
            success, data = self.make_request('PUT', f'team/members/{self.test_member_id}', update_data)
            self.log_result(f"PUT /api/team/members/{self.test_member_id}", success, str(data) if not success else "")

    def test_service_endpoints(self):
        """Test service management endpoints"""
        print("\n⛪ Testing Service Endpoints...")
        
        # Create a service
        service_data = {
            "title": "Sunday Morning Service",
            "date": "2025-01-15",
            "time": "10:00",
            "type": "worship",
            "description": "Weekly Sunday service"
        }
        success, data = self.make_request('POST', 'services', service_data, 200)
        if success and data.get('service_id'):
            service_id = data['service_id']
            self.created_resources['service_id'] = service_id
            self.log_result("POST /api/services", True)
            
            # Get the created service
            success, data = self.make_request('GET', f'services/{service_id}')
            self.log_result(f"GET /api/services/{service_id}", success, str(data) if not success else "")
        else:
            self.log_result("POST /api/services", False, str(data))

        # Get all services
        success, data = self.make_request('GET', 'services')
        if success and isinstance(data, list):
            self.log_result("GET /api/services", True)
        else:
            self.log_result("GET /api/services", False, str(data))

    def test_rota_endpoints(self):
        """Test rota management endpoints"""
        print("\n📋 Testing Rota Endpoints...")
        
        # Create a rota (requires service_id)
        if 'service_id' in self.created_resources:
            rota_data = {
                "service_id": self.created_resources['service_id'],
                "assignments": [
                    {"user_id": self.user_id, "role": "sound_engineer"},
                    {"user_id": self.user_id, "role": "camera_operator"}
                ],
                "notes": "Test rota for Sunday service"
            }
            success, data = self.make_request('POST', 'rotas', rota_data, 200)
            if success and data.get('rota_id'):
                rota_id = data['rota_id']
                self.created_resources['rota_id'] = rota_id
                self.log_result("POST /api/rotas", True)
                
                # Test rota confirmation
                if data.get('assignments'):
                    assignment_id = data['assignments'][0]['assignment_id']
                    confirm_data = {"status": "confirmed"}
                    success, confirm_response = self.make_request('PUT', f'rotas/{rota_id}/assignments/{assignment_id}/confirm', confirm_data)
                    self.log_result(f"PUT /api/rotas/{rota_id}/assignments/{assignment_id}/confirm", success, str(confirm_response) if not success else "")
            else:
                self.log_result("POST /api/rotas", False, str(data))
        else:
            self.log_result("POST /api/rotas", False, "No service_id available")

        # Get all rotas
        success, data = self.make_request('GET', 'rotas')
        if success and isinstance(data, list):
            self.log_result("GET /api/rotas", True)
        else:
            self.log_result("GET /api/rotas", False, str(data))

        # Get my rotas
        success, data = self.make_request('GET', 'rotas/my-rotas')
        if success and isinstance(data, list):
            self.log_result("GET /api/rotas/my-rotas", True)
        else:
            self.log_result("GET /api/rotas/my-rotas", False, str(data))

    def test_equipment_endpoints(self):
        """Test equipment management endpoints"""
        print("\n🎥 Testing Equipment Endpoints...")
        
        # Create equipment
        equipment_data = {
            "name": "Sony FX6 Camera",
            "category": "camera",
            "notes": "Main worship camera"
        }
        success, data = self.make_request('POST', 'equipment', equipment_data, 200)
        if success and data.get('equipment_id'):
            equipment_id = data['equipment_id']
            self.created_resources['equipment_id'] = equipment_id
            self.log_result("POST /api/equipment", True)
            
            # Test checkout
            success, checkout_data = self.make_request('PUT', f'equipment/{equipment_id}/checkout')
            self.log_result(f"PUT /api/equipment/{equipment_id}/checkout", success, str(checkout_data) if not success else "")
            
            # Test checkin
            success, checkin_data = self.make_request('PUT', f'equipment/{equipment_id}/checkin')
            self.log_result(f"PUT /api/equipment/{equipment_id}/checkin", success, str(checkin_data) if not success else "")
        else:
            self.log_result("POST /api/equipment", False, str(data))

        # Get all equipment
        success, data = self.make_request('GET', 'equipment')
        if success and isinstance(data, list):
            self.log_result("GET /api/equipment", True)
        else:
            self.log_result("GET /api/equipment", False, str(data))

    def test_checklist_endpoints(self):
        """Test checklist endpoints"""
        print("\n✅ Testing Checklist Endpoints...")
        
        if 'service_id' in self.created_resources:
            checklist_data = {
                "service_id": self.created_resources['service_id'],
                "title": "Pre-Service Setup",
                "items": [
                    {"text": "Test microphones"},
                    {"text": "Check camera angles"},
                    {"text": "Verify livestream connection"}
                ]
            }
            success, data = self.make_request('POST', 'checklists', checklist_data, 200)
            if success and data.get('checklist_id'):
                checklist_id = data['checklist_id']
                self.created_resources['checklist_id'] = checklist_id
                self.log_result("POST /api/checklists", True)
                
                # Test toggle checklist item
                if data.get('items'):
                    item_id = data['items'][0]['item_id']
                    success, toggle_data = self.make_request('PUT', f'checklists/{checklist_id}/items/{item_id}/toggle')
                    self.log_result(f"PUT /api/checklists/{checklist_id}/items/{item_id}/toggle", success, str(toggle_data) if not success else "")
            else:
                self.log_result("POST /api/checklists", False, str(data))
        else:
            self.log_result("POST /api/checklists", False, "No service_id available")

        # Get all checklists
        success, data = self.make_request('GET', 'checklists')
        if success and isinstance(data, list):
            self.log_result("GET /api/checklists", True)
        else:
            self.log_result("GET /api/checklists", False, str(data))

    def test_training_endpoints(self):
        """Test training video endpoints"""
        print("\n🎓 Testing Training Endpoints...")
        
        # Create training video
        video_data = {
            "title": "Camera Operation Basics",
            "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "category": "camera",
            "duration": "15:30",
            "description": "Learn basic camera operations for worship services"
        }
        success, data = self.make_request('POST', 'training/videos', video_data, 200)
        if success and data.get('video_id'):
            video_id = data['video_id']
            self.created_resources['video_id'] = video_id
            self.log_result("POST /api/training/videos", True)
            
            # Test complete video
            success, complete_data = self.make_request('POST', f'training/videos/{video_id}/complete')
            self.log_result(f"POST /api/training/videos/{video_id}/complete", success, str(complete_data) if not success else "")
        else:
            self.log_result("POST /api/training/videos", False, str(data))

        # Get all training videos
        success, data = self.make_request('GET', 'training/videos')
        if success and isinstance(data, list):
            self.log_result("GET /api/training/videos", True)
        else:
            self.log_result("GET /api/training/videos", False, str(data))

        # Get training progress
        success, data = self.make_request('GET', 'training/progress')
        if success and isinstance(data, list):
            self.log_result("GET /api/training/progress", True)
        else:
            self.log_result("GET /api/training/progress", False, str(data))

    def test_lead_rotation_endpoints(self):
        """Test lead rotation endpoints"""
        print("\n🔄 Testing Lead Rotation Endpoints...")
        
        # Create lead rotation
        rotation_data = {
            "week_number": 3,
            "year": 2025,
            "lead_user_id": self.user_id,
            "backup_user_id": None,
            "notes": "Test rotation for week 3"
        }
        success, data = self.make_request('POST', 'lead-rotation', rotation_data, 200)
        if success and data.get('rotation_id'):
            rotation_id = data['rotation_id']
            self.created_resources['rotation_id'] = rotation_id
            self.log_result("POST /api/lead-rotation", True)
            
            # Test update rotation
            update_data = {
                "week_number": 3,
                "year": 2025,
                "lead_user_id": self.user_id,
                "backup_user_id": self.user_id,
                "notes": "Updated test rotation"
            }
            success, update_response = self.make_request('PUT', f'lead-rotation/{rotation_id}', update_data)
            self.log_result(f"PUT /api/lead-rotation/{rotation_id}", success, str(update_response) if not success else "")
        else:
            self.log_result("POST /api/lead-rotation", False, str(data))

        # Get lead rotations
        success, data = self.make_request('GET', 'lead-rotation?year=2025')
        if success and isinstance(data, list):
            self.log_result("GET /api/lead-rotation", True)
        else:
            self.log_result("GET /api/lead-rotation", False, str(data))

    def test_performance_endpoints(self):
        """Test performance metrics endpoints"""
        print("\n📈 Testing Performance Endpoints...")
        
        success, data = self.make_request('GET', 'performance/metrics')
        if success and isinstance(data, list):
            self.log_result("GET /api/performance/metrics", True)
            # Check if metrics have required fields
            if data:
                required_fields = ['user_id', 'name', 'role', 'total_assignments', 'confirmed', 'declined', 'pending', 'attendance_rate']
                first_metric = data[0]
                missing_fields = [field for field in required_fields if field not in first_metric]
                if missing_fields:
                    self.log_result("Performance metrics structure", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_result("Performance metrics structure", True)
        else:
            self.log_result("GET /api/performance/metrics", False, str(data))

    def test_data_import_export(self):
        """Test data import/export endpoints"""
        print("\n📤 Testing Data Import/Export Endpoints...")
        
        # Test export (admin only)
        success, data = self.make_request('GET', 'data/export?collection=users')
        self.log_result("GET /api/data/export?collection=users", success, str(data) if not success else "")

        # Test import (admin only)
        import_data = {
            "collection": "users",
            "data": []
        }
        success, data = self.make_request('POST', 'data/import', import_data)
        self.log_result("POST /api/data/import", success, str(data) if not success else "")

    def cleanup_resources(self):
        """Clean up created test resources"""
        print("\n🧹 Cleaning up test resources...")
        
        # Delete in reverse order of dependencies
        if 'equipment_id' in self.created_resources:
            success, _ = self.make_request('DELETE', f'equipment/{self.created_resources["equipment_id"]}')
            self.log_result(f"DELETE equipment {self.created_resources['equipment_id']}", success)

        if 'service_id' in self.created_resources:
            success, _ = self.make_request('DELETE', f'services/{self.created_resources["service_id"]}')
            self.log_result(f"DELETE service {self.created_resources['service_id']}", success)

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting TEN MediaHQ Backend API Tests")
        print(f"Base URL: {self.base_url}")
        print(f"Session Token: {self.session_token[:20]}...")
        print(f"User ID: {self.user_id}")
        
        try:
            self.test_auth_endpoints()
            self.test_dashboard_endpoints()
            self.test_team_endpoints()
            self.test_service_endpoints()
            self.test_rota_endpoints()
            self.test_equipment_endpoints()
            self.test_checklist_endpoints()
            self.test_training_endpoints()
            self.test_lead_rotation_endpoints()
            self.test_performance_endpoints()
            self.test_data_import_export()
            
        except KeyboardInterrupt:
            print("\n⚠️ Tests interrupted by user")
        except Exception as e:
            print(f"\n💥 Unexpected error: {str(e)}")
        finally:
            self.cleanup_resources()
            self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print(f"\n📊 Test Summary")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for failure in self.failed_tests:
                print(f"  - {failure['test']}: {failure['details']}")
        
        return len(self.failed_tests) == 0

def main():
    """Main test runner"""
    tester = TENMediaHQAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())