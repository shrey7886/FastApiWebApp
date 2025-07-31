from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from datetime import datetime
from passlib.context import CryptContext
from typing import Optional, List, Dict, Any
import jwt
import os
from dotenv import load_dotenv
import json
import hashlib
import time

# Load environment variables
load_dotenv()

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./quiziac.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, index=True)
    email = Column(String, unique=False, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    is_ai_generated = Column(Boolean, default=True)
    question_seed = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    question_text = Column(Text)
    correct_answer = Column(String)
    option_a = Column(String)
    option_b = Column(String)
    option_c = Column(String)
    option_d = Column(String)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Quiz App", description="AI-powered quiz application")

# Mount static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Simple AI question generation (without OpenAI for now)
def generate_questions(topic: str, num_questions: int = 5, seed: str = None) -> List[Dict[str, Any]]:
    """Generate unique questions based on topic and seed"""
    questions = [
        {
            "question": f"What is the capital of {topic}?",
            "answers": [
                {"text": "Option A", "correct": False},
                {"text": "Option B", "correct": True},
                {"text": "Option C", "correct": False},
                {"text": "Option D", "correct": False}
            ]
        },
        {
            "question": f"Which is the largest city in {topic}?",
            "answers": [
                {"text": "City A", "correct": False},
                {"text": "City B", "correct": True},
                {"text": "City C", "correct": False},
                {"text": "City D", "correct": False}
            ]
        }
    ]
    
    # Use seed to select different questions
    if seed:
        seed_int = int(seed[:8], 16) if len(seed) >= 8 else 0
        start_index = seed_int % len(questions)
    else:
        start_index = 0
    
    return questions[start_index:start_index + num_questions]

def generate_unique_seed(user_id: int, topic: str) -> str:
    """Generate unique seed for question generation"""
    timestamp = time.time()
    seed_string = f"{user_id}_{topic}_{timestamp}"
    return hashlib.md5(seed_string.encode()).hexdigest()

@app.get("/", response_class=HTMLResponse)
def home(request):
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Quiz App</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
        <div class="container mt-5">
            <div class="text-center">
                <h1>Welcome to the Quiz App!</h1>
                <p class="lead">AI-powered quiz generation with unique questions for each user.</p>
                <a href="/docs" class="btn btn-primary">View API Docs</a>
            </div>
        </div>
    </body>
    </html>
    """

@app.post("/generate-quiz")
def generate_quiz(topic: str, num_questions: int = 5, tenant_id: str = "default", db: Session = Depends(get_db)):
    """Generate a unique quiz for the user"""
    # Generate unique seed
    user_id = 1  # For demo purposes
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
        "message": "Unique quiz generated successfully!"
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
            "seed": quiz.question_seed
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
    return {"status": "healthy", "message": "Server is running!"} 