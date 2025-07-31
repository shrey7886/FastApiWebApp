#!/usr/bin/env python3
"""
Enhanced Quiz Application with RAG Chatbot, Analytics, and Progress Tracking
Production-ready FastAPI application for dynamic quiz generation and learning
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
from ai_service import generate_quiz_questions, generate_unique_seed
from simple_chatbot_service import SimpleChatbotService
from analytics_service import AnalyticsService

# Create database tables
try:
    models.Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")
except Exception as e:
    print(f"⚠️ Database tables may already exist: {e}")
    # Continue anyway as tables might already be created

app = FastAPI(
    title="AI-Powered Quiz Application",
    description="Dynamic quiz generation with RAG chatbot, analytics, and progress tracking",
    version="2.0.0"
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
        "message": "Quizlet AI Quiz Generator API is running",
        "version": "2.0.0",
        "features": [
            "Dynamic Quiz Generation",
            "RAG-powered Chatbot",
            "Analytics & Progress Tracking",
            "Multitenancy Support",
            "AI-powered Question Generation"
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
        
        # Create initial progress tracking
        progress = models.ProgressTracking(
            user_id=db_user.id,
            date=datetime.utcnow(),
            current_streak=0,
            longest_streak=0
        )
        db.add(progress)
        db.commit()
        
        return {
            "success": True,
            "message": "User registered successfully",
            "user": {
                "id": db_user.id,
                "email": db_user.email,
                "first_name": db_user.first_name,
                "last_name": db_user.last_name,
                "tenant_id": db_user.tenant_id
            }
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
        user = db.query(models.User).filter(
            models.User.email == user_data.email,
            models.User.tenant_id == user_data.tenant_id
        ).first()
        
        if not user or not verify_password(user_data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        if not user.is_active:
            raise HTTPException(status_code=401, detail="User account is deactivated")
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id, "tenant_id": user.tenant_id}
        )
        
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "tenant_id": user.tenant_id
            }
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
    """Generate a quiz with AI, avoiding duplicate questions"""
    # Ensure user belongs to the specified tenant
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Access denied: User does not belong to this tenant")
    
    try:
        print(f"🎯 API: Generating quiz for topic: '{topic}' for tenant: {tenant_id}")
        print(f"🎯 API: Current user: {current_user.email}, tenant: {current_user.tenant_id}")
        
        # Generate unique seed for this quiz
        seed = generate_unique_seed(topic, current_user.id, tenant_id)
        print(f"🎯 API: Generated seed: {seed}")
        
        # Get or create topic (tenant-specific)
        print(f"🎯 API: Processing topic: '{topic}' for tenant: {tenant_id}")
        db_topic = db.query(models.Topic).filter(
            models.Topic.name == topic,
            models.Topic.tenant_id == tenant_id
        ).first()
        
        if not db_topic:
            print(f"📝 API: Creating new topic: {topic}")
            db_topic = models.Topic(
                tenant_id=tenant_id,
                name=topic,
                description=f"Dynamic topic: {topic}",
                is_active=True,
                category="Dynamic",
                difficulty_level=difficulty
            )
            db.add(db_topic)
            db.commit()
            db.refresh(db_topic)
            print(f"📝 API: Created new topic: {topic} with ID: {db_topic.id}")
        else:
            print(f"📝 API: Using existing topic: {topic} with ID: {db_topic.id}")
        
        # Get user's answered questions to avoid duplicates
        answered_question_ids = set()
        user_answered_questions = db.query(models.UserQuestionHistory).filter(
            models.UserQuestionHistory.user_id == current_user.id,
            models.UserQuestionHistory.tenant_id == tenant_id
        ).all()
        
        for qh in user_answered_questions:
            answered_question_ids.add(qh.question_id)
        
        print(f"📝 API: User has answered {len(answered_question_ids)} questions previously")
        
        # Get available questions for this topic (excluding answered ones)
        available_questions = db.query(models.Question).join(models.Quiz).filter(
            models.Quiz.topic_id == db_topic.id,
            models.Quiz.tenant_id == tenant_id,
            ~models.Question.id.in_(answered_question_ids) if answered_question_ids else True
        ).all()
        
        print(f"📝 API: Found {len(available_questions)} available questions for topic: {topic}")
        
        # If we have enough available questions, use them
        if len(available_questions) >= num_questions:
            print(f"📝 API: Using existing questions from database")
            selected_questions = available_questions[:num_questions]
            questions_data = []
            
            for question in selected_questions:
                questions_data.append({
                    "question": question.question_text,
                    "answers": [
                        {"text": question.option_a, "correct": question.option_a == question.correct_answer},
                        {"text": question.option_b, "correct": question.option_b == question.correct_answer},
                        {"text": question.option_c, "correct": question.option_c == question.correct_answer},
                        {"text": question.option_d, "correct": question.option_d == question.correct_answer}
                    ],
                    "explanation": question.explanation
                })
            
            model_used = "Database"
        else:
            # Generate new questions using AI
            print(f"🤖 API: Generating {num_questions} questions...")
            questions_data = generate_quiz_questions(topic, num_questions, difficulty, current_user.id, seed)
            
            if not questions_data:
                print(f"❌ API: Failed to generate questions")
                raise HTTPException(status_code=500, detail="Failed to generate questions for this topic")
            
            print(f"✅ API: Generated {len(questions_data)} questions")
            model_used = "Llama3"  # Default to Llama3, will be updated based on actual model used
        
        # Create quiz (tenant-specific)
        print(f"📝 API: Creating quiz...")
        quiz = models.Quiz(
            tenant_id=tenant_id,
            topic_id=db_topic.id,
            title=f"Quiz about {topic}",
            description=f"AI-generated quiz about {topic}",
            is_ai_generated=True,
            ai_prompt=f"Dynamic topic: {topic}",
            difficulty=difficulty,
            num_questions=num_questions,
            duration=duration,
            question_seed=seed
        )
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        print(f"📝 API: Created quiz with ID: {quiz.id}")
        
        # Create questions in database (if they're new)
        if model_used != "Database":
            print(f"📝 API: Creating questions in database...")
            for i, q in enumerate(questions_data):
                correct_answer = next((a['text'] for a in q['answers'] if a['correct']), None)
                db_question = models.Question(
                    quiz_id=quiz.id,
                    question_text=q['question'],
                    correct_answer=correct_answer,
                    option_a=q['answers'][0]['text'],
                    option_b=q['answers'][1]['text'],
                    option_c=q['answers'][2]['text'],
                    option_d=q['answers'][3]['text'],
                    explanation=q.get('explanation', ''),
                    difficulty_level=difficulty,
                    category=db_topic.category
                )
                db.add(db_question)
                print(f"📝 API: Added question {i+1}")
            
            db.commit()
            print(f"✅ API: Successfully committed all questions to database")
        
        # Format questions for response
        formatted_questions = []
        for q in questions_data:
            formatted_questions.append({
                "question": q['question'],
                "answers": q['answers']
            })
        
        response_data = {
            "success": True, 
            "id": quiz.id,
            "topic": topic,
            "questions": formatted_questions,
            "questions_generated": len(questions_data),
            "model_used": model_used,
            "duration": duration,
            "difficulty": difficulty,
            "tenant_id": tenant_id,
            "unique_questions": True,  # Indicates these are unique for the user
            "available_questions_remaining": len(available_questions) - len(questions_data) if model_used == "Database" else "Unlimited"
        }
        
        print(f"✅ API: Successfully created quiz with {len(questions_data)} questions for topic: '{topic}' for tenant: {tenant_id}")
        return response_data
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"❌ API: Error generating quiz: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")

@app.get("/quizzes/{quiz_id}")
def get_quiz(
    quiz_id: int,
    tenant_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get a specific quiz with questions"""
    # Ensure user belongs to the specified tenant
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Access denied: User does not belong to this tenant")
    
    # Get quiz with tenant isolation
    quiz = db.query(models.Quiz).filter(
        models.Quiz.id == quiz_id,
        models.Quiz.tenant_id == tenant_id,
        models.Quiz.is_active == True
    ).first()
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Get questions for this quiz
    questions = db.query(models.Question).filter(
        models.Question.quiz_id == quiz_id
    ).all()
    
    # Format questions for frontend
    formatted_questions = []
    for q in questions:
        formatted_questions.append({
            "id": q.id,
            "question": q.question_text,
            "options": [
                {"id": "A", "text": q.option_a},
                {"id": "B", "text": q.option_b},
                {"id": "C", "text": q.option_c},
                {"id": "D", "text": q.option_d}
            ],
            "correct_answer": q.correct_answer,
            "explanation": q.explanation
        })
    
    return {
        "quiz_id": quiz.id,
        "title": quiz.title,
        "description": quiz.description,
        "difficulty": quiz.difficulty,
        "duration": quiz.duration,
        "questions": formatted_questions,
        "tenant_id": tenant_id
    }

@app.post("/start-quiz-session")
def start_quiz_session(
    quiz_id: int = Body(...),
    tenant_id: str = Body(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Start a quiz session with timer tracking"""
    # Ensure user belongs to the specified tenant
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Access denied: User does not belong to this tenant")
    
    # Get quiz with tenant isolation
    quiz = db.query(models.Quiz).filter(
        models.Quiz.id == quiz_id,
        models.Quiz.tenant_id == tenant_id,
        models.Quiz.is_active == True
    ).first()
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Check if user already has an active session for this quiz
    existing_session = db.query(models.QuizSession).filter(
        models.QuizSession.quiz_id == quiz_id,
        models.QuizSession.user_id == current_user.id,
        models.QuizSession.status == "active"
    ).first()
    
    if existing_session:
        # Return existing session
        return {
            "success": True,
            "session_id": existing_session.id,
            "quiz_id": quiz_id,
            "duration_minutes": quiz.duration,
            "total_questions": quiz.num_questions,
            "start_time": existing_session.start_time.isoformat(),
            "end_time": existing_session.end_time.isoformat(),
            "time_remaining_seconds": int((existing_session.end_time - datetime.utcnow()).total_seconds())
        }
    
    # Create new session
    start_time = datetime.utcnow()
    end_time = start_time + timedelta(minutes=quiz.duration)
    
    quiz_session = models.QuizSession(
        quiz_id=quiz_id,
        user_id=current_user.id,
        tenant_id=tenant_id,
        start_time=start_time,
        end_time=end_time,
        status="active",
        time_limit_minutes=quiz.duration
    )
    
    db.add(quiz_session)
    db.commit()
    db.refresh(quiz_session)
    
    return {
        "success": True,
        "session_id": quiz_session.id,
        "quiz_id": quiz_id,
        "duration_minutes": quiz.duration,
        "total_questions": quiz.num_questions,
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "time_remaining_seconds": quiz.duration * 60
    }

@app.get("/quiz-session/{session_id}/status")
def get_quiz_session_status(
    session_id: int,
    tenant_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get quiz session status and time remaining"""
    # Ensure user belongs to the specified tenant
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Access denied: User does not belong to this tenant")
    
    # Get session
    session = db.query(models.QuizSession).filter(
        models.QuizSession.id == session_id,
        models.QuizSession.user_id == current_user.id,
        models.QuizSession.tenant_id == tenant_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Quiz session not found")
    
    # Check if session has expired
    current_time = datetime.utcnow()
    time_remaining = int((session.end_time - current_time).total_seconds())
    
    if time_remaining <= 0 and session.status == "active":
        # Auto-submit expired session
        session.status = "expired"
        db.commit()
        return {
            "success": True,
            "session_id": session_id,
            "status": "expired",
            "time_remaining_seconds": 0,
            "message": "Quiz time has expired"
        }
    
    return {
        "success": True,
        "session_id": session_id,
        "status": session.status,
        "time_remaining_seconds": max(0, time_remaining),
        "start_time": session.start_time.isoformat(),
        "end_time": session.end_time.isoformat()
    }

@app.post("/submit-quiz")
def submit_quiz(
    quiz_id: int = Body(...),
    session_id: int = Body(...),
    tenant_id: str = Body(...),
    user_answers: Dict[str, str] = Body(...),
    time_taken: int = Body(...),
    question_times: Dict[str, int] = Body({}),  # Time spent on each question
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Submit quiz answers with enhanced validation and question tracking"""
    # Ensure user belongs to the specified tenant
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Access denied: User does not belong to this tenant")
    
    # Get quiz session
    session = db.query(models.QuizSession).filter(
        models.QuizSession.id == session_id,
        models.QuizSession.quiz_id == quiz_id,
        models.QuizSession.user_id == current_user.id,
        models.QuizSession.tenant_id == tenant_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Quiz session not found")
    
    # Check if session is still active
    if session.status != "active":
        raise HTTPException(status_code=400, detail="Quiz session is not active")
    
    # Check if time has expired
    current_time = datetime.utcnow()
    if current_time > session.end_time:
        session.status = "expired"
        db.commit()
        raise HTTPException(status_code=400, detail="Quiz time has expired")
    
    # Get quiz
    quiz = db.query(models.Quiz).filter(
        models.Quiz.id == quiz_id,
        models.Quiz.tenant_id == tenant_id,
        models.Quiz.is_active == True
    ).first()
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Get questions for this quiz
    questions = db.query(models.Question).filter(
        models.Question.quiz_id == quiz_id
    ).all()
    
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this quiz")
    
    # Validate that all questions are answered
    total_questions = len(questions)
    answered_questions = len([q for q in questions if str(q.id) in user_answers and user_answers[str(q.id)]])
    
    if answered_questions < total_questions:
        raise HTTPException(
            status_code=400, 
            detail=f"You must answer all {total_questions} questions. You have answered {answered_questions} questions."
        )
    
    # Calculate score and track answered questions
    correct_answers = 0
    question_analysis = []
    
    for question in questions:
        user_answer = user_answers.get(str(question.id), "")
        is_correct = user_answer == question.correct_answer
        question_time = question_times.get(str(question.id), 0)
        
        if is_correct:
            correct_answers += 1
        
        # Track this answered question
        question_history = models.UserQuestionHistory(
            user_id=current_user.id,
            question_id=question.id,
            tenant_id=tenant_id,
            question_text=question.question_text,
            topic_name=quiz.topic.name if quiz.topic else "Unknown",
            difficulty_level=question.difficulty_level,
            user_answer=user_answer,
            correct_answer=question.correct_answer,
            is_correct=is_correct,
            time_taken_seconds=question_time,
            quiz_id=quiz_id,
            quiz_session_id=session_id,
            answered_at=current_time
        )
        db.add(question_history)
        
        question_analysis.append({
            "question_id": question.id,
            "user_answer": user_answer,
            "correct_answer": question.correct_answer,
            "is_correct": is_correct,
            "explanation": question.explanation,
            "time_taken": question_time
        })
    
    # Calculate percentage and grade
    percentage = (correct_answers / total_questions) * 100
    grade = "A" if percentage >= 90 else "B" if percentage >= 80 else "C" if percentage >= 70 else "D" if percentage >= 60 else "F"
    
    # Update session status
    session.status = "completed"
    session.completed_at = current_time
    session.actual_time_taken = time_taken
    
    # Create quiz result
    quiz_result = models.QuizResult(
        tenant_id=tenant_id,
        quiz_id=quiz_id,
        user_id=current_user.id,
        score=correct_answers,
        total_questions=total_questions,
        percentage=percentage,
        grade=grade,
        time_taken=time_taken,
        user_answers=json.dumps(user_answers),
        correct_answers=json.dumps({str(q.id): q.correct_answer for q in questions}),
        questions_analysis=json.dumps(question_analysis),
        completed_at=current_time,
        session_id=session_id
    )
    
    db.add(quiz_result)
    
    # Update user analytics
    current_user.total_quizzes_taken += 1
    current_user.total_questions_answered += total_questions
    current_user.total_correct_answers += correct_answers
    current_user.last_quiz_date = current_time
    
    # Calculate new average score
    if current_user.total_quizzes_taken > 0:
        current_user.average_score = current_user.total_correct_answers / current_user.total_questions_answered * 100
    
    # Update best score
    if percentage > current_user.best_score:
        current_user.best_score = percentage
    
    # Update quiz analytics
    quiz.total_attempts += 1
    quiz.average_score = ((quiz.average_score * (quiz.total_attempts - 1)) + percentage) / quiz.total_attempts
    
    db.commit()
    
    return {
        "success": True,
        "quiz_id": quiz_id,
        "session_id": session_id,
        "score": correct_answers,
        "total_questions": total_questions,
        "percentage": percentage,
        "grade": grade,
        "time_taken": time_taken,
        "time_limit": quiz.duration * 60,
        "questions_answered": answered_questions,
        "question_analysis": question_analysis,
        "tenant_id": tenant_id,
        "questions_tracked": True  # Indicates questions were tracked for future avoidance
    }

def _generate_feedback(self, percentage: float, score: int, total_questions: int) -> str:
    """Generate personalized feedback based on performance"""
    if percentage >= 90:
        return "Excellent work! You have a strong understanding of this topic."
    elif percentage >= 80:
        return "Great job! You're doing well, but there's room for improvement."
    elif percentage >= 70:
        return "Good effort! Review the incorrect answers to strengthen your knowledge."
    elif percentage >= 60:
        return "You're on the right track. Focus on understanding the concepts better."
    else:
        return "Keep practicing! Review the material and try again to improve your understanding."

@app.get("/analytics/user")
def get_user_analytics(
    tenant_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get comprehensive user analytics with progress tracking"""
    # Ensure user belongs to the specified tenant
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Access denied: User does not belong to this tenant")
    
    try:
        # Get user's quiz results (tenant-isolated)
        quiz_results = db.query(models.QuizResult).filter(
            models.QuizResult.user_id == current_user.id,
            models.QuizResult.tenant_id == tenant_id
        ).order_by(models.QuizResult.completed_at.desc()).all()
        
        # Get user's answered questions for tracking
        answered_questions = db.query(models.UserQuestionHistory).filter(
            models.UserQuestionHistory.user_id == current_user.id,
            models.UserQuestionHistory.tenant_id == tenant_id
        ).all()
        
        # Calculate detailed analytics
        total_quizzes = len(quiz_results)
        total_questions_answered = len(answered_questions)
        correct_answers = sum(1 for q in answered_questions if q.is_correct)
        
        # Performance by topic
        topic_performance = {}
        for result in quiz_results:
            quiz = db.query(models.Quiz).filter(models.Quiz.id == result.quiz_id).first()
            if quiz:
                topic = db.query(models.Topic).filter(models.Topic.id == quiz.topic_id).first()
                if topic:
                    topic_name = topic.name
                    if topic_name not in topic_performance:
                        topic_performance[topic_name] = {
                            'total_quizzes': 0,
                            'total_questions': 0,
                            'correct_answers': 0,
                            'average_score': 0,
                            'best_score': 0,
                            'weakest_areas': []
                        }
                    
                    topic_performance[topic_name]['total_quizzes'] += 1
                    topic_performance[topic_name]['total_questions'] += result.total_questions
                    topic_performance[topic_name]['correct_answers'] += result.score
                    
                    # Update best score
                    if result.percentage > topic_performance[topic_name]['best_score']:
                        topic_performance[topic_name]['best_score'] = result.percentage
        
        # Calculate averages
        for topic in topic_performance.values():
            if topic['total_questions'] > 0:
                topic['average_score'] = (topic['correct_answers'] / topic['total_questions']) * 100
        
        # Performance by difficulty
        difficulty_performance = {
            'easy': {'total': 0, 'correct': 0, 'average': 0},
            'medium': {'total': 0, 'correct': 0, 'average': 0},
            'hard': {'total': 0, 'correct': 0, 'average': 0}
        }
        
        for question in answered_questions:
            difficulty = question.difficulty_level or 'medium'
            if difficulty in difficulty_performance:
                difficulty_performance[difficulty]['total'] += 1
                if question.is_correct:
                    difficulty_performance[difficulty]['correct'] += 1
        
        # Calculate difficulty averages
        for diff in difficulty_performance.values():
            if diff['total'] > 0:
                diff['average'] = (diff['correct'] / diff['total']) * 100
        
        # Recent performance trend (last 10 quizzes)
        recent_results = quiz_results[:10]
        recent_scores = [r.percentage for r in recent_results]
        performance_trend = "improving" if len(recent_scores) >= 2 and recent_scores[0] > recent_scores[-1] else "stable"
        
        # Weakest areas (topics with lowest scores)
        weakest_topics = sorted(
            [(topic, data['average_score']) for topic, data in topic_performance.items()],
            key=lambda x: x[1]
        )[:3]
        
        # Time analysis
        time_analysis = {
            'average_time_per_question': 0,
            'fastest_quiz': None,
            'slowest_quiz': None
        }
        
        if quiz_results:
            total_time = sum(r.time_taken for r in quiz_results)
            total_questions = sum(r.total_questions for r in quiz_results)
            if total_questions > 0:
                time_analysis['average_time_per_question'] = total_time / total_questions
            
            fastest_quiz = min(quiz_results, key=lambda x: x.time_taken)
            slowest_quiz = max(quiz_results, key=lambda x: x.time_taken)
            
            time_analysis['fastest_quiz'] = {
                'quiz_id': fastest_quiz.quiz_id,
                'time_taken': fastest_quiz.time_taken,
                'score': fastest_quiz.percentage
            }
            time_analysis['slowest_quiz'] = {
                'quiz_id': slowest_quiz.quiz_id,
                'time_taken': slowest_quiz.time_taken,
                'score': slowest_quiz.percentage
            }
        
        return {
            "success": True,
            "user_id": current_user.id,
            "tenant_id": tenant_id,
            "overall_stats": {
                "total_quizzes_taken": total_quizzes,
                "total_questions_answered": total_questions_answered,
                "total_correct_answers": correct_answers,
                "overall_accuracy": (correct_answers / total_questions_answered * 100) if total_questions_answered > 0 else 0,
                "average_score": current_user.average_score,
                "best_score": current_user.best_score,
                "performance_trend": performance_trend
            },
            "topic_performance": topic_performance,
            "difficulty_performance": difficulty_performance,
            "weakest_areas": [topic for topic, score in weakest_topics],
            "time_analysis": time_analysis,
            "recent_performance": {
                "last_10_scores": recent_scores,
                "improvement_rate": ((recent_scores[0] - recent_scores[-1]) / len(recent_scores)) if len(recent_scores) >= 2 else 0
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/progress")
def get_progress_data(
    days: int = Query(30),
    tenant_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get detailed progress tracking over time"""
    # Ensure user belongs to the specified tenant
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Access denied: User does not belong to this tenant")
    
    try:
        from datetime import datetime, timedelta
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get quiz results in date range
        quiz_results = db.query(models.QuizResult).filter(
            models.QuizResult.user_id == current_user.id,
            models.QuizResult.tenant_id == tenant_id,
            models.QuizResult.completed_at >= start_date,
            models.QuizResult.completed_at <= end_date
        ).order_by(models.QuizResult.completed_at.asc()).all()
        
        # Group by date
        daily_progress = {}
        for result in quiz_results:
            date_key = result.completed_at.date().isoformat()
            if date_key not in daily_progress:
                daily_progress[date_key] = {
                    'quizzes_taken': 0,
                    'questions_answered': 0,
                    'correct_answers': 0,
                    'average_score': 0,
                    'total_time': 0
                }
            
            daily_progress[date_key]['quizzes_taken'] += 1
            daily_progress[date_key]['questions_answered'] += result.total_questions
            daily_progress[date_key]['correct_answers'] += result.score
            daily_progress[date_key]['total_time'] += result.time_taken
        
        # Calculate daily averages
        for date_data in daily_progress.values():
            if date_data['questions_answered'] > 0:
                date_data['average_score'] = (date_data['correct_answers'] / date_data['questions_answered']) * 100
        
        # Get question history for detailed analysis
        question_history = db.query(models.UserQuestionHistory).filter(
            models.UserQuestionHistory.user_id == current_user.id,
            models.UserQuestionHistory.tenant_id == tenant_id,
            models.UserQuestionHistory.answered_at >= start_date,
            models.UserQuestionHistory.answered_at <= end_date
        ).all()
        
        # Analyze question patterns
        question_patterns = {
            'most_missed_questions': [],
            'improvement_areas': [],
            'strengths': []
        }
        
        # Group questions by topic and difficulty
        question_groups = {}
        for qh in question_history:
            key = f"{qh.topic_name}_{qh.difficulty_level}"
            if key not in question_groups:
                question_groups[key] = {'total': 0, 'correct': 0}
            question_groups[key]['total'] += 1
            if qh.is_correct:
                question_groups[key]['correct'] += 1
        
        # Identify strengths and weaknesses
        for group_key, stats in question_groups.items():
            accuracy = (stats['correct'] / stats['total']) * 100
            topic, difficulty = group_key.split('_', 1)
            
            if accuracy < 60:
                question_patterns['improvement_areas'].append({
                    'topic': topic,
                    'difficulty': difficulty,
                    'accuracy': accuracy,
                    'total_questions': stats['total']
                })
            elif accuracy > 80:
                question_patterns['strengths'].append({
                    'topic': topic,
                    'difficulty': difficulty,
                    'accuracy': accuracy,
                    'total_questions': stats['total']
                })
        
        return {
            "success": True,
            "period": f"Last {days} days",
            "daily_progress": daily_progress,
            "question_patterns": question_patterns,
            "summary": {
                "total_quizzes": len(quiz_results),
                "total_questions": len(question_history),
                "average_daily_quizzes": len(quiz_results) / days if days > 0 else 0,
                "consistency_score": len(set(qr.completed_at.date() for qr in quiz_results)) / days if days > 0 else 0
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Temporarily disabled chatbot endpoints due to langchain compatibility issues
# @app.post("/chatbot/chat")
# def chatbot_chat(
#     message: str = Body(...),
#     context: Optional[Dict] = Body(None),
#     tenant_id: str = Body(...),
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user)
# ):
#     """Chat with RAG-powered chatbot"""
#     try:
#         chatbot = RAGChatbotService(db, tenant_id)
#         
#         # Add user context
#         if context is None:
#             context = {}
#         context['user_id'] = current_user.id
#         context['tenant_id'] = tenant_id
#         
#         response = chatbot.get_response(message, context)
#         
#         return {
#             "success": True,
#             "response": response
#         }
#         
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# Temporarily disabled chatbot history endpoint
# @app.get("/chatbot/history")
# def get_chat_history(
#     limit: int = Query(10),
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user)
# ):
#     """Get chatbot conversation history"""
#     try:
#         chatbot = RAGChatbotService(db)
#         history = chatbot.get_chat_history(current_user.id, limit)
#         
#         return {
#             "success": True,
#             "history": history
#         }
#         
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# Temporarily disabled chatbot feedback endpoint
# @app.post("/chatbot/feedback")
# def chatbot_feedback(
#     interaction_id: int = Body(...),
#     satisfaction: int = Body(...),
#     was_helpful: bool = Body(...),
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user)
# ):
#     """Provide feedback for chatbot interaction"""
#     try:
#         chatbot = RAGChatbotService(db)
#         chatbot.update_satisfaction(interaction_id, satisfaction, was_helpful)
#         
#         return {
#             "success": True,
#             "message": "Feedback recorded successfully"
#         }
#         
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@app.get("/topics/available")
def get_available_topics(
    tenant_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get available topics"""
    try:
        topics = db.query(models.Topic).filter(
            models.Topic.tenant_id == tenant_id,
            models.Topic.is_active == True
        ).all()
        
        return {
            "success": True,
            "topics": [
                {
                    "id": topic.id,
                    "name": topic.name,
                    "description": topic.description,
                    "category": topic.category,
                    "difficulty_level": topic.difficulty_level,
                    "total_quizzes_created": topic.total_quizzes_created,
                    "popularity_score": topic.popularity_score
                }
                for topic in topics
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/topics/dynamic")
def create_dynamic_topic(
    topic_name: str = Body(...),
    tenant_id: str = Body(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new dynamic topic"""
    try:
        if not topic_name or not topic_name.strip():
            raise HTTPException(status_code=400, detail="Topic name is required")
        
        topic_name = topic_name.strip()
        
        existing_topic = db.query(models.Topic).filter(
            models.Topic.tenant_id == tenant_id,
            models.Topic.name == topic_name,
            models.Topic.is_active == True
        ).first()
        
        if existing_topic:
            return {
                "success": True,
                "topic_id": existing_topic.id,
                "topic_name": existing_topic.name,
                "message": "Topic already exists"
            }
        
        new_topic = models.Topic(
            tenant_id=tenant_id,
            name=topic_name,
            description=f"Dynamic topic: {topic_name}",
            is_active=True,
            category="Dynamic"
        )
        
        db.add(new_topic)
        db.commit()
        db.refresh(new_topic)
        
        return {
            "success": True,
            "topic_id": new_topic.id,
            "topic_name": new_topic.name,
            "message": "Topic created successfully"
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
    """Get user's quiz history (tenant-isolated)"""
    # Ensure user belongs to the specified tenant
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Access denied: User does not belong to this tenant")
    
    try:
        # Get user's quiz results with quiz and topic details
        results = db.query(models.QuizResult).join(models.Quiz).join(models.Topic).filter(
            models.QuizResult.user_id == current_user.id,
            models.QuizResult.tenant_id == tenant_id
        ).order_by(models.QuizResult.completed_at.desc()).limit(limit).all()
        
        history = []
        for result in results:
            quiz = result.quiz
            topic = quiz.topic if quiz else None
            
            history.append({
                "quiz_id": result.quiz_id,
                "topic": topic.name if topic else "Unknown",
                "score": result.score,
                "total_questions": result.total_questions,
                "percentage": result.percentage,
                "grade": result.grade,
                "time_taken": result.time_taken,
                "completed_at": result.completed_at.isoformat(),
                "quiz_title": quiz.title if quiz else "Unknown Quiz"
            })
        
        return {
            "success": True,
            "history": history,
            "total_count": len(history)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 