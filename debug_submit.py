#!/usr/bin/env python3
"""
Debug script for submit quiz endpoint
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8003"

def test_simple_submit():
    """Test a simple submit with minimal data"""
    try:
        # First login
        login_data = {
            "email": "test4@example.com",
            "password": "testpass123",
            "tenant_id": "test-tenant"
        }
        
        login_response = requests.post(f"{BASE_URL}/login", json=login_data)
        if login_response.status_code != 200:
            print(f"Login failed: {login_response.json()}")
            return
        
        token = login_response.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get quiz questions
        quiz_id = 5  # From previous test
        params = {"tenant_id": "test-tenant"}
        quiz_response = requests.get(f"{BASE_URL}/quizzes/{quiz_id}", headers=headers, params=params)
        
        if quiz_response.status_code != 200:
            print(f"Get quiz failed: {quiz_response.json()}")
            return
        
        questions = quiz_response.json().get('questions', [])
        print(f"Found {len(questions)} questions")
        
        # Create user answers
        user_answers = {}
        for question in questions:
            user_answers[str(question['id'])] = "A"
        
        print(f"User answers: {user_answers}")
        
        # Submit quiz
        submit_data = {
            "quiz_id": quiz_id,
            "session_id": 2,  # From previous test
            "tenant_id": "test-tenant",
            "user_answers": user_answers,
            "time_taken": 90
        }
        
        print(f"Submitting data: {json.dumps(submit_data, indent=2)}")
        
        submit_response = requests.post(f"{BASE_URL}/submit-quiz", json=submit_data, headers=headers)
        print(f"Submit status: {submit_response.status_code}")
        print(f"Submit headers: {dict(submit_response.headers)}")
        
        try:
            result = submit_response.json()
            print(f"Submit result: {json.dumps(result, indent=2)}")
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Response text: {submit_response.text}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_simple_submit() 