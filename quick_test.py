#!/usr/bin/env python3
"""
Quick test to identify the signup issue
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8003"

def test_signup_detailed():
    """Test signup with detailed error reporting"""
    try:
        data = {
            "email": "test@example.com",
            "password": "testpass123",
            "tenant_id": "test-tenant",
            "first_name": "Test",
            "last_name": "User"
        }
        
        print("Sending signup request...")
        response = requests.post(f"{BASE_URL}/signup", json=data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        try:
            result = response.json()
            print(f"Response JSON: {json.dumps(result, indent=2)}")
        except:
            print(f"Response Text: {response.text}")
            
        return response.status_code == 200
        
    except Exception as e:
        print(f"Exception: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Testing signup endpoint...")
    success = test_signup_detailed()
    print(f"Test {'passed' if success else 'failed'}") 