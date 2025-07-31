import requests
import json

def debug_quiz_generation():
    print("🔍 Debugging Quiz Generation")
    print("=" * 40)
    
    # Step 1: Register a user
    user_data = {
        "email": "debug@example.com",
        "password": "debug123",
        "first_name": "Debug",
        "last_name": "User",
        "tenant_id": "debug_tenant"
    }
    
    try:
        response = requests.post("http://127.0.0.1:8001/signup", json=user_data)
        print(f"✅ Registration: {response.status_code}")
    except Exception as e:
        print(f"❌ Registration failed: {e}")
        return
    
    # Step 2: Login
    login_data = {
        "email": "debug@example.com",
        "password": "debug123",
        "tenant_id": "debug_tenant"
    }
    
    try:
        response = requests.post("http://127.0.0.1:8001/login", json=login_data)
        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get('access_token')
            print(f"✅ Login successful")
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Response: {response.text}")
            return
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    # Step 3: Test quiz generation
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    quiz_data = {
        "topic": "Python Programming",
        "num_questions": 3,
        "difficulty": "medium",
        "tenant_id": "debug_tenant"
    }
    
    try:
        print(f"🎯 Attempting quiz generation...")
        response = requests.post(
            "http://127.0.0.1:8001/generate-quiz",
            json=quiz_data,
            headers=headers
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            quiz = response.json()
            print(f"✅ Quiz generation successful!")
            print(f"Quiz ID: {quiz.get('id')}")
            print(f"Questions: {len(quiz.get('questions', []))}")
        else:
            print(f"❌ Quiz generation failed")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Quiz generation error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_quiz_generation() 