from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    tenant_id: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    tenant_id: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    tenant_id: Optional[str] = None

class TopicBase(BaseModel):
    tenant_id: str
    name: str
    description: Optional[str] = None

class TopicCreate(TopicBase):
    pass

class Topic(TopicBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class QuizBase(BaseModel):
    tenant_id: str
    topic_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    is_ai_generated: bool = True
    ai_prompt: Optional[str] = None
    difficulty: str = "medium"  # New field
    num_questions: int = 5       # New field

class QuizCreate(QuizBase):
    pass

class Quiz(QuizBase):
    id: int
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    quiz_id: int
    question_text: str
    correct_answer: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: int

    class Config:
        from_attributes = True

class QuizResultBase(BaseModel):
    tenant_id: str
    quiz_id: int
    user_id: int
    score: int
    total_questions: int
    user_answers: Dict[str, Any]

class QuizResultCreate(QuizResultBase):
    pass

class QuizResult(QuizResultBase):
    id: int
    completed_at: datetime

    class Config:
        from_attributes = True

class AIQuizRequest(BaseModel):
    tenant_id: str
    topic_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    difficulty: str = "medium"
    num_questions: int = 5

class QuizSubmission(BaseModel):
    tenant_id: str
    quiz_id: int
    user_answers: Dict[str, int]  # question_id: answer_id 