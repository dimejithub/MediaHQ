#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta

class RotaCreationTester:
    def __init__(self, base_url: str = "https://techministry.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = "test_session_1770233896140"
        self.user_id = "test-user-1770233896140"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            print(f"❌ {test_name} - FAILED: {details}")

    def make_request(self, method: str, endpoint: str, data=None, expected_status: int = 200):
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
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}
            
            if not success:
                print(f"   Status: {response.status_code}, Expected: {expected_status}")
                print(f"   Response: {response.text[:500]}...")
            
            return success, response_data

        except Exception as e:
            return False, {"error": str(e)}

    def test_rota_creation_with_weekly_lead(self):
        """Test the specific rota creation flow with weekly lead"""
        print("\n🎯 Testing Rota Creation with Weekly Lead Flow...")
        
        # Step 1: Create a service first
        service_data = {
            "title": "Sunday Morning Worship",
            "date": "2025-01-19",
            "time": "10:00",
            "type": "worship",
            "description": "Weekly Sunday service with full media team"
        }
        
        success, service_response = self.make_request('POST', 'services', service_data)
        if not success:
            self.log_result("Create Service for Rota", False, f"Failed to create service: {service_response}")
            return
        
        service_id = service_response.get('service_id')
        self.log_result("Create Service for Rota", True)
        print(f"   Created service: {service_id}")
        
        # Step 2: Get team members to find admin/team_lead for weekly lead
        success, members_response = self.make_request('GET', 'team/members')
        if not success:
            self.log_result("Get Team Members", False, f"Failed to get members: {members_response}")
            return
        
        # Find admin or team_lead users
        admin_users = [m for m in members_response if m.get('role') in ['admin', 'team_lead']]
        regular_members = [m for m in members_response if m.get('role') == 'member']
        
        if not admin_users:
            self.log_result("Find Weekly Lead Candidates", False, "No admin or team_lead users found")
            return
        
        weekly_lead = admin_users[0]
        self.log_result("Find Weekly Lead Candidates", True)
        print(f"   Weekly Lead: {weekly_lead['name']} ({weekly_lead['role']})")
        
        # Step 3: Create rota with weekly lead in notes and team assignments
        assignments = []
        
        # Add some regular members as team assignments
        roles = ['Camera Operator', 'Sound Engineer', 'Lighting Tech', 'ProPresenter Operator']
        for i, member in enumerate(regular_members[:4]):
            if i < len(roles):
                assignments.append({
                    "user_id": member['user_id'],
                    "role": roles[i]
                })
        
        # Create the rota with weekly lead noted
        rota_data = {
            "service_id": service_id,
            "assignments": assignments,
            "notes": f"Weekly Lead: {weekly_lead['name']} (responsible for 29 checklist items)"
        }
        
        print(f"   Creating rota with {len(assignments)} assignments...")
        success, rota_response = self.make_request('POST', 'rotas', rota_data)
        if not success:
            self.log_result("Create Rota with Weekly Lead", False, f"Failed to create rota: {rota_response}")
            return
        
        rota_id = rota_response.get('rota_id')
        self.log_result("Create Rota with Weekly Lead", True)
        print(f"   Created rota: {rota_id}")
        print(f"   Notes: {rota_response.get('notes', 'No notes')}")
        
        # Step 4: Verify rota was created correctly
        success, get_rota_response = self.make_request('GET', f'rotas')
        if success:
            created_rota = next((r for r in get_rota_response if r.get('rota_id') == rota_id), None)
            if created_rota:
                self.log_result("Verify Rota Creation", True)
                print(f"   Assignments count: {len(created_rota.get('assignments', []))}")
                print(f"   Service ID matches: {created_rota.get('service_id') == service_id}")
            else:
                self.log_result("Verify Rota Creation", False, "Created rota not found in list")
        else:
            self.log_result("Verify Rota Creation", False, f"Failed to get rotas: {get_rota_response}")
        
        # Step 5: Test my-rotas endpoint for assigned members
        for assignment in assignments:
            # This would need the actual user's session token, but we can test the endpoint structure
            pass
        
        # Step 6: Create the 29 checklist items for the service
        checklist_items = [
            # Pre-Service Setup (Items 1-10)
            {"text": "Ensure all team members are present"},
            {"text": "Check the rota to ensure all unit members officiating are present"},
            {"text": "Assign specific roles and responsibilities"},
            {"text": "Turn on all sockets, media appliances, screens including LED screen"},
            {"text": "Inspect that all equipments are properly connected"},
            {"text": "Verify cameras, switchers, and monitors"},
            {"text": "Confirm HDMI cables are working"},
            {"text": "Check battery levels and replace if needed"},
            {"text": "Ensure proper camera angles and framing"},
            {"text": "Confirm pulpit camera is properly placed"},
            
            # Technical Run-Through (Items 11-17)
            {"text": "Check communication headsets for clear audio"},
            {"text": "Ensure livestream feed audio is clear"},
            {"text": "Set up laptop/system for projection and livestream"},
            {"text": "Download images/videos/lyrics from WhatsApp or Drive"},
            {"text": "Verify slides, lyrics, and video cues"},
            {"text": "Run short cue test for smooth transitions"},
            {"text": "Start streaming 5 mins before service start time"},
            {"text": "Confirm overlays/lower-thirds are working"},
            
            # Live Production Monitoring (Items 18-23)
            {"text": "Ensure smooth camera switching and transitions"},
            {"text": "Monitor video quality and adjust as needed"},
            {"text": "Stay in sync with presentation and sound teams"},
            {"text": "Be ready to troubleshoot issues quickly"},
            {"text": "Document conflicts/challenges faced during service"},
            
            # Post-Service & Debrief (Items 24-29)
            {"text": "Turn off all equipment and secure cables"},
            {"text": "Store equipment in designated locations"},
            {"text": "Discuss what went well and issues faced"},
            {"text": "Note any equipment needing maintenance"},
            {"text": "Plan improvements for the next service"},
            {"text": "Complete service report and submit feedback"}
        ]
        
        checklist_data = {
            "service_id": service_id,
            "title": "Media Team Service Checklist (29 Items)",
            "items": checklist_items
        }
        
        success, checklist_response = self.make_request('POST', 'checklists', checklist_data)
        if success:
            checklist_id = checklist_response.get('checklist_id')
            items_count = len(checklist_response.get('items', []))
            self.log_result("Create 29 Checklist Items", True)
            print(f"   Created checklist: {checklist_id}")
            print(f"   Items created: {items_count}/29")
            
            # Test toggling a few checklist items
            if checklist_response.get('items'):
                item_id = checklist_response['items'][0]['item_id']
                success, toggle_response = self.make_request('PUT', f'checklists/{checklist_id}/items/{item_id}/toggle')
                self.log_result("Toggle Checklist Item", success, str(toggle_response) if not success else "")
        else:
            self.log_result("Create 29 Checklist Items", False, f"Failed to create checklist: {checklist_response}")
        
        # Step 7: Test getting checklists for the service
        success, service_checklists = self.make_request('GET', f'checklists?service_id={service_id}')
        if success:
            matching_checklists = [c for c in service_checklists if c.get('service_id') == service_id]
            self.log_result("Get Service Checklists", len(matching_checklists) > 0, f"Found {len(matching_checklists)} checklists")
        else:
            self.log_result("Get Service Checklists", False, f"Failed to get checklists: {service_checklists}")
        
        return service_id, rota_id

    def test_assignment_confirmation_flow(self, rota_id):
        """Test the assignment confirmation flow"""
        print(f"\n✅ Testing Assignment Confirmation Flow for {rota_id}...")
        
        # Get the rota details
        success, rotas_response = self.make_request('GET', 'rotas')
        if not success:
            self.log_result("Get Rotas for Confirmation", False, f"Failed to get rotas: {rotas_response}")
            return
        
        target_rota = next((r for r in rotas_response if r.get('rota_id') == rota_id), None)
        if not target_rota:
            self.log_result("Find Target Rota", False, f"Rota {rota_id} not found")
            return
        
        self.log_result("Find Target Rota", True)
        
        # Test confirming assignments
        assignments = target_rota.get('assignments', [])
        for assignment in assignments[:2]:  # Test first 2 assignments
            assignment_id = assignment.get('assignment_id')
            confirm_data = {"status": "confirmed"}
            
            success, confirm_response = self.make_request('PUT', f'rotas/{rota_id}/assignments/{assignment_id}/confirm', confirm_data)
            self.log_result(f"Confirm Assignment {assignment_id}", success, str(confirm_response) if not success else "")

    def run_tests(self):
        """Run all rota-specific tests"""
        print("🎯 Starting Rota Creation Specific Tests")
        print(f"Base URL: {self.base_url}")
        print(f"Testing user: {self.user_id}")
        
        try:
            service_id, rota_id = self.test_rota_creation_with_weekly_lead()
            if rota_id:
                self.test_assignment_confirmation_flow(rota_id)
            
        except Exception as e:
            print(f"\n💥 Unexpected error: {str(e)}")
        finally:
            self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print(f"\n📊 Rota Creation Test Summary")
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
    tester = RotaCreationTester()
    success = tester.run_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())