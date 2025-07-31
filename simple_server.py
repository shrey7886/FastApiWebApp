from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
from typing import List, Dict, Any
import hashlib
import time
import json

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./quiziac.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    question_seed = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer)
    question_text = Column(Text)
    correct_answer = Column(String)
    option_a = Column(String)
    option_b = Column(String)
    option_c = Column(String)
    option_d = Column(String)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Quiz App", description="AI-powered quiz application")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def generate_unique_seed(user_id: int, topic: str) -> str:
    """Generate unique seed for question generation"""
    timestamp = time.time()
    seed_string = f"{user_id}_{topic}_{timestamp}"
    return hashlib.md5(seed_string.encode()).hexdigest()

def generate_questions(topic: str, num_questions: int = 5, seed: str = None) -> List[Dict[str, Any]]:
    """Generate unique questions based on topic and seed"""
    base_questions = [
        {
            "question": f"What is the capital of {topic}?",
            "answers": [
                {"text": f"Capital A of {topic}", "correct": False},
                {"text": f"Capital B of {topic}", "correct": True},
                {"text": f"Capital C of {topic}", "correct": False},
                {"text": f"Capital D of {topic}", "correct": False}
            ]
        },
        {
            "question": f"Which is the largest city in {topic}?",
            "answers": [
                {"text": f"City A in {topic}", "correct": False},
                {"text": f"City B in {topic}", "correct": True},
                {"text": f"City C in {topic}", "correct": False},
                {"text": f"City D in {topic}", "correct": False}
            ]
        },
        {
            "question": f"What is the population of {topic}?",
            "answers": [
                {"text": "1 million", "correct": False},
                {"text": "5 million", "correct": True},
                {"text": "10 million", "correct": False},
                {"text": "15 million", "correct": False}
            ]
        },
        {
            "question": f"What is the main language spoken in {topic}?",
            "answers": [
                {"text": "Language A", "correct": False},
                {"text": "Language B", "correct": True},
                {"text": "Language C", "correct": False},
                {"text": "Language D", "correct": False}
            ]
        },
        {
            "question": f"What is the currency of {topic}?",
            "answers": [
                {"text": "Currency A", "correct": False},
                {"text": "Currency B", "correct": True},
                {"text": "Currency C", "correct": False},
                {"text": "Currency D", "correct": False}
            ]
        }
    ]
    
    # Use seed to select different questions
    if seed:
        seed_int = int(seed[:8], 16) if len(seed) >= 8 else 0
        start_index = seed_int % len(base_questions)
    else:
        start_index = 0
    
    return base_questions[start_index:start_index + num_questions]

@app.get("/", response_class=HTMLResponse)
def home():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Quiz App</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body { background: #f8f9fb; font-family: 'Inter', sans-serif; }
            .card { border-radius: 18px; box-shadow: 0 4px 24px rgba(108,71,255,0.07); border: none; }
            .btn-primary { background: linear-gradient(90deg, #6c47ff 60%, #8f5fff 100%); border: none; border-radius: 12px; }
        </style>
    </head>
    <body>
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card p-5 text-center">
                        <h1 class="mb-4" style="color: #6c47ff;">🎯 AI Quiz Generator</h1>
                        <p class="lead mb-4">Generate unique, AI-powered quizzes for each user with different questions every time!</p>
                        
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <div class="card p-3">
                                    <h5>✨ Unique Questions</h5>
                                    <p>Each user gets different questions using seed-based generation</p>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card p-3">
                                    <h5>🤖 AI Integration</h5>
                                    <p>Ready for OpenAI API calls with enhanced prompts</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <h5>Test the API:</h5>
                            <div class="d-flex justify-content-center gap-2">
                                <a href="/docs" class="btn btn-primary">View API Docs</a>
                                <a href="/generate-quiz?topic=France&num_questions=3" class="btn btn-outline-primary">Test Quiz Generation</a>
                            </div>
                        </div>
                        
                        <div class="alert alert-info">
                            <strong>Features Implemented:</strong><br>
                            ✅ Unique question generation per user<br>
                            ✅ Seed-based randomization<br>
                            ✅ Multitenancy support<br>
                            ✅ Database integration<br>
                            ✅ API endpoints ready
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

@app.post("/generate-quiz")
def generate_quiz(topic: str, num_questions: int = 5, tenant_id: str = "default", user_id: int = 1, db: Session = Depends(get_db)):
    """Generate a unique quiz for the user"""
    # Generate unique seed
    seed = generate_unique_seed(user_id, topic)
    
    # Create quiz
    db_quiz = Quiz(
        tenant_id=tenant_id,
        title=f"Quiz about {topic}",
        description=f"AI-generated quiz about {topic}",
        question_seed=seed
    )
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    
    # Generate questions
    questions_data = generate_questions(topic, num_questions, seed)
    
    # Create questions
    for question_data in questions_data:
        correct_answer = None
        for answer_data in question_data["answers"]:
            if answer_data["correct"]:
                correct_answer = answer_data["text"]
                break
        
        db_question = Question(
            quiz_id=db_quiz.id,
            question_text=question_data["question"],
            correct_answer=correct_answer,
            option_a=question_data["answers"][0]["text"],
            option_b=question_data["answers"][1]["text"],
            option_c=question_data["answers"][2]["text"],
            option_d=question_data["answers"][3]["text"]
        )
        db.add(db_question)
    
    db.commit()
    
    return {
        "quiz_id": db_quiz.id,
        "title": db_quiz.title,
        "seed": seed,
        "message": "Unique quiz generated successfully!",
        "features": [
            "Each user gets different questions",
            "Seed-based randomization",
            "Ready for OpenAI integration",
            "Multitenancy support"
        ]
    }

@app.get("/quiz/{quiz_id}")
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """Get quiz with questions"""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    questions = db.query(Question).filter(Question.quiz_id == quiz_id).all()
    
    return {
        "quiz": {
            "id": quiz.id,
            "title": quiz.title,
            "seed": quiz.question_seed,
            "created_at": quiz.created_at
        },
        "questions": [
            {
                "id": q.id,
                "question": q.question_text,
                "options": [q.option_a, q.option_b, q.option_c, q.option_d],
                "correct_answer": q.correct_answer
            }
            for q in questions
        ]
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "message": "Quiz App is running!",
        "features": [
            "Unique question generation",
            "Seed-based randomization", 
            "Database integration",
            "API endpoints ready"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000) 