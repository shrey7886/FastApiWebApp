#!/usr/bin/env python3
"""
Simplified Quiz Application for Frontend-Backend Connection Testing
Basic FastAPI application with essential endpoints
"""

from fastapi import FastAPI, Depends, HTTPException, Body, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json
import uuid
from typing import Dict, List, Optional, Any

# Import our modules
import models
import schemas
from database import get_db, engine
from auth import get_current_user, create_access_token, get_password_hash, verify_password

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Powered Quiz Application",
    description="Dynamic quiz generation with basic functionality",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "AI Quiz Generator API is running",
        "version": "1.0.0",
        "features": [
            "Basic Quiz Generation",
            "User Authentication",
            "Quiz Management"
        ]
    }

@app.post("/signup", response_model=Dict[str, Any])
def signup(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """User registration endpoint"""
    try:
        # Check if user already exists in this tenant
        existing_user = db.query(models.User).filter(
            models.User.email == user_data.email,
            models.User.tenant_id == user_data.tenant_id
        ).first()
        
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists in this tenant")
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        db_user = models.User(
            email=user_data.email,
            hashed_password=hashed_password,
            tenant_id=user_data.tenant_id,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            created_at=datetime.utcnow()
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create access token
        access_token = create_access_token(data={"sub": db_user.email})
        
        return {
            "message": "User created successfully",
            "user": {
                "id": db_user.id,
                "email": db_user.email,
                "first_name": db_user.first_name,
                "last_name": db_user.last_name,
                "tenant_id": db_user.tenant_id
            },
            "access_token": access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login", response_model=Dict[str, Any])
def login(
    user_data: schemas.UserLogin,
    db: Session = Depends(get_db)
):
    """User login endpoint"""
    try:
        # Find user by email and tenant
        user = db.query(models.User).filter(
            models.User.email == user_data.email,
            models.User.tenant_id == user_data.tenant_id
        ).first()
        
        if not user or not verify_password(user_data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Create access token
        access_token = create_access_token(data={"sub": user.email})
        
        return {
            "message": "Login successful",
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "tenant_id": user.tenant_id
            },
            "access_token": access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-quiz")
def generate_quiz(
    topic: str = Body(...),
    difficulty: str = Body("medium"),
    num_questions: int = Body(5),
    duration: int = Body(10),
    tenant_id: str = Body(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Generate a quiz with mock questions for testing"""
    try:
        # Create mock questions for testing
        questions = []
        for i in range(num_questions):
            question = {
                "id": i + 1,
                "question": f"Sample question {i + 1} about {topic}?",
                "options": {
                    "A": f"Option A for question {i + 1}",
                    "B": f"Option B for question {i + 1}",
                    "C": f"Option C for question {i + 1}",
                    "D": f"Option D for question {i + 1}"
                },
                "correct_answer": "A",
                "explanation": f"This is the correct answer for question {i + 1}"
            }
            questions.append(question)
        
        # Create quiz record
        quiz = models.Quiz(
            title=f"Quiz on {topic}",
            topic=topic,
            difficulty=difficulty,
            num_questions=num_questions,
            duration=duration,
            questions=json.dumps(questions),
            tenant_id=tenant_id,
            created_by=current_user.id,
            created_at=datetime.utcnow()
        )
        
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        
        return {
            "message": "Quiz generated successfully",
            "quiz": {
                "id": quiz.id,
                "title": quiz.title,
                "topic": quiz.topic,
                "difficulty": quiz.difficulty,
                "num_questions": quiz.num_questions,
                "duration": quiz.duration,
                "questions": questions
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/quizzes/{quiz_id}")
def get_quiz(
    quiz_id: int,
    tenant_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get a specific quiz"""
    try:
        quiz = db.query(models.Quiz).filter(
            models.Quiz.id == quiz_id,
            models.Quiz.tenant_id == tenant_id
        ).first()
        
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        questions = json.loads(quiz.questions)
        
        return {
            "quiz": {
                "id": quiz.id,
                "title": quiz.title,
                "topic": quiz.topic,
                "difficulty": quiz.difficulty,
                "num_questions": quiz.num_questions,
                "duration": quiz.duration,
                "questions": questions
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/submit-quiz")
def submit_quiz(
    quiz_id: int = Body(...),
    tenant_id: str = Body(...),
    user_answers: Dict[str, str] = Body(...),
    time_taken: int = Body(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Submit quiz answers and get results"""
    try:
        # Get the quiz
        quiz = db.query(models.Quiz).filter(
            models.Quiz.id == quiz_id,
            models.Quiz.tenant_id == tenant_id
        ).first()
        
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        questions = json.loads(quiz.questions)
        
        # Calculate score
        correct_answers = 0
        total_questions = len(questions)
        
        for question in questions:
            question_id = str(question["id"])
            if question_id in user_answers:
                if user_answers[question_id] == question["correct_answer"]:
                    correct_answers += 1
        
        score = correct_answers
        percentage = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
        
        # Create quiz result
        result = models.QuizResult(
            quiz_id=quiz_id,
            user_id=current_user.id,
            score=score,
            total_questions=total_questions,
            percentage=percentage,
            time_taken=time_taken,
            answers=json.dumps(user_answers),
            tenant_id=tenant_id,
            completed_at=datetime.utcnow()
        )
        
        db.add(result)
        db.commit()
        db.refresh(result)
        
        return {
            "message": "Quiz submitted successfully",
            "result": {
                "id": result.id,
                "score": result.score,
                "total_questions": result.total_questions,
                "percentage": result.percentage,
                "time_taken": result.time_taken,
                "feedback": f"You got {correct_answers} out of {total_questions} questions correct!"
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/quiz-history")
def get_quiz_history(
    tenant_id: str = Query(...),
    limit: int = Query(20),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get user's quiz history"""
    try:
        results = db.query(models.QuizResult).filter(
            models.QuizResult.user_id == current_user.id,
            models.QuizResult.tenant_id == tenant_id
        ).order_by(models.QuizResult.completed_at.desc()).limit(limit).all()
        
        history = []
        for result in results:
            quiz = db.query(models.Quiz).filter(models.Quiz.id == result.quiz_id).first()
            if quiz:
                history.append({
                    "id": result.id,
                    "quiz_title": quiz.title,
                    "topic": quiz.topic,
                    "score": result.score,
                    "total_questions": result.total_questions,
                    "percentage": result.percentage,
                    "time_taken": result.time_taken,
                    "completed_at": result.completed_at.isoformat()
                })
        
        return {
            "history": history,
            "total": len(history)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001) 