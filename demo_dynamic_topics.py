#!/usr/bin/env python3
"""
Demo script for dynamic topic quiz generation with Llama3
"""

import os
import sys
import requests
import json
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from llama3_service import llama3_service

def demo_dynamic_topics():
    """Demonstrate dynamic topic quiz generation"""
    print("🎯 Dynamic Topic Quiz Generation Demo")
    print("=" * 50)
    
    # Load environment variables
    load_dotenv()
    
    # Test topics - these can be anything!
    test_topics = [
        "Dogs",
        "Space Travel", 
        "Cooking",
        "Video Games",
        "Ancient Egypt",
        "Rock Music",
        "Gardening",
        "Superheroes",
        "Coffee",
        "Dinosaurs"
    ]
    
    print("🚀 Testing dynamic topic generation with Llama3...")
    print("These topics demonstrate the flexibility of the system!\n")
    
    for i, topic in enumerate(test_topics, 1):
        print(f"📝 Demo {i}/10: Generating quiz about '{topic}'")
        print("-" * 40)
        
        try:
            # Generate questions using Llama3
            questions = llama3_service.generate_quiz_questions(topic, 3, "medium")
            
            if questions:
                print(f"✅ Successfully generated {len(questions)} questions!")
                
                # Display sample questions
                for j, q in enumerate(questions, 1):
                    print(f"\nQ{j}: {q['question']}")
                    
                    # Show answer options
                    for k, answer in enumerate(q['answers'], 1):
                        marker = "✓" if answer['correct'] else " "
                        print(f"   {k}. [{marker}] {answer['text']}")
                
                print(f"\n🎉 Quiz about '{topic}' is ready!")
                
            else:
                print(f"❌ Failed to generate questions for '{topic}'")
                
        except Exception as e:
            print(f"❌ Error generating questions for '{topic}': {e}")
        
        print("\n" + "="*50 + "\n")
        
        # Small delay between requests
        import time
        time.sleep(1)

def demo_api_integration():
    """Demonstrate API integration"""
    print("🔌 API Integration Demo")
    print("=" * 50)
    
    # This would be used with the FastAPI server
    api_example = {
        "topic": "Dogs",
        "difficulty": "medium", 
        "num_questions": 5,
        "duration": 10,
        "tenant_id": "demo"
    }
    
    print("📡 Example API call:")
    print(f"POST /generate-quiz")
    print(f"Body: {json.dumps(api_example, indent=2)}")
    
    print("\n📋 Expected response:")
    expected_response = {
        "success": True,
        "quiz_id": 123,
        "topic": "Dogs",
        "questions_generated": 5,
        "model_used": "Llama3"
    }
    print(json.dumps(expected_response, indent=2))

def demo_frontend_integration():
    """Demonstrate frontend integration"""
    print("\n🖥️ Frontend Integration Demo")
    print("=" * 50)
    
    print("The frontend already supports dynamic topics!")
    print("\n✨ Features:")
    print("• Free-text topic input")
    print("• Topic suggestions dropdown")
    print("• Popular topic quick-select buttons")
    print("• Fun topic examples")
    print("• Real-time validation")
    
    print("\n🎯 Example user flow:")
    print("1. User types 'Dogs' in topic field")
    print("2. System generates 5 questions about dogs")
    print("3. Questions are displayed in quiz format")
    print("4. User takes the quiz and gets scored")
    print("5. Results are saved with topic metadata")

def main():
    """Main demo function"""
    print("🎉 Llama3 Dynamic Topic Quiz Generator")
    print("=" * 60)
    print("This demo showcases the power of local AI for generating")
    print("quiz questions for ANY topic the user can think of!")
    print("=" * 60)
    
    # Check if Llama3 is available
    try:
        response = llama3_service.generate_response("Hello")
        if not response:
            print("❌ Llama3 is not available. Please run setup_llama3.py first.")
            return
    except Exception as e:
        print(f"❌ Llama3 connection failed: {e}")
        print("Please ensure Ollama is running and Llama3 model is downloaded.")
        return
    
    # Run demos
    demo_dynamic_topics()
    demo_api_integration()
    demo_frontend_integration()
    
    print("\n🎊 Demo Complete!")
    print("\n💡 Key Benefits:")
    print("• No API costs - everything runs locally")
    print("• Privacy - no data sent to external services")
    print("• Flexibility - any topic imaginable")
    print("• Reliability - multiple fallback options")
    print("• Speed - local processing is fast")
    
    print("\n🚀 Ready to generate quizzes for any topic!")
    print("Start the server with: python main.py")

if __name__ == "__main__":
    main() 