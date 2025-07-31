import os
import json
import re
import requests
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

class Llama3Service:
    def __init__(self):
        """Initialize Llama3 service with configuration"""
        self.api_url = os.getenv("LLAMA3_API_URL", "http://localhost:11434/api/generate")
        self.model_name = os.getenv("LLAMA3_MODEL", "llama3.2:3b")
        self.max_tokens = int(os.getenv("LLAMA3_MAX_TOKENS", "2000"))
        self.temperature = float(os.getenv("LLAMA3_TEMPERATURE", "0.7"))
        
    def generate_response(self, prompt: str) -> str:
        """
        Generate response using Llama3 via Ollama API
        """
        try:
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": self.temperature,
                    "num_predict": self.max_tokens
                }
            }
            
            response = requests.post(
                self.api_url,
                json=payload,
                timeout=60,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "")
            else:
                print(f"❌ Llama3 API error: {response.status_code} - {response.text}")
                return ""
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Llama3 API request failed: {e}")
            return ""
        except Exception as e:
            print(f"❌ Llama3 generation error: {e}")
            return ""
    
    def extract_json_from_response(self, response: str) -> Optional[List[Dict[str, Any]]]:
        """
        Extract JSON array from Llama3 response
        """
        try:
            # Try to find JSON array in the response
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
            
            # If no JSON array found, try to parse the entire response
            return json.loads(response)
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing error: {e}")
            print(f"Response content: {response[:500]}...")
            return None
    
    def create_quiz_prompt(self, topic: str, num_questions: int, difficulty: str) -> str:
        """
        Create a specialized prompt for quiz question generation with enhanced topic analysis
        """
        difficulty_descriptions = {
            "easy": "basic facts, definitions, fundamental concepts, and simple applications suitable for beginners",
            "medium": "moderate complexity, requiring analysis, understanding of relationships, and practical applications",
            "hard": "advanced concepts, requiring deep knowledge, critical thinking, complex reasoning, and synthesis of multiple ideas"
        }
        
        difficulty_desc = difficulty_descriptions.get(difficulty, "moderate complexity")
        
        # Enhanced topic analysis and context
        topic_analysis = self._analyze_topic_context(topic)
        
        prompt = f"""You are an expert quiz creator specializing in creating accurate, educational, and engaging multiple choice questions.

TOPIC: "{topic}"
DIFFICULTY: {difficulty} ({difficulty_desc})
NUMBER OF QUESTIONS: {num_questions}

TOPIC ANALYSIS:
{topic_analysis}

INSTRUCTIONS:
1. Create {num_questions} high-quality multiple choice questions specifically about "{topic}"
2. Each question must have exactly 4 answer options (A, B, C, D)
3. Only ONE answer should be correct
4. All answer options must be plausible and related to the topic
5. Questions should test genuine understanding, not just memorization
6. Vary question types: factual, conceptual, analytical, application-based, and scenario-based
7. Ensure questions are accurate, up-to-date, and educationally valuable
8. Make questions engaging and relevant to real-world applications

QUESTION TYPES TO INCLUDE:
- Definition and concept questions
- Application and problem-solving questions
- Analysis and comparison questions
- Scenario-based questions
- Historical or current context questions (if applicable)

QUALITY REQUIREMENTS:
- Questions must be factually accurate
- Answer options should be clearly distinct
- Avoid ambiguous or misleading questions
- Include explanations or context where helpful
- Ensure questions are appropriate for the specified difficulty level

Return ONLY a valid JSON array with this exact format:
[
  {{
    "question": "Specific, clear question about {topic}?",
    "answers": [
      {{"text": "Plausible but incorrect option", "correct": false}},
      {{"text": "Correct answer", "correct": true}},
      {{"text": "Plausible but incorrect option", "correct": false}},
      {{"text": "Plausible but incorrect option", "correct": false}}
    ]
  }}
]

Focus on creating questions that genuinely test knowledge and understanding of "{topic}". Ensure all questions are accurate, educational, and properly formatted as valid JSON."""

        return prompt
    
    def _analyze_topic_context(self, topic: str) -> str:
        """
        Analyze the topic and provide context-specific guidance
        """
        topic_lower = topic.lower()
        
        # Technology topics
        if any(word in topic_lower for word in ['programming', 'python', 'javascript', 'java', 'code', 'software', 'development']):
            return """This is a programming/technology topic. Focus on:
- Programming concepts, syntax, and best practices
- Problem-solving and algorithmic thinking
- Software development methodologies
- Current trends and tools in the field
- Practical applications and real-world scenarios"""
        
        # Science topics
        elif any(word in topic_lower for word in ['physics', 'chemistry', 'biology', 'science', 'experiment', 'research']):
            return """This is a scientific topic. Focus on:
- Scientific principles and theories
- Experimental methods and research processes
- Real-world applications of scientific concepts
- Current scientific discoveries and developments
- Critical thinking and scientific reasoning"""
        
        # Business/Economics topics
        elif any(word in topic_lower for word in ['business', 'economics', 'finance', 'marketing', 'management', 'entrepreneur']):
            return """This is a business/economics topic. Focus on:
- Business concepts and principles
- Economic theories and market dynamics
- Management strategies and organizational behavior
- Financial concepts and analysis
- Current business trends and case studies"""
        
        # History topics
        elif any(word in topic_lower for word in ['history', 'historical', 'ancient', 'medieval', 'war', 'civilization']):
            return """This is a historical topic. Focus on:
- Historical events, dates, and figures
- Cause-and-effect relationships
- Cultural and social developments
- Historical significance and impact
- Primary sources and historical analysis"""
        
        # AI/Machine Learning topics
        elif any(word in topic_lower for word in ['ai', 'artificial intelligence', 'machine learning', 'neural', 'algorithm']):
            return """This is an AI/Machine Learning topic. Focus on:
- Core AI concepts and algorithms
- Machine learning techniques and applications
- Neural networks and deep learning
- Current AI developments and ethical considerations
- Practical applications and real-world use cases"""
        
        # General knowledge
        else:
            return f"""This is a general knowledge topic about "{topic}". Focus on:
- Key concepts and definitions
- Important facts and figures
- Practical applications and relevance
- Current developments and trends
- Critical thinking and analysis"""
    
    def generate_quiz_questions(self, topic: str, num_questions: int, difficulty: str) -> List[Dict[str, Any]]:
        """
        Generate quiz questions using Llama3
        """
        print(f"🤖 Generating {num_questions} {difficulty} questions about '{topic}' using Llama3...")
        
        # Create the prompt
        prompt = self.create_quiz_prompt(topic, num_questions, difficulty)
        
        # Generate response
        response = self.generate_response(prompt)
        
        if not response:
            print(f"❌ No response from Llama3 for topic: {topic}")
            return []
        
        # Extract JSON from response
        questions_data = self.extract_json_from_response(response)
        
        if not questions_data:
            print(f"❌ Could not parse JSON from Llama3 response for topic: {topic}")
            return []
        
        # Validate questions
        valid_questions = []
        for question in questions_data:
            if self.validate_question_format(question):
                valid_questions.append(question)
            else:
                print(f"⚠️  Invalid question format detected, skipping: {question.get('question', 'Unknown')[:50]}...")
        
        print(f"✅ Successfully generated {len(valid_questions)} Llama3 questions for topic: {topic}")
        return valid_questions[:num_questions]
    
    def validate_question_format(self, question_data: Dict[str, Any]) -> bool:
        """
        Validate that a question has the correct format
        """
        if not isinstance(question_data, dict):
            return False
        
        if 'question' not in question_data or 'answers' not in question_data:
            return False
        
        if not isinstance(question_data['question'], str) or not question_data['question'].strip():
            return False
        
        if not isinstance(question_data['answers'], list) or len(question_data['answers']) != 4:
            return False
        
        correct_count = 0
        for answer in question_data['answers']:
            if not isinstance(answer, dict) or 'text' not in answer or 'correct' not in answer:
                return False
            if answer['correct']:
                correct_count += 1
        
        return correct_count == 1

# Global instance
llama3_service = Llama3Service() 