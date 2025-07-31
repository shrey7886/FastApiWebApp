from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    tenant_id = Column(String, index=True)  # Multitenancy
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    

    

    
    # Relationships
    quiz_results = relationship("QuizResult", back_populates="user")
    question_history = relationship("UserQuestionHistory", back_populates="user")
    quiz_sessions = relationship("QuizSession", back_populates="user")
    progress_tracking = relationship("ProgressTracking", back_populates="user")
    chatbot_interactions = relationship("ChatbotInteraction", back_populates="user")
    achievements = relationship("UserAchievement", back_populates="user")
    study_sessions = relationship("StudySession", back_populates="user")
    topic_mastery = relationship("TopicMastery", back_populates="user")

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, index=True)  # Multitenancy
    name = Column(String, index=True)
    description = Column(Text)
    category = Column(String, nullable=True)  # e.g., "Science", "History", "Technology"
    difficulty_level = Column(String, default="medium")  # easy, medium, hard
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Analytics
    total_quizzes_created = Column(Integer, default=0)
    average_difficulty_rating = Column(Float, default=0.0)
    popularity_score = Column(Float, default=0.0)

    # Relationships
    quizzes = relationship("Quiz", back_populates="topic")

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, index=True)  # Multitenancy
    topic_id = Column(Integer, ForeignKey("topics.id"))
    title = Column(String, index=True)
    description = Column(Text)
    is_ai_generated = Column(Boolean, default=True)
    ai_prompt = Column(Text)  # Store the AI prompt used
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    difficulty = Column(String, default="medium")  # easy, medium, hard
    num_questions = Column(Integer, default=5)
    duration = Column(Integer, default=10)  # in minutes
    question_seed = Column(String, index=True)  # Unique seed for question generation
    
    # Analytics
    total_attempts = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    completion_rate = Column(Float, default=0.0)
    average_time_taken = Column(Float, default=0.0)  # in minutes

    # Relationships
    topic = relationship("Topic", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz")
    results = relationship("QuizResult", back_populates="quiz")

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
    explanation = Column(Text, nullable=True)  # Explanation for the correct answer
    difficulty_level = Column(String, default="medium")
    category = Column(String, nullable=True)
    tags = Column(JSON, nullable=True)  # Store tags as JSON array
    
    # Analytics
    times_asked = Column(Integer, default=0)
    times_correct = Column(Integer, default=0)
    average_time_to_answer = Column(Float, default=0.0)  # in seconds

    # Relationships
    quiz = relationship("Quiz", back_populates="questions")

class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, index=True)  # Multitenancy
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(Integer, ForeignKey("quiz_sessions.id"), nullable=True)  # Link to session
    score = Column(Integer)
    total_questions = Column(Integer)
    percentage = Column(Float)
    grade = Column(String)  # A, B, C, D, F
    time_taken = Column(Integer)  # in seconds
    user_answers = Column(Text)  # Store user's answers as JSON string
    correct_answers = Column(Text)  # Store correct answers as JSON string
    feedback = Column(Text, nullable=True)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    # Detailed analytics
    questions_analysis = Column(JSON, nullable=True)  # Detailed analysis of each question
    time_per_question = Column(JSON, nullable=True)  # Time spent on each question
    difficulty_breakdown = Column(JSON, nullable=True)  # Performance by difficulty

    # Relationships
    quiz = relationship("Quiz", back_populates="results")
    user = relationship("User", back_populates="quiz_results")
    session = relationship("QuizSession", back_populates="quiz_result")

    def get_user_answers(self):
        """Get user answers as dict"""
        if self.user_answers:
            return json.loads(self.user_answers)
        return {}

    def set_user_answers(self, answers):
        """Set user answers as JSON string"""
        self.user_answers = json.dumps(answers)

class ProgressTracking(Base):
    __tablename__ = "progress_tracking"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    
    # Daily progress metrics
    quizzes_taken = Column(Integer, default=0)
    questions_answered = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    study_time = Column(Integer, default=0)  # in minutes
    average_score = Column(Float, default=0.0)
    
    # Streak tracking
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    
    # Goals and achievements
    daily_goal_met = Column(Boolean, default=False)
    weekly_goal_met = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="progress_tracking")
    topic = relationship("Topic")

class ChatbotInteraction(Base):
    __tablename__ = "chatbot_interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=True)
    session_id = Column(String, index=True)
    
    # Interaction details
    user_message = Column(Text)
    bot_response = Column(Text)
    context = Column(JSON, nullable=True)  # Store context as JSON
    intent = Column(String, nullable=True)  # e.g., "question_explanation", "general_help"
    
    # Analytics
    response_time = Column(Float, nullable=True)  # in seconds
    user_satisfaction = Column(Integer, nullable=True)  # 1-5 rating
    was_helpful = Column(Boolean, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="chatbot_interactions")
    quiz = relationship("Quiz")
    question = relationship("Question")

class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_type = Column(String)  # e.g., "first_quiz", "perfect_score", "streak_7_days"
    achievement_name = Column(String)
    achievement_description = Column(Text)
    points_earned = Column(Integer, default=0)
    unlocked_at = Column(DateTime, default=datetime.utcnow)
    
    # Achievement metadata
    achievement_metadata = Column(JSON, nullable=True)  # Additional achievement data
    
    # Relationships
    user = relationship("User", back_populates="achievements")

class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    session_type = Column(String)  # "quiz", "review", "practice"
    
    # Session details
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration = Column(Integer, default=0)  # in minutes
    
    # Session metrics
    questions_answered = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    accuracy = Column(Float, default=0.0)
    
    # Session context
    notes = Column(Text, nullable=True)
    tags = Column(JSON, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="study_sessions")
    topic = relationship("Topic")

class TopicMastery(Base):
    __tablename__ = "topic_mastery"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic_id = Column(Integer, ForeignKey("topics.id"))
    
    # Mastery metrics
    mastery_level = Column(Float, default=0.0)  # 0.0 to 1.0
    quizzes_taken = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    
    # Progress tracking
    last_quiz_date = Column(DateTime, nullable=True)
    improvement_rate = Column(Float, default=0.0)
    
    # Mastery badges
    current_badge = Column(String, default="beginner")  # beginner, intermediate, advanced, expert
    badges_earned = Column(JSON, nullable=True)  # Array of earned badges
    
    # Relationships
    user = relationship("User", back_populates="topic_mastery")
    topic = relationship("Topic") 

class QuizSession(Base):
    __tablename__ = "quiz_sessions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    tenant_id = Column(String, index=True)  # Multitenancy
    
    # Session timing
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime)  # Calculated end time based on duration
    completed_at = Column(DateTime, nullable=True)  # When user actually completed
    actual_time_taken = Column(Integer, nullable=True)  # Actual time taken in seconds
    
    # Session status
    status = Column(String, default="active")  # active, completed, expired, abandoned
    time_limit_minutes = Column(Integer)  # Quiz duration in minutes
    
    # Session metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Analytics
    questions_answered = Column(Integer, default=0)
    last_activity = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    quiz = relationship("Quiz")
    user = relationship("User", back_populates="quiz_sessions")
    quiz_result = relationship("QuizResult", back_populates="session", uselist=False) 

class UserQuestionHistory(Base):
    __tablename__ = "user_question_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    tenant_id = Column(String, index=True)  # Multitenancy
    
    # Question details for tracking
    question_text = Column(Text)  # Store question text for reference
    topic_name = Column(String)  # Store topic name for analytics
    difficulty_level = Column(String)  # Store difficulty for analytics
    
    # User's answer
    user_answer = Column(String)  # A, B, C, D
    correct_answer = Column(String)  # The correct answer
    is_correct = Column(Boolean)
    
    # Timing and context
    time_taken_seconds = Column(Integer, default=0)  # Time spent on this question
    answered_at = Column(DateTime, default=datetime.utcnow)
    
    # Quiz context
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    quiz_session_id = Column(Integer, ForeignKey("quiz_sessions.id"), nullable=True)
    
    # Analytics
    confidence_level = Column(Float, nullable=True)  # User's confidence (if provided)
    explanation_reviewed = Column(Boolean, default=False)  # Whether user reviewed explanation
    
    # Relationships
    user = relationship("User", back_populates="question_history")
    question = relationship("Question")
    quiz = relationship("Quiz")
    quiz_session = relationship("QuizSession") 