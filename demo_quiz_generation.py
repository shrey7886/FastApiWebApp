#!/usr/bin/env python3
"""
Demonstration of the Enhanced Quiz Generation System
Shows how the search topic bar works with AI-powered question generation
"""

import requests
import json
import time
from typing import Dict, Any

# API Configuration
API_BASE = "http://localhost:8001"

def demo_quiz_generation():
    """
    Demonstrate the enhanced quiz generation system
    """
    print("🎯 Enhanced Quiz Generation System Demo")
    print("=" * 60)
    print()
    
    # Step 1: User Registration/Login
    print("1️⃣ User Authentication")
    print("-" * 30)
    
    # Register a new user
    signup_data = {
        "email": "demo@example.com",
        "password": "demo123",
        "tenant_id": "demo_tenant"
    }
    
    try:
        response = requests.post(f"{API_BASE}/signup", json=signup_data)
        if response.status_code == 200:
            print("✅ User registered successfully")
        elif response.status_code == 400:
            print("ℹ️  User already exists, proceeding with login")
        else:
            print(f"❌ Registration failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return
    
    # Login to get token
    login_data = {
        "email": "demo@example.com",
        "password": "demo123",
        "tenant_id": "demo_tenant"
    }
    
    try:
        response = requests.post(f"{API_BASE}/login", json=login_data)
        if response.status_code == 200:
            token_data = response.json()
            token = token_data["access_token"]
            print("✅ Login successful, token obtained")
        else:
            print(f"❌ Login failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return
    
    print()
    
    # Step 2: Demonstrate Topic-Based Quiz Generation
    print("2️⃣ Topic-Based Quiz Generation")
    print("-" * 30)
    
    # Example topics to demonstrate
    demo_topics = [
        {
            "topic": "Artificial Intelligence",
            "difficulty": "medium",
            "num_questions": 3,
            "description": "AI and Machine Learning"
        },
        {
            "topic": "Ancient Rome",
            "difficulty": "easy",
            "num_questions": 3,
            "description": "Roman History and Culture"
        },
        {
            "topic": "Quantum Physics",
            "difficulty": "hard",
            "num_questions": 3,
            "description": "Advanced Physics Concepts"
        }
    ]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    for i, demo in enumerate(demo_topics, 1):
        print(f"\n📝 Demo {i}: {demo['description']}")
        print(f"   Topic: {demo['topic']}")
        print(f"   Difficulty: {demo['difficulty']}")
        print(f"   Questions: {demo['num_questions']}")
        
        # Generate quiz
        quiz_data = {
            "topic": demo["topic"],
            "difficulty": demo["difficulty"],
            "num_questions": demo["num_questions"],
            "duration": 10,
            "tenant_id": "demo_tenant"
        }
        
        try:
            print("   🔄 Generating quiz...")
            response = requests.post(
                f"{API_BASE}/generate-quiz",
                json=quiz_data,
                headers=headers
            )
            
            if response.status_code == 200:
                quiz_result = response.json()
                quiz_id = quiz_result["quiz_id"]
                print(f"   ✅ Quiz generated successfully (ID: {quiz_id})")
                
                # Fetch the generated quiz
                response = requests.get(
                    f"{API_BASE}/quizzes/{quiz_id}?tenant_id=demo_tenant",
                    headers=headers
                )
                
                if response.status_code == 200:
                    quiz_details = response.json()
                    print(f"   📊 Quiz: {quiz_details['title']}")
                    print(f"   📝 Total Questions: {quiz_details['total_questions']}")
                    
                    # Display first question as example
                    if quiz_details['questions']:
                        first_q = quiz_details['questions'][0]
                        print(f"   🎯 Sample Question: {first_q['question_text']}")
                        print(f"      A. {first_q['option_a']}")
                        print(f"      B. {first_q['option_b']}")
                        print(f"      C. {first_q['option_c']}")
                        print(f"      D. {first_q['option_d']}")
                        print(f"      Correct: {first_q['correct_answer']}")
                else:
                    print(f"   ❌ Failed to fetch quiz: {response.status_code}")
                    
            else:
                print(f"   ❌ Quiz generation failed: {response.status_code}")
                print(f"   Error: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        print()
    
    # Step 3: Demonstrate Topic Suggestions
    print("3️⃣ Available Topics")
    print("-" * 30)
    
    try:
        response = requests.get(
            f"{API_BASE}/topics/available?tenant_id=demo_tenant",
            headers=headers
        )
        
        if response.status_code == 200:
            topics = response.json()
            print("📚 Available topic categories:")
            for topic in topics:
                print(f"   • {topic['name']}: {topic['description']}")
        else:
            print(f"❌ Failed to fetch topics: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error fetching topics: {e}")
    
    print()
    
    # Step 4: Show Frontend Features
    print("4️⃣ Frontend Features")
    print("-" * 30)
    print("🌐 Frontend is running at: http://localhost:3000")
    print("📱 Features available:")
    print("   • Search topic bar with autocomplete")
    print("   • Topic suggestions dropdown")
    print("   • Quick topic selection buttons")
    print("   • Difficulty level selection")
    print("   • Question count slider")
    print("   • Time limit configuration")
    print("   • Real-time quiz generation")
    print("   • Loading indicators and error handling")
    
    print()
    print("=" * 60)
    print("🎉 Demo Complete!")
    print()
    print("💡 How to use the system:")
    print("1. Open http://localhost:3000 in your browser")
    print("2. Sign up or log in")
    print("3. Click 'Create New Quiz'")
    print("4. Enter a topic in the search bar")
    print("5. Configure difficulty, questions, and time")
    print("6. Click 'Generate Quiz'")
    print("7. Start taking your AI-generated quiz!")
    print()
    print("🔧 Technical Details:")
    print("• Backend API: http://localhost:8001")
    print("• API Documentation: http://localhost:8001/docs")
    print("• Database: SQLite (quiziac.db)")
    print("• AI Service: OpenAI GPT-3.5-turbo with fallback")

if __name__ == "__main__":
    demo_quiz_generation() 