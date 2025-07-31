#!/usr/bin/env python3
"""
Debug script to identify issues with quiz generation endpoint
"""

import requests
import json
import traceback

def debug_quiz_generation():
    """Debug the quiz generation endpoint"""
    print("🔍 Debugging Quiz Generation Endpoint...")
    
    # First, get a token
    print("1. Getting authentication token...")
    
    login_data = {
        "email": "test@example.com",
        "password": "testpassword123",
        "tenant_id": "test-tenant"
    }
    
    try:
        response = requests.post(
            "http://127.0.0.1:8001/login",
            json=login_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            token = result.get('access_token')
            print("✅ Got authentication token")
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    # Test quiz generation with detailed error handling
    print("\n2. Testing quiz generation...")
    
    test_data = {
        "topic": "Python Programming",
        "difficulty": "medium",
        "num_questions": 3,
        "duration": 10,
        "tenant_id": "test-tenant"
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    try:
        print("📡 Sending request to /generate-quiz...")
        response = requests.post(
            "http://127.0.0.1:8001/generate-quiz",
            json=test_data,
            headers=headers,
            timeout=30
        )
        
        print(f"📊 Response status: {response.status_code}")
        print(f"📋 Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Quiz generation successful!")
            print(f"🤖 Model used: {result.get('model_used')}")
            print(f"📊 Questions: {result.get('questions_generated')}")
        else:
            print(f"❌ Quiz generation failed: {response.status_code}")
            print(f"📋 Response text: {response.text}")
            
            # Try to parse error details
            try:
                error_detail = response.json()
                print(f"🔍 Error detail: {json.dumps(error_detail, indent=2)}")
            except:
                print("📋 Raw response: {response.text}")
                
    except requests.exceptions.Timeout:
        print("⏰ Request timed out")
    except Exception as e:
        print(f"❌ Request error: {e}")
        print(f"🔍 Traceback: {traceback.format_exc()}")

def test_llama3_directly():
    """Test Llama3 service directly to see if it's working"""
    print("\n3. Testing Llama3 service directly...")
    
    try:
        from llama3_service import Llama3Service
        
        llama_service = Llama3Service()
        
        # Test question generation
        questions = llama_service.generate_quiz_questions("Python Programming", 2, "easy")
        
        if questions and len(questions) > 0:
            print(f"✅ Llama3 generated {len(questions)} questions successfully")
            for i, q in enumerate(questions, 1):
                print(f"  Q{i}: {q['question'][:80]}...")
        else:
            print("❌ Llama3 failed to generate questions")
            
    except Exception as e:
        print(f"❌ Llama3 test error: {e}")
        print(f"🔍 Traceback: {traceback.format_exc()}")

def test_ai_service_directly():
    """Test AI service directly"""
    print("\n4. Testing AI service directly...")
    
    try:
        from ai_service import generate_quiz_questions, generate_unique_seed
        
        user_id = 1
        topic = "Python Programming"
        seed = generate_unique_seed(user_id, topic)
        
        questions = generate_quiz_questions(topic, 2, "easy", user_id, seed)
        
        if questions and len(questions) > 0:
            print(f"✅ AI service generated {len(questions)} questions successfully")
            for i, q in enumerate(questions, 1):
                print(f"  Q{i}: {q['question'][:80]}...")
        else:
            print("❌ AI service failed to generate questions")
            
    except Exception as e:
        print(f"❌ AI service test error: {e}")
        print(f"🔍 Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    debug_quiz_generation()
    test_llama3_directly()
    test_ai_service_directly() 