import os
import json
import hashlib
import time
import re
from typing import List, Dict, Any, Optional
import openai
from dotenv import load_dotenv
from llama3_service import Llama3Service
from llama3_cloud_service import Llama3CloudService

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_unique_seed(user_id: int, topic: str, timestamp: float = None) -> str:
    """
    Generate a unique seed for question generation based on user, topic, and time
    """
    if timestamp is None:
        timestamp = time.time()
    
    # Create a unique seed combining user_id, topic, and timestamp
    seed_string = f"{user_id}_{topic}_{timestamp}"
    return hashlib.md5(seed_string.encode()).hexdigest()

def detect_topic_category(topic: str) -> Dict[str, Any]:
    """
    Intelligently detect the category and context for any given topic
    """
    topic_lower = topic.lower()
    
    # Enhanced topic detection with more categories and better matching
    topic_patterns = {
        "technology": {
            "keywords": ["technology", "tech", "computer", "software", "programming", "ai", "artificial intelligence", 
                        "machine learning", "data science", "cybersecurity", "cloud", "web", "mobile", "app", 
                        "blockchain", "virtual reality", "vr", "augmented reality", "ar", "internet", "digital"],
            "context": "focus on current technology trends, programming concepts, digital innovations, and technical applications"
        },
        "science": {
            "keywords": ["science", "physics", "chemistry", "biology", "astronomy", "geology", "psychology", 
                        "neuroscience", "genetics", "climate", "space", "quantum", "molecular", "atomic", 
                        "scientific", "research", "experiment", "theory", "discovery"],
            "context": "include scientific principles, discoveries, research methods, and real-world applications"
        },
        "history": {
            "keywords": ["history", "historical", "ancient", "medieval", "renaissance", "war", "battle", 
                        "empire", "kingdom", "civilization", "revolution", "dynasty", "period", "era", 
                        "century", "decade", "timeline", "archaeology", "artifact"],
            "context": "cover significant historical events, figures, cultural developments, and their impact on society"
        },
        "geography": {
            "keywords": ["geography", "geographic", "country", "city", "capital", "mountain", "river", 
                        "ocean", "continent", "climate", "weather", "population", "culture", "language", 
                        "region", "territory", "border", "landscape", "environment"],
            "context": "cover physical geography, countries, cultures, environmental topics, and global connections"
        },
        "literature": {
            "keywords": ["literature", "book", "novel", "poetry", "author", "writer", "poet", "play", 
                        "drama", "fiction", "classic", "shakespeare", "story", "narrative", "genre", 
                        "literary", "writing", "publishing", "literary movement"],
            "context": "focus on famous authors, works, literary movements, themes, and literary devices"
        },
        "sports": {
            "keywords": ["sport", "athletic", "game", "team", "player", "championship", "olympic", 
                        "football", "basketball", "soccer", "tennis", "golf", "swimming", "athletics", 
                        "competition", "tournament", "league", "coach", "training"],
            "context": "cover rules, history, famous figures, and significant sporting events and achievements."
        },
        "mathematics": {
            "keywords": ["math", "mathematics", "algebra", "geometry", "calculus", "statistics", "number", 
                        "equation", "formula", "theorem", "proof", "problem", "solution", "calculation", 
                        "arithmetic", "trigonometry", "probability", "analysis"],
            "context": "include mathematical concepts, formulas, problem-solving strategies, and practical applications"
        },
        "art": {
            "keywords": ["art", "artist", "painting", "sculpture", "drawing", "design", "creative", 
                        "museum", "gallery", "exhibition", "masterpiece", "style", "movement", "impressionism", 
                        "modern", "contemporary", "classical", "renaissance", "abstract"],
            "context": "cover famous artists, art movements, techniques, cultural significance, and artistic expression"
        },
        "music": {
            "keywords": ["music", "musical", "song", "instrument", "composer", "singer", "band", 
                        "orchestra", "concert", "performance", "genre", "classical", "jazz", "rock", 
                        "pop", "folk", "electronic", "melody", "rhythm", "harmony"],
            "context": "include music theory, famous composers, instruments, musical history, and cultural impact"
        },
        "politics": {
            "keywords": ["politics", "political", "government", "election", "democracy", "republic", 
                        "president", "prime minister", "parliament", "congress", "senate", "policy", 
                        "law", "constitution", "voting", "campaign", "party", "ideology"],
            "context": "cover political systems, international relations, current events, and historical developments"
        },
        "business": {
            "keywords": ["business", "commerce", "trade", "economy", "market", "finance", "investment", 
                        "company", "corporation", "entrepreneur", "startup", "management", "leadership", 
                        "strategy", "marketing", "sales", "profit", "revenue", "stock"],
            "context": "focus on business concepts, economic principles, management strategies, and market dynamics"
        },
        "health": {
            "keywords": ["health", "medical", "medicine", "doctor", "nurse", "hospital", "disease", 
                        "treatment", "therapy", "surgery", "pharmacy", "drug", "vaccine", "nutrition", 
                        "fitness", "wellness", "mental health", "public health"],
            "context": "cover medical science, healthcare systems, wellness practices, and public health topics"
        },
        "education": {
            "keywords": ["education", "school", "university", "college", "learning", "teaching", 
                        "student", "teacher", "professor", "curriculum", "academic", "degree", "diploma", 
                        "certificate", "training", "course", "lecture", "study"],
            "context": "focus on educational systems, learning methods, academic subjects, and teaching approaches"
        }
    }
    
    # Find the best matching category
    best_match = None
    highest_score = 0
    
    for category, pattern in topic_patterns.items():
        score = 0
        for keyword in pattern["keywords"]:
            if keyword in topic_lower:
                score += 1
                # Bonus for exact matches
                if keyword == topic_lower:
                    score += 2
        
        if score > highest_score:
            highest_score = score
            best_match = {
                "category": category,
                "context": pattern["context"],
                "confidence": min(score / len(pattern["keywords"]), 1.0)
            }
    
    # If no good match found, use general knowledge
    if not best_match or best_match["confidence"] < 0.3:
        return {
            "category": "general",
            "context": "general knowledge and facts across various subjects",
            "confidence": 0.1
        }
    
    return best_match

def create_topic_specific_prompt(topic: str, num_questions: int, difficulty: str) -> str:
    """
    Create a sophisticated prompt based on the topic and difficulty
    """
    difficulty_descriptions = {
        "easy": "basic facts, definitions, and simple concepts suitable for beginners",
        "medium": "moderate complexity, requiring some analysis and understanding of concepts",
        "hard": "advanced concepts, requiring deep knowledge, critical thinking, and complex reasoning"
    }
    
    difficulty_desc = difficulty_descriptions.get(difficulty, "moderate complexity, requiring some analysis and understanding")
    
    # Detect topic category and context
    topic_info = detect_topic_category(topic)
    context = topic_info["context"]
    category = topic_info["category"]
    
    # Add category-specific instructions
    category_instructions = {
        "technology": "Include questions about current trends, practical applications, and technical concepts.",
        "science": "Focus on scientific principles, methodology, and real-world applications of scientific discoveries.",
        "history": "Emphasize cause-and-effect relationships, historical significance, and cultural impact.",
        "geography": "Include questions about physical features, cultural geography, and global connections.",
        "literature": "Focus on themes, literary devices, author backgrounds, and cultural significance of works.",
        "sports": "Cover rules, history, famous figures, and significant sporting events and achievements.",
        "mathematics": "Include problem-solving scenarios, practical applications, and mathematical reasoning.",
        "art": "Focus on artistic movements, techniques, cultural context, and famous works and artists.",
        "music": "Cover music theory, historical periods, famous composers, and cultural significance.",
        "politics": "Include current events, historical developments, and understanding of political systems.",
        "business": "Focus on practical business concepts, market dynamics, and real-world applications.",
        "health": "Cover medical science, public health, wellness practices, and healthcare systems.",
        "education": "Focus on learning methods, educational systems, and academic development.",
        "general": "Cover a broad range of general knowledge topics and facts."
    }
    
    category_instruction = category_instructions.get(category, "Focus on key concepts and important facts about the topic.")
    
    prompt = f"""Generate {num_questions} {difficulty} multiple choice questions about "{topic}".

Topic Category: {category}
Context: {context}
Difficulty Level: {difficulty_desc}

Special Instructions: {category_instruction}

Requirements:
- Each question should have exactly 4 answer options (A, B, C, D)
- Only one answer should be correct
- Questions should be clear, unambiguous, and educational
- Answer options should be plausible but distinct
- Questions should test understanding and knowledge, not just memorization
- Vary the question types (factual, conceptual, analytical, application-based)
- Ensure questions are appropriate for the specified difficulty level
- Make questions engaging and relevant to the topic

Return the result as a JSON array of objects with this exact format:
[
  {{
    "question": "Question text here?",
    "answers": [
      {{"text": "Option A", "correct": false}},
      {{"text": "Option B", "correct": true}},
      {{"text": "Option C", "correct": false}},
      {{"text": "Option D", "correct": false}}
    ]
  }}
]

Ensure the JSON is valid and properly formatted. Focus on creating high-quality, educational questions that genuinely test knowledge about "{topic}"."""

    return prompt

def validate_question_format(question_data: Dict[str, Any]) -> bool:
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

def generate_quiz_questions(topic: str, num_questions: int, difficulty: str, user_id: int, seed: str) -> List[Dict[str, Any]]:
    """
    Generate quiz questions using Llama3 as primary model with OpenAI as fallback
    """
    print(f"🤖 Generating {num_questions} {difficulty} questions about '{topic}' using AI models...")
    
    # Try Llama3 first (only if Ollama is available)
    try:
        # Check if Ollama is running by trying a simple request
        import requests
        try:
            response = requests.get("http://localhost:11434/api/tags", timeout=2)
            if response.status_code == 200:
                # Check if llama3.2:3b model is available
                models = response.json().get('models', [])
                llama_model_available = any('llama3.2:3b' in model.get('name', '') for model in models)
                
                if llama_model_available:
                    llama_service = Llama3Service()
                    questions = llama_service.generate_quiz_questions(topic, num_questions, difficulty)
                    
                    if questions and len(questions) >= num_questions:
                        print(f"✅ Successfully generated {len(questions)} Llama3 questions for topic: {topic}")
                        return questions[:num_questions]
                    else:
                        print(f"⚠️  Llama3 generated insufficient questions ({len(questions) if questions else 0}), trying OpenAI...")
                else:
                    print("⚠️  Llama3.2:3b model not available, trying OpenAI...")
            else:
                print("⚠️  Ollama not responding properly, trying OpenAI...")
        except:
            print("⚠️  Ollama not running, trying OpenAI...")
            
    except Exception as e:
        print(f"❌ Llama3 generation failed for topic '{topic}': {e}")
        print("🔄 Trying Llama3 Cloud service...")
        
        # Try Llama3 Cloud service as second option
        try:
            import os
            llama3_api_key = os.getenv("LLAMA3_API_KEY")
            
            if llama3_api_key and llama3_api_key != "your-llama3-api-key-here":
                llama3_cloud = Llama3CloudService()
                questions = llama3_cloud.generate_quiz_questions(topic, num_questions, difficulty)
                
                if questions and len(questions) >= num_questions:
                    print(f"✅ Successfully generated {len(questions)} Llama3 Cloud questions for topic: {topic}")
                    return questions[:num_questions]
                else:
                    print(f"⚠️  Llama3 Cloud generated insufficient questions ({len(questions) if questions else 0}), trying OpenAI...")
            else:
                print("⚠️  Llama3 Cloud API key not set, trying OpenAI...")
                
        except Exception as cloud_e:
            print(f"❌ Llama3 Cloud generation failed for topic '{topic}': {cloud_e}")
            print("🔄 Falling back to OpenAI...")
    
    # Try OpenAI as fallback
    try:
        import os
        openai_api_key = os.getenv("OPENAI_API_KEY")
        
        if openai_api_key and openai_api_key != "your-openai-api-key-here":
            from openai import OpenAI
            client = OpenAI(api_key=openai_api_key)
            
            prompt = create_topic_specific_prompt(topic, num_questions, difficulty)
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert quiz generator. Generate questions in the exact JSON format specified."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            print(f"🤖 OpenAI response received for topic: {topic}")
            
            # Parse the response
            try:
                import json
                questions_data = json.loads(content)
                
                if isinstance(questions_data, list) and len(questions_data) >= num_questions:
                    # Validate and format questions
                    valid_questions = []
                    for q in questions_data[:num_questions]:
                        if validate_question_format(q):
                            valid_questions.append(q)
                    
                    if valid_questions:
                        print(f"✅ Successfully generated {len(valid_questions)} OpenAI questions for topic: {topic}")
                        return valid_questions
                    else:
                        print("⚠️  OpenAI generated invalid questions, using fallback...")
                else:
                    print("⚠️  OpenAI response format invalid, using fallback...")
                    
            except json.JSONDecodeError:
                print("⚠️  OpenAI response not valid JSON, using fallback...")
        else:
            print("⚠️  OpenAI API key not set, using fallback...")
            
    except Exception as e:
        print(f"❌ OpenAI generation failed for topic '{topic}': {e}")
        print("🔄 Using dynamic fallback questions...")
    
    # Use dynamic fallback questions
    print(f"🔄 Generating {num_questions} dynamic fallback questions for topic: {topic}")
    return get_fallback_questions(topic, num_questions, seed)

def get_fallback_questions(topic: str, num_questions: int = 5, seed: str = None) -> List[Dict[str, Any]]:
    """
    Generate dynamic fallback questions based on the topic with enhanced accuracy
    """
    print(f"🔄 Generating {num_questions} dynamic fallback questions for topic: {topic}")
    
    # Use seed to ensure consistent but varied questions
    if seed:
        try:
            seed_int = int(seed[:8], 16) if len(seed) >= 8 else hash(seed)
        except (ValueError, TypeError):
            seed_int = hash(seed)
    else:
        seed_int = hash(topic)
    
    # Generate topic-specific questions dynamically
    questions = []
    
    # Enhanced topic-specific question templates with more accurate content
    topic_templates = {
        "programming": [
            "What is the primary purpose of {topic} in software development?",
            "Which programming paradigm does {topic} primarily follow?",
            "What are the key features that distinguish {topic} from other languages?",
            "How does {topic} handle memory management?",
            "What are the main use cases for {topic}?",
            "Which data structures are most commonly used in {topic}?",
            "How does {topic} implement object-oriented programming?",
            "What are the performance characteristics of {topic}?",
            "How does {topic} handle concurrency and threading?",
            "What are the best practices for debugging in {topic}?"
        ],
        "ai_ml": [
            "What is the fundamental concept behind {topic}?",
            "How does {topic} differ from traditional programming approaches?",
            "What are the main applications of {topic} in industry?",
            "Which algorithms are commonly used in {topic}?",
            "How does {topic} handle data preprocessing?",
            "What are the ethical considerations in {topic}?",
            "How does {topic} address the problem of overfitting?",
            "What are the current limitations of {topic}?",
            "How does {topic} integrate with existing systems?",
            "What are the future trends in {topic} development?"
        ],
        "science": [
            "What is the fundamental principle underlying {topic}?",
            "How does {topic} explain observed natural phenomena?",
            "What are the key experimental methods used in {topic}?",
            "How is {topic} applied in modern technology?",
            "What are the main theories that support {topic}?",
            "How do researchers validate findings in {topic}?",
            "What are the current challenges facing {topic}?",
            "How has {topic} influenced other scientific fields?",
            "What are the ethical implications of {topic} research?",
            "What are the emerging trends in {topic} studies?"
        ],
        "business": [
            "What is the core concept of {topic} in business management?",
            "How does {topic} contribute to organizational success?",
            "What are the key strategies for implementing {topic}?",
            "How does {topic} impact decision-making processes?",
            "What are the main challenges in {topic} adoption?",
            "How does {topic} relate to customer satisfaction?",
            "What are the financial implications of {topic}?",
            "How does {topic} affect competitive advantage?",
            "What are the best practices for {topic} management?",
            "What are the future trends in {topic} development?"
        ],
        "history": [
            "What were the primary causes leading to {topic}?",
            "How did {topic} influence subsequent historical events?",
            "Who were the key figures involved in {topic}?",
            "What were the immediate consequences of {topic}?",
            "How did {topic} change social structures?",
            "What were the major developments during {topic}?",
            "How is {topic} interpreted by modern historians?",
            "What primary sources document {topic}?",
            "What controversies exist regarding {topic}?",
            "How does {topic} compare to similar historical events?"
        ],
        "technology": [
            "What is the fundamental technology behind {topic}?",
            "How does {topic} solve specific problems?",
            "What are the key components of {topic} systems?",
            "How does {topic} integrate with existing infrastructure?",
            "What are the security considerations for {topic}?",
            "How does {topic} impact user experience?",
            "What are the scalability challenges of {topic}?",
            "How does {topic} compare to alternative solutions?",
            "What are the maintenance requirements for {topic}?",
            "What are the future developments expected in {topic}?"
        ],
        "general": [
            "What is the fundamental definition of {topic}?",
            "How does {topic} function in practical applications?",
            "What are the key characteristics that define {topic}?",
            "What are the primary benefits of {topic}?",
            "What challenges are commonly associated with {topic}?",
            "How has {topic} evolved over time?",
            "What are the different categories within {topic}?",
            "How do people typically interact with {topic}?",
            "What is the significance of {topic} in modern context?",
            "What are the anticipated developments in {topic}?"
        ]
    }
    
    # Determine topic category with enhanced detection
    topic_lower = topic.lower()
    if any(word in topic_lower for word in ['python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'programming', 'coding', 'software', 'development']):
        category = "programming"
        topic_word = topic
    elif any(word in topic_lower for word in ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural network', 'algorithm', 'data science', 'ml', 'neural']):
        category = "ai_ml"
        topic_word = topic
    elif any(word in topic_lower for word in ['physics', 'chemistry', 'biology', 'astronomy', 'geology', 'psychology', 'neuroscience', 'genetics', 'science', 'experiment', 'research', 'theory', 'scientific']):
        category = "science"
        topic_word = topic
    elif any(word in topic_lower for word in ['business', 'economics', 'finance', 'marketing', 'management', 'entrepreneur', 'startup', 'corporate', 'strategy']):
        category = "business"
        topic_word = topic
    elif any(word in topic_lower for word in ['history', 'historical', 'ancient', 'medieval', 'renaissance', 'war', 'battle', 'empire', 'kingdom', 'civilization', 'revolution']):
        category = "history"
        topic_word = topic
    elif any(word in topic_lower for word in ['computer', 'software', 'app', 'phone', 'internet', 'robot', 'tech', 'digital', 'technology', 'system', 'platform']):
        category = "technology"
        topic_word = topic
    else:
        category = "general"
        topic_word = topic
    
    templates = topic_templates[category]
    
    for i in range(min(num_questions, len(templates))):
        # Use seed to select template and generate varied questions
        template_index = (seed_int + i) % len(templates)
        template = templates[template_index]
        
        question_text = template.format(**{category[:-1]: topic_word, "topic": topic_word, "animal": topic_word, "tech": topic_word, "science": topic_word, "history": topic_word, "geography": topic_word})
        
        # Generate plausible answers based on the question
        correct_answer = generate_plausible_answer(question_text, topic_word, category)
        wrong_answers = generate_wrong_answers(question_text, topic_word, category, correct_answer)
        
        # Shuffle answers
        all_answers = [correct_answer] + wrong_answers
        import random
        random.seed(seed_int + i)
        random.shuffle(all_answers)
        
        questions.append({
            "question": question_text,
            "answers": [
                {"text": answer, "correct": answer == correct_answer}
                for answer in all_answers
            ]
        })
    
    print(f"✅ Generated {len(questions)} dynamic fallback questions for '{topic}'")
    return questions

def generate_plausible_answer(question: str, topic: str, category: str) -> str:
    """Generate a plausible correct answer based on the question and topic"""
    question_lower = question.lower()
    
    if "largest" in question_lower:
        return f"The largest {topic}"
    elif "live" in question_lower or "lifespan" in question_lower:
        return "10-15 years"
    elif "habitat" in question_lower:
        return f"Natural {topic} habitats"
    elif "eat" in question_lower or "diet" in question_lower:
        return f"{topic} food sources"
    elif "communicate" in question_lower:
        return f"{topic} communication methods"
    elif "predators" in question_lower:
        return f"Natural {topic} predators"
    elif "reproduce" in question_lower:
        return f"{topic} reproduction methods"
    elif "adaptations" in question_lower:
        return f"{topic} survival adaptations"
    elif "found" in question_lower or "location" in question_lower:
        return f"Global {topic} distribution"
    elif "social" in question_lower:
        return f"{topic} social behavior"
    elif "purpose" in question_lower:
        return f"Primary {topic} functions"
    elif "developed" in question_lower or "invented" in question_lower:
        return "Early 20th century"
    elif "work" in question_lower or "function" in question_lower:
        return f"{topic} operational principles"
    elif "benefits" in question_lower:
        return f"{topic} advantages"
    elif "limitations" in question_lower:
        return f"{topic} constraints"
    elif "evolved" in question_lower:
        return f"{topic} development timeline"
    elif "industries" in question_lower:
        return f"{topic} applications"
    elif "security" in question_lower:
        return f"{topic} safety measures"
    elif "compare" in question_lower:
        return f"{topic} vs alternatives"
    elif "future" in question_lower:
        return f"{topic} future prospects"
    elif "principle" in question_lower:
        return f"Core {topic} concepts"
    elif "phenomena" in question_lower:
        return f"{topic} natural processes"
    elif "discoveries" in question_lower:
        return f"Key {topic} findings"
    elif "applied" in question_lower:
        return f"{topic} practical uses"
    elif "theories" in question_lower:
        return f"Major {topic} theories"
    elif "study" in question_lower:
        return f"{topic} research methods"
    elif "challenges" in question_lower:
        return f"{topic} current issues"
    elif "influenced" in question_lower:
        return f"{topic} technological impact"
    elif "ethical" in question_lower:
        return f"{topic} moral considerations"
    elif "occur" in question_lower:
        return "Historical timeline"
    elif "causes" in question_lower:
        return f"{topic} contributing factors"
    elif "figures" in question_lower:
        return f"Key {topic} leaders"
    elif "consequences" in question_lower:
        return f"{topic} outcomes"
    elif "change" in question_lower:
        return f"{topic} societal impact"
    elif "events" in question_lower:
        return f"Major {topic} milestones"
    elif "remembered" in question_lower:
        return f"{topic} historical legacy"
    elif "sources" in question_lower:
        return f"{topic} historical records"
    elif "controversies" in question_lower:
        return f"{topic} debates"
    elif "located" in question_lower:
        return f"{topic} geographical position"
    elif "climate" in question_lower:
        return f"{topic} weather patterns"
    elif "features" in question_lower:
        return f"{topic} physical characteristics"
    elif "population" in question_lower:
        return f"{topic} demographic data"
    elif "resources" in question_lower:
        return f"{topic} natural assets"
    elif "culture" in question_lower:
        return f"{topic} cultural heritage"
    elif "industries" in question_lower:
        return f"{topic} economic activities"
    elif "environmental" in question_lower:
        return f"{topic} ecological issues"
    elif "unique" in question_lower:
        return f"{topic} distinctive qualities"
    elif "definition" in question_lower:
        return f"{topic} meaning"
    elif "characteristics" in question_lower:
        return f"{topic} key features"
    elif "types" in question_lower:
        return f"{topic} classifications"
    elif "interact" in question_lower:
        return f"{topic} engagement methods"
    elif "importance" in question_lower:
        return f"{topic} significance"
    else:
        return f"Primary {topic} aspects"

def generate_wrong_answers(question: str, topic: str, category: str, correct_answer: str) -> List[str]:
    """Generate plausible wrong answers"""
    question_lower = question.lower()
    
    # Generate contextually appropriate wrong answers
    wrong_answers = []
    
    if "largest" in question_lower:
        wrong_answers = [f"Smaller {topic} varieties", f"Medium-sized {topic}", f"Average {topic}"]
    elif "live" in question_lower or "lifespan" in question_lower:
        wrong_answers = ["5-8 years", "20-25 years", "2-3 years"]
    elif "habitat" in question_lower:
        wrong_answers = [f"Urban {topic} environments", f"Artificial {topic} spaces", f"Temporary {topic} locations"]
    elif "eat" in question_lower or "diet" in question_lower:
        wrong_answers = [f"Alternative {topic} foods", f"Processed {topic} meals", f"Supplemental {topic} nutrition"]
    elif "communicate" in question_lower:
        wrong_answers = [f"Basic {topic} signals", f"Advanced {topic} methods", f"Simple {topic} gestures"]
    elif "predators" in question_lower:
        wrong_answers = [f"Artificial {topic} threats", f"Environmental {topic} dangers", f"Human {topic} impacts"]
    elif "reproduce" in question_lower:
        wrong_answers = [f"Alternative {topic} methods", f"Artificial {topic} processes", f"Natural {topic} cycles"]
    elif "adaptations" in question_lower:
        wrong_answers = [f"Basic {topic} features", f"Advanced {topic} traits", f"Simple {topic} characteristics"]
    elif "found" in question_lower or "location" in question_lower:
        wrong_answers = [f"Limited {topic} areas", f"Specific {topic} regions", f"Restricted {topic} zones"]
    elif "social" in question_lower:
        wrong_answers = [f"Individual {topic} behavior", f"Group {topic} dynamics", f"Complex {topic} interactions"]
    elif "purpose" in question_lower:
        wrong_answers = [f"Secondary {topic} functions", f"Alternative {topic} uses", f"Additional {topic} purposes"]
    elif "developed" in question_lower or "invented" in question_lower:
        wrong_answers = ["Late 19th century", "Mid 20th century", "Early 21st century"]
    elif "work" in question_lower or "function" in question_lower:
        wrong_answers = [f"Basic {topic} operations", f"Advanced {topic} systems", f"Simple {topic} mechanisms"]
    elif "benefits" in question_lower:
        wrong_answers = [f"Minor {topic} advantages", f"Secondary {topic} benefits", f"Additional {topic} perks"]
    elif "limitations" in question_lower:
        wrong_answers = [f"Minor {topic} constraints", f"Temporary {topic} issues", f"Manageable {topic} problems"]
    elif "evolved" in question_lower:
        wrong_answers = [f"Recent {topic} changes", f"Gradual {topic} development", f"Sudden {topic} transformations"]
    elif "industries" in question_lower:
        wrong_answers = [f"Limited {topic} sectors", f"Specific {topic} fields", f"Niche {topic} applications"]
    elif "security" in question_lower:
        wrong_answers = [f"Basic {topic} protection", f"Advanced {topic} security", f"Standard {topic} measures"]
    elif "compare" in question_lower:
        wrong_answers = [f"Similar {topic} options", f"Alternative {topic} solutions", f"Different {topic} approaches"]
    elif "future" in question_lower:
        wrong_answers = [f"Short-term {topic} trends", f"Medium-term {topic} outlook", f"Immediate {topic} prospects"]
    elif "principle" in question_lower:
        wrong_answers = [f"Basic {topic} concepts", f"Advanced {topic} theories", f"Simple {topic} ideas"]
    elif "phenomena" in question_lower:
        wrong_answers = [f"Simple {topic} processes", f"Complex {topic} mechanisms", f"Basic {topic} occurrences"]
    elif "discoveries" in question_lower:
        wrong_answers = [f"Recent {topic} findings", f"Historical {topic} observations", f"Modern {topic} insights"]
    elif "applied" in question_lower:
        wrong_answers = [f"Limited {topic} uses", f"Specific {topic} applications", f"Restricted {topic} purposes"]
    elif "theories" in question_lower:
        wrong_answers = [f"Basic {topic} hypotheses", f"Advanced {topic} models", f"Simple {topic} concepts"]
    elif "study" in question_lower:
        wrong_answers = [f"Basic {topic} research", f"Advanced {topic} analysis", f"Simple {topic} investigation"]
    elif "challenges" in question_lower:
        wrong_answers = [f"Minor {topic} issues", f"Temporary {topic} problems", f"Manageable {topic} difficulties"]
    elif "influenced" in question_lower:
        wrong_answers = [f"Limited {topic} impact", f"Specific {topic} effects", f"Restricted {topic} influence"]
    elif "ethical" in question_lower:
        wrong_answers = [f"Basic {topic} concerns", f"Advanced {topic} considerations", f"Simple {topic} issues"]
    elif "occur" in question_lower:
        wrong_answers = ["Different timeline", "Alternative period", "Other era"]
    elif "causes" in question_lower:
        wrong_answers = [f"Minor {topic} factors", f"Secondary {topic} reasons", f"Additional {topic} causes"]
    elif "figures" in question_lower:
        wrong_answers = [f"Other {topic} leaders", f"Alternative {topic} figures", f"Different {topic} personalities"]
    elif "consequences" in question_lower:
        wrong_answers = [f"Minor {topic} outcomes", f"Secondary {topic} effects", f"Additional {topic} results"]
    elif "change" in question_lower:
        wrong_answers = [f"Limited {topic} impact", f"Specific {topic} changes", f"Restricted {topic} effects"]
    elif "events" in question_lower:
        wrong_answers = [f"Minor {topic} milestones", f"Secondary {topic} events", f"Additional {topic} occurrences"]
    elif "remembered" in question_lower:
        wrong_answers = [f"Limited {topic} legacy", f"Specific {topic} memory", f"Restricted {topic} recognition"]
    elif "sources" in question_lower:
        wrong_answers = [f"Limited {topic} records", f"Specific {topic} documents", f"Restricted {topic} sources"]
    elif "controversies" in question_lower:
        wrong_answers = [f"Minor {topic} debates", f"Secondary {topic} disputes", f"Additional {topic} conflicts"]
    elif "located" in question_lower:
        wrong_answers = [f"Alternative {topic} locations", f"Different {topic} areas", f"Other {topic} regions"]
    elif "climate" in question_lower:
        wrong_answers = [f"Alternative {topic} weather", f"Different {topic} conditions", f"Other {topic} patterns"]
    elif "features" in question_lower:
        wrong_answers = [f"Alternative {topic} characteristics", f"Different {topic} aspects", f"Other {topic} qualities"]
    elif "population" in question_lower:
        wrong_answers = [f"Alternative {topic} demographics", f"Different {topic} numbers", f"Other {topic} statistics"]
    elif "resources" in question_lower:
        wrong_answers = [f"Alternative {topic} assets", f"Different {topic} materials", f"Other {topic} supplies"]
    elif "culture" in question_lower:
        wrong_answers = [f"Alternative {topic} heritage", f"Different {topic} traditions", f"Other {topic} customs"]
    elif "industries" in question_lower:
        wrong_answers = [f"Alternative {topic} activities", f"Different {topic} sectors", f"Other {topic} fields"]
    elif "environmental" in question_lower:
        wrong_answers = [f"Alternative {topic} issues", f"Different {topic} concerns", f"Other {topic} problems"]
    elif "unique" in question_lower:
        wrong_answers = [f"Common {topic} qualities", f"Standard {topic} features", f"Typical {topic} characteristics"]
    elif "definition" in question_lower:
        wrong_answers = [f"Alternative {topic} meaning", f"Different {topic} definition", f"Other {topic} interpretation"]
    elif "characteristics" in question_lower:
        wrong_answers = [f"Alternative {topic} features", f"Different {topic} qualities", f"Other {topic} traits"]
    elif "types" in question_lower:
        wrong_answers = [f"Alternative {topic} classifications", f"Different {topic} categories", f"Other {topic} types"]
    elif "interact" in question_lower:
        wrong_answers = [f"Alternative {topic} methods", f"Different {topic} approaches", f"Other {topic} ways"]
    elif "importance" in question_lower:
        wrong_answers = [f"Minor {topic} significance", f"Secondary {topic} importance", f"Limited {topic} value"]
    else:
        wrong_answers = [f"Alternative {topic} aspects", f"Different {topic} elements", f"Other {topic} factors"]
    
    # Ensure we have exactly 3 wrong answers
    while len(wrong_answers) < 3:
        wrong_answers.append(f"Additional {topic} option")
    
    return wrong_answers[:3] 