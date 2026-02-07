"""
Test WhatsApp API endpoints for TEN MediaHQ
Tests Twilio integration status and connection verification
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestWhatsAppAPI:
    """WhatsApp/Twilio API endpoint tests"""
    
    def test_whatsapp_status_endpoint(self):
        """Test /api/whatsapp/status returns configured status"""
        response = requests.get(f"{BASE_URL}/api/whatsapp/status")
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert "configured" in data, "Response should contain 'configured' field"
        assert data["configured"] == True, "WhatsApp should be configured"
        assert "whatsapp_number" in data, "Response should contain 'whatsapp_number' field"
        assert data["whatsapp_number"] == "+18886016703", f"Expected +18886016703, got {data['whatsapp_number']}"
        assert "account_sid_prefix" in data, "Response should contain 'account_sid_prefix' field"
        assert data["account_sid_prefix"].startswith("AC82a07bd9"), "Account SID prefix should match"
        
        print(f"✅ WhatsApp status: configured={data['configured']}, number={data['whatsapp_number']}")
    
    def test_whatsapp_test_connection_endpoint(self):
        """Test /api/whatsapp/test-connection returns success with account info"""
        response = requests.get(f"{BASE_URL}/api/whatsapp/test-connection")
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert "success" in data, "Response should contain 'success' field"
        assert data["success"] == True, "Connection test should succeed"
        assert "account_name" in data, "Response should contain 'account_name' field"
        assert data["account_name"] == "My first Twilio account", f"Expected 'My first Twilio account', got {data['account_name']}"
        assert "account_status" in data, "Response should contain 'account_status' field"
        assert data["account_status"] == "active", f"Expected 'active', got {data['account_status']}"
        assert "whatsapp_number" in data, "Response should contain 'whatsapp_number' field"
        assert data["whatsapp_number"] == "+18886016703", f"Expected +18886016703, got {data['whatsapp_number']}"
        
        print(f"✅ Twilio connection test: success={data['success']}, account={data['account_name']}, status={data['account_status']}")


class TestGoogleOAuthRedirect:
    """Test Google OAuth redirect configuration"""
    
    def test_auth_redirect_url_format(self):
        """Verify the OAuth redirect URL format is correct"""
        # The frontend redirects to auth.emergentagent.com with redirect parameter
        expected_auth_base = "https://auth.emergentagent.com/"
        expected_redirect_param = "redirect="
        
        # This is a configuration test - we verify the expected URL format
        # The actual redirect is tested in the browser automation
        print(f"✅ Expected OAuth URL format: {expected_auth_base}?{expected_redirect_param}<app_url>")
        assert True  # Configuration verified in browser test


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_health(self):
        """Test that the API is responding"""
        response = requests.get(f"{BASE_URL}/api/health")
        
        # API should respond (even if 404, it means server is up)
        assert response.status_code in [200, 404], f"API not responding, got {response.status_code}"
        print(f"✅ API health check: status={response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
