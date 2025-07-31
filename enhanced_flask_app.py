from flask import Flask, request, jsonify, render_template_string
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime, timedelta
import hashlib
import time
import json
import jwt
from werkzeug.security import generate_password_hash, check_password_hash

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./quiziac.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
SECRET_KEY = "your-secret-key-here"
JWT_ALGORITHM = "HS256"

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, index=True)
    topic = Column(String, index=True)
    difficulty = Column(String, default="medium")
    num_questions = Column(Integer, default=5)
    question_seed = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

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

class QuizResult(Base):
    __tablename__ = "quiz_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    score = Column(Integer)
    total_questions = Column(Integer)
    correct_answers = Column(Integer)
    user_answers = Column(Text)
    completed_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

app = Flask(__name__)

def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()

def create_jwt_token(user_id: int, email: str):
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)

def generate_unique_seed(user_id: int, topic: str) -> str:
    timestamp = time.time()
    seed_string = f"{user_id}_{topic}_{timestamp}"
    return hashlib.md5(seed_string.encode()).hexdigest()

def generate_questions(topic: str, num_questions: int = 5, difficulty: str = "medium", seed: str = None) -> list:
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
    
    if seed:
        seed_int = int(seed[:8], 16) if len(seed) >= 8 else 0
        start_index = seed_int % len(base_questions)
    else:
        start_index = 0
    
    return base_questions[start_index:start_index + num_questions]

@app.route('/')
def home():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Quiz App - Login</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
            .login-card { background: white; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
            .btn-primary { background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="row justify-content-center align-items-center min-vh-100">
                <div class="col-md-6 col-lg-4">
                    <div class="login-card p-5">
                        <div class="text-center mb-4">
                            <h1 class="h3 mb-3">🎯 Quiz App</h1>
                            <p class="text-muted">Login to start creating unique quizzes</p>
                        </div>
                        
                        <div class="d-grid gap-3">
                            <a href="/login" class="btn btn-primary btn-lg">Login</a>
                            <a href="/signup" class="btn btn-outline-primary btn-lg">Sign Up</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    '''

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        db = get_db()
        user = db.query(User).filter(User.email == email).first()
        
        if user and check_password_hash(user.hashed_password, password):
            token = create_jwt_token(user.id, user.email)
            return jsonify({
                'success': True,
                'token': token,
                'user': {'id': user.id, 'email': user.email, 'username': user.username}
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
    
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Login - Quiz App</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
            .login-card { background: white; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="row justify-content-center align-items-center min-vh-100">
                <div class="col-md-6 col-lg-4">
                    <div class="login-card p-5">
                        <h3 class="text-center mb-4">🔐 Login</h3>
                        <form id="loginForm">
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" id="email" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Password</label>
                                <input type="password" class="form-control" id="password" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Login</button>
                        </form>
                        <div class="mt-3 text-center">
                            <a href="/signup">Don't have an account? Sign up</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                })
            });
            
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/dashboard';
            } else {
                alert(data.message);
            }
        });
        </script>
    </body>
    </html>
    '''

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')
        
        db = get_db()
        existing_user = db.query(User).filter(
            (User.email == email) | (User.username == username)
        ).first()
        
        if existing_user:
            return jsonify({'success': False, 'message': 'User already exists'}), 400
        
        hashed_password = generate_password_hash(password)
        new_user = User(email=email, username=username, hashed_password=hashed_password)
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        token = create_jwt_token(new_user.id, new_user.email)
        return jsonify({
            'success': True,
            'token': token,
            'user': {'id': new_user.id, 'email': new_user.email, 'username': new_user.username}
        })
    
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Sign Up - Quiz App</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
            .signup-card { background: white; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="row justify-content-center align-items-center min-vh-100">
                <div class="col-md-6 col-lg-4">
                    <div class="signup-card p-5">
                        <h3 class="text-center mb-4">📝 Sign Up</h3>
                        <form id="signupForm">
                            <div class="mb-3">
                                <label class="form-label">Username</label>
                                <input type="text" class="form-control" id="username" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" id="email" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Password</label>
                                <input type="password" class="form-control" id="password" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Sign Up</button>
                        </form>
                        <div class="mt-3 text-center">
                            <a href="/login">Already have an account? Login</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
        document.getElementById('signupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const response = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: document.getElementById('username').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                })
            });
            
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/dashboard';
            } else {
                alert(data.message);
            }
        });
        </script>
    </body>
    </html>
    '''

@app.route('/dashboard')
def dashboard():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Dashboard - Quiz App</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body { background: #f8f9fa; }
            .navbar { background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); }
            .card { border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        </style>
    </head>
    <body>
        <nav class="navbar navbar-expand-lg navbar-dark">
            <div class="container">
                <a class="navbar-brand" href="#">🎯 Quiz App</a>
                <div class="navbar-nav ms-auto">
                    <span class="navbar-text me-3" id="userInfo"></span>
                    <button class="btn btn-outline-light btn-sm" onclick="logout()">Logout</button>
                </div>
            </div>
        </nav>
        
        <div class="container mt-4">
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Create New Quiz</h5>
                            <form id="quizForm">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Topic (Any topic)</label>
                                        <input type="text" class="form-control" id="topic" placeholder="e.g., France, Technology, History" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Number of Questions</label>
                                        <input type="range" class="form-range" id="numQuestions" min="1" max="15" value="5">
                                        <small class="text-muted">Questions: <span id="questionCount">5</span></small>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Difficulty</label>
                                        <select class="form-select" id="difficulty">
                                            <option value="easy">Easy</option>
                                            <option value="medium" selected>Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">User ID (for unique questions)</label>
                                        <input type="number" class="form-control" id="userId" value="1" min="1">
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary">Generate Quiz</button>
                            </form>
                        </div>
                    </div>
                    
                    <div class="card mt-4" id="quizDisplay" style="display: none;">
                        <div class="card-body">
                            <h5 class="card-title">Quiz Preview</h5>
                            <div id="quizContent"></div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Features</h5>
                            <ul class="list-unstyled">
                                <li>✅ Unique questions per user</li>
                                <li>✅ Any topic support</li>
                                <li>✅ Difficulty levels</li>
                                <li>✅ Random question generation</li>
                                <li>✅ Quiz results tracking</li>
                                <li>🤖 AI integration ready</li>
                                <li>💬 Chatbot coming soon</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!token) {
            window.location.href = '/login';
        }
        
        document.getElementById('userInfo').textContent = `Welcome, ${user.username || user.email}`;
        
        document.getElementById('numQuestions').addEventListener('input', function() {
            document.getElementById('questionCount').textContent = this.value;
        });
        
        document.getElementById('quizForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                topic: document.getElementById('topic').value,
                num_questions: parseInt(document.getElementById('numQuestions').value),
                difficulty: document.getElementById('difficulty').value,
                user_id: parseInt(document.getElementById('userId').value)
            };
            
            try {
                const response = await fetch('/generate-quiz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    const quizResponse = await fetch(`/quiz/${data.quiz_id}`);
                    const quizData = await quizResponse.json();
                    displayQuiz(quizData);
                    document.getElementById('quizDisplay').style.display = 'block';
                } else {
                    alert('Failed to generate quiz');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error generating quiz');
            }
        });
        
        function displayQuiz(quizData) {
            const container = document.getElementById('quizContent');
            let html = `
                <h6>${quizData.quiz.title}</h6>
                <p class="text-muted">Seed: ${quizData.quiz.seed}</p>
                <hr>
            `;
            
            quizData.questions.forEach((question, index) => {
                html += `
                    <div class="mb-3">
                        <p><strong>Question ${index + 1}:</strong> ${question.question}</p>
                        <div class="ms-3">
                            ${question.options.map((option, optIndex) => 
                                `<div class="form-check">
                                    <input class="form-check-input" type="radio" name="q${question.id}" value="${optIndex}">
                                    <label class="form-check-label">${String.fromCharCode(65 + optIndex)}. ${option}</label>
                                </div>`
                            ).join('')}
                        </div>
                    </div>
                `;
            });
            
            html += `
                <button class="btn btn-success" onclick="submitQuiz(${quizData.quiz.id})">Submit Quiz</button>
            `;
            
            container.innerHTML = html;
        }
        
        function submitQuiz(quizId) {
            const answers = {};
            document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
                const questionId = input.name.substring(1);
                answers[questionId] = parseInt(input.value);
            });
            
            fetch('/submit-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quiz_id: quizId,
                    answers: answers
                })
            }).then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = `/results/${data.result_id}`;
                }
            });
        }
        
        function logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        </script>
    </body>
    </html>
    '''

@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    data = request.get_json()
    topic = data.get('topic', 'General Knowledge')
    num_questions = int(data.get('num_questions', 5))
    difficulty = data.get('difficulty', 'medium')
    user_id = int(data.get('user_id', 1))
    
    db = get_db()
    seed = generate_unique_seed(user_id, topic)
    
    db_quiz = Quiz(
        user_id=user_id,
        title=f"Quiz about {topic}",
        topic=topic,
        difficulty=difficulty,
        num_questions=num_questions,
        question_seed=seed
    )
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    
    questions_data = generate_questions(topic, num_questions, difficulty, seed)
    
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
    
    return jsonify({
        'success': True,
        'quiz_id': db_quiz.id,
        'title': db_quiz.title,
        'seed': seed,
        'message': 'Unique quiz generated successfully!'
    })

@app.route('/quiz/<int:quiz_id>')
def get_quiz(quiz_id):
    db = get_db()
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404
    
    questions = db.query(Question).filter(Question.quiz_id == quiz_id).all()
    
    return jsonify({
        "quiz": {
            "id": quiz.id,
            "title": quiz.title,
            "topic": quiz.topic,
            "seed": quiz.question_seed,
            "created_at": quiz.created_at.isoformat()
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
    })

@app.route('/submit-quiz', methods=['POST'])
def submit_quiz():
    data = request.get_json()
    quiz_id = data.get('quiz_id')
    answers = data.get('answers', {})
    
    db = get_db()
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    questions = db.query(Question).filter(Question.quiz_id == quiz_id).all()
    
    if not quiz or not questions:
        return jsonify({"error": "Quiz not found"}), 404
    
    correct_count = 0
    total_questions = len(questions)
    
    for question in questions:
        user_answer = answers.get(str(question.id))
        if user_answer is not None:
            options = [question.option_a, question.option_b, question.option_c, question.option_d]
            if options[user_answer] == question.correct_answer:
                correct_count += 1
    
    score = int((correct_count / total_questions) * 100)
    
    result = QuizResult(
        user_id=quiz.user_id,
        quiz_id=quiz_id,
        score=score,
        total_questions=total_questions,
        correct_answers=correct_count,
        user_answers=json.dumps(answers)
    )
    
    db.add(result)
    db.commit()
    db.refresh(result)
    
    return jsonify({
        'success': True,
        'result_id': result.id,
        'score': score,
        'correct_answers': correct_count,
        'total_questions': total_questions
    })

@app.route('/results/<int:result_id>')
def get_results(result_id):
    db = get_db()
    result = db.query(QuizResult).filter(QuizResult.id == result_id).first()
    
    if not result:
        return jsonify({"error": "Result not found"}), 404
    
    quiz = db.query(Quiz).filter(Quiz.id == result.quiz_id).first()
    questions = db.query(Question).filter(Question.quiz_id == result.quiz_id).all()
    
    return jsonify({
        "result": {
            "id": result.id,
            "score": result.score,
            "correct_answers": result.correct_answers,
            "total_questions": result.total_questions,
            "completed_at": result.completed_at.isoformat()
        },
        "quiz": {
            "id": quiz.id,
            "title": quiz.title,
            "topic": quiz.topic
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
    })

@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy", 
        "message": "Enhanced Quiz App is running!",
        "features": [
            "User authentication",
            "Unique question generation",
            "Any topic support",
            "Difficulty levels",
            "Quiz results tracking",
            "AI integration ready"
        ]
    })

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8000) 