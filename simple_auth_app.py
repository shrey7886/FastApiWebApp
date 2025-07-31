from flask import Flask, request, jsonify, render_template
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import hashlib
import time
import json
from werkzeug.security import generate_password_hash, check_password_hash

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./quiziac.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, index=True)
    topic = Column(String)
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

class QuizResult(Base):
    __tablename__ = "quiz_results"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    score = Column(Integer)
    total_questions = Column(Integer)
    user_answers = Column(Text)
    completed_at = Column(DateTime, default=datetime.utcnow)

# Drop and recreate all tables
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

app = Flask(__name__)

def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()

def generate_unique_seed(user_id: int, topic: str) -> str:
    timestamp = time.time()
    seed_string = f"{user_id}_{topic}_{timestamp}"
    return hashlib.md5(seed_string.encode()).hexdigest()

def generate_questions(topic: str, num_questions: int = 5, seed: str = None) -> list:
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
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quiziac - AI-Powered Quiz Platform</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                --success-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                --warning-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                --dark-gradient: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                --glass-bg: rgba(255, 255, 255, 0.1);
                --glass-border: rgba(255, 255, 255, 0.2);
                --shadow-soft: 0 8px 32px rgba(0, 0, 0, 0.1);
                --shadow-strong: 0 20px 60px rgba(0, 0, 0, 0.15);
                --border-radius: 20px;
                --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Inter', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                overflow-x: hidden;
            }

            /* Animated Background */
            .animated-bg {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
                background-size: 400% 400%;
                animation: gradientShift 15s ease infinite;
            }

            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            /* Floating Elements */
            .floating-element {
                position: absolute;
                width: 100px;
                height: 100px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                animation: float 6s ease-in-out infinite;
            }

            .floating-element:nth-child(1) {
                top: 20%;
                left: 10%;
                animation-delay: 0s;
            }

            .floating-element:nth-child(2) {
                top: 60%;
                right: 10%;
                animation-delay: 2s;
            }

            .floating-element:nth-child(3) {
                bottom: 20%;
                left: 20%;
                animation-delay: 4s;
            }

            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(180deg); }
            }

            /* Glass Morphism */
            .glass-card {
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-soft);
                transition: var(--transition);
            }

            .glass-card:hover {
                transform: translateY(-5px);
                box-shadow: var(--shadow-strong);
                border-color: rgba(255, 255, 255, 0.3);
            }

            /* Hero Section */
            .hero-section {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
            }

            .hero-content {
                text-align: center;
                z-index: 10;
                max-width: 800px;
                padding: 2rem;
            }

            .hero-title {
                font-size: 4rem;
                font-weight: 800;
                background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 1rem;
                animation: fadeInUp 1s ease-out;
            }

            .hero-subtitle {
                font-size: 1.5rem;
                color: rgba(255, 255, 255, 0.9);
                margin-bottom: 3rem;
                font-weight: 300;
                animation: fadeInUp 1s ease-out 0.2s both;
            }

            /* Buttons */
            .btn-modern {
                padding: 1rem 2.5rem;
                border: none;
                border-radius: 50px;
                font-weight: 600;
                font-size: 1.1rem;
                text-decoration: none;
                display: inline-block;
                transition: var(--transition);
                position: relative;
                overflow: hidden;
                margin: 0.5rem;
            }

            .btn-primary-modern {
                background: var(--primary-gradient);
                color: white;
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
            }

            .btn-primary-modern:hover {
                transform: translateY(-3px);
                box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
                color: white;
            }

            .btn-secondary-modern {
                background: transparent;
                color: white;
                border: 2px solid rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(10px);
            }

            .btn-secondary-modern:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.5);
                color: white;
                transform: translateY(-3px);
            }

            /* Features Grid */
            .features-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                margin: 4rem 0;
            }

            .feature-card {
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: var(--border-radius);
                padding: 2rem;
                text-align: center;
                transition: var(--transition);
                position: relative;
                overflow: hidden;
            }

            .feature-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                transition: left 0.5s;
            }

            .feature-card:hover::before {
                left: 100%;
            }

            .feature-card:hover {
                transform: translateY(-10px);
                box-shadow: var(--shadow-strong);
            }

            .feature-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
                background: var(--accent-gradient);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .feature-title {
                font-size: 1.5rem;
                font-weight: 600;
                color: white;
                margin-bottom: 1rem;
            }

            .feature-description {
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.6;
            }

            /* Animations */
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes slideInLeft {
                from {
                    opacity: 0;
                    transform: translateX(-50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .hero-title {
                    font-size: 2.5rem;
                }
                
                .hero-subtitle {
                    font-size: 1.2rem;
                }
                
                .features-grid {
                    grid-template-columns: 1fr;
                }
            }

            /* Loading Animation */
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top: 4px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Particle Effect */
            .particles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: 1;
            }

            .particle {
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                animation: particleFloat 8s linear infinite;
            }

            @keyframes particleFloat {
                0% {
                    transform: translateY(100vh) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100px) rotate(360deg);
                    opacity: 0;
                }
            }
        </style>
    </head>
    <body>
        <!-- Animated Background -->
        <div class="animated-bg"></div>
        
        <!-- Floating Elements -->
        <div class="floating-element"></div>
        <div class="floating-element"></div>
        <div class="floating-element"></div>
        
        <!-- Particle Effect -->
        <div class="particles" id="particles"></div>
        
        <!-- Hero Section -->
        <section class="hero-section">
            <div class="hero-content">
                <h1 class="hero-title">
                    <i class="fas fa-brain"></i> Quiziac
                </h1>
                <p class="hero-subtitle">
                    Experience the future of learning with AI-powered quizzes that adapt to every user
                </p>
                
                <div class="hero-buttons">
                    <a href="/signup" class="btn-modern btn-primary-modern">
                        <i class="fas fa-rocket"></i> Get Started
                    </a>
                    <a href="/login" class="btn-modern btn-secondary-modern">
                        <i class="fas fa-sign-in-alt"></i> Sign In
                    </a>
                </div>
                
                <!-- Features Grid -->
                <div class="features-grid">
                    <div class="feature-card" style="animation: slideInLeft 1s ease-out 0.4s both;">
                        <div class="feature-icon">
                            <i class="fas fa-magic"></i>
                        </div>
                        <h3 class="feature-title">AI-Powered Questions</h3>
                        <p class="feature-description">
                            Generate unique, intelligent questions tailored to your learning needs
                        </p>
                    </div>
                    
                    <div class="feature-card" style="animation: slideInRight 1s ease-out 0.6s both;">
                        <div class="feature-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <h3 class="feature-title">Multi-User Support</h3>
                        <p class="feature-description">
                            Each user gets personalized questions with no repetition
                        </p>
                    </div>
                    
                    <div class="feature-card" style="animation: slideInLeft 1s ease-out 0.8s both;">
                        <div class="feature-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <h3 class="feature-title">Performance Analytics</h3>
                        <p class="feature-description">
                            Track your progress with detailed insights and analytics
                        </p>
                    </div>
                    
                    <div class="feature-card" style="animation: slideInRight 1s ease-out 1s both;">
                        <div class="feature-icon">
                            <i class="fas fa-mobile-alt"></i>
                        </div>
                        <h3 class="feature-title">Responsive Design</h3>
                        <p class="feature-description">
                            Beautiful interface that works perfectly on all devices
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <script>
            // Particle Effect
            function createParticles() {
                const particlesContainer = document.getElementById('particles');
                const particleCount = 50;
                
                for (let i = 0; i < particleCount; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.left = Math.random() * 100 + '%';
                    particle.style.animationDelay = Math.random() * 8 + 's';
                    particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
                    particlesContainer.appendChild(particle);
                }
            }
            
            // Smooth Scrolling
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    document.querySelector(this.getAttribute('href')).scrollIntoView({
                        behavior: 'smooth'
                    });
                });
            });
            
            // Intersection Observer for animations
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);
            
            // Observe all feature cards
            document.querySelectorAll('.feature-card').forEach(card => {
                observer.observe(card);
            });
            
            // Initialize particles
            createParticles();
            
            // Add hover effects
            document.querySelectorAll('.btn-modern').forEach(btn => {
                btn.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-3px) scale(1.05)';
                });
                
                btn.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });
        </script>
    </body>
    </html>
    '''

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        db = get_db()
        user = db.query(User).filter(User.username == username).first()
        
        if user and check_password_hash(user.hashed_password, password):
            return jsonify({'success': True, 'user_id': user.id, 'username': user.username})
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'})
    
    return '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - Quiziac</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                --success-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                --warning-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                --dark-gradient: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                --glass-bg: rgba(255, 255, 255, 0.1);
                --glass-border: rgba(255, 255, 255, 0.2);
                --shadow-soft: 0 8px 32px rgba(0, 0, 0, 0.1);
                --shadow-strong: 0 20px 60px rgba(0, 0, 0, 0.15);
                --border-radius: 20px;
                --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Inter', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                overflow-x: hidden;
            }

            /* Animated Background */
            .animated-bg {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
                background-size: 400% 400%;
                animation: gradientShift 15s ease infinite;
            }

            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            /* Floating Elements */
            .floating-element {
                position: absolute;
                width: 80px;
                height: 80px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                animation: float 6s ease-in-out infinite;
            }

            .floating-element:nth-child(1) {
                top: 15%;
                left: 5%;
                animation-delay: 0s;
            }

            .floating-element:nth-child(2) {
                top: 70%;
                right: 5%;
                animation-delay: 2s;
            }

            .floating-element:nth-child(3) {
                bottom: 15%;
                left: 15%;
                animation-delay: 4s;
            }

            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-15px) rotate(180deg); }
            }

            /* Glass Morphism */
            .glass-card {
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-soft);
                transition: var(--transition);
            }

            .glass-card:hover {
                transform: translateY(-5px);
                box-shadow: var(--shadow-strong);
                border-color: rgba(255, 255, 255, 0.3);
            }

            /* Login Container */
            .login-container {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
            }

            .login-card {
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: var(--border-radius);
                padding: 3rem;
                width: 100%;
                max-width: 450px;
                box-shadow: var(--shadow-strong);
                animation: fadeInUp 1s ease-out;
            }

            .login-header {
                text-align: center;
                margin-bottom: 2rem;
            }

            .login-title {
                font-size: 2.5rem;
                font-weight: 800;
                background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 0.5rem;
            }

            .login-subtitle {
                color: rgba(255, 255, 255, 0.8);
                font-size: 1.1rem;
                font-weight: 300;
            }

            /* Form Elements */
            .form-group {
                margin-bottom: 1.5rem;
                position: relative;
            }

            .form-label {
                display: block;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 500;
                margin-bottom: 0.5rem;
                font-size: 0.95rem;
            }

            .form-input {
                width: 100%;
                padding: 1rem 1.5rem;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                color: white;
                font-size: 1rem;
                transition: var(--transition);
                backdrop-filter: blur(10px);
            }

            .form-input::placeholder {
                color: rgba(255, 255, 255, 0.6);
            }

            .form-input:focus {
                outline: none;
                border-color: rgba(255, 255, 255, 0.5);
                background: rgba(255, 255, 255, 0.15);
                box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
            }

            .input-icon {
                position: absolute;
                right: 1rem;
                top: 50%;
                transform: translateY(-50%);
                color: rgba(255, 255, 255, 0.6);
                font-size: 1.1rem;
            }

            /* Buttons */
            .btn-modern {
                width: 100%;
                padding: 1rem 2rem;
                border: none;
                border-radius: 12px;
                font-weight: 600;
                font-size: 1.1rem;
                text-decoration: none;
                display: inline-block;
                transition: var(--transition);
                position: relative;
                overflow: hidden;
                margin: 0.5rem 0;
            }

            .btn-primary-modern {
                background: var(--primary-gradient);
                color: white;
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
            }

            .btn-primary-modern:hover {
                transform: translateY(-3px);
                box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
                color: white;
            }

            .btn-secondary-modern {
                background: transparent;
                color: white;
                border: 2px solid rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(10px);
            }

            .btn-secondary-modern:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.5);
                color: white;
                transform: translateY(-3px);
            }

            /* Animations */
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }

            .shake {
                animation: shake 0.5s ease-in-out;
            }

            /* Loading Animation */
            .loading-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                display: inline-block;
                margin-right: 0.5rem;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Alert Styles */
            .alert-modern {
                padding: 1rem 1.5rem;
                border-radius: 12px;
                margin-bottom: 1rem;
                border: none;
                backdrop-filter: blur(10px);
                animation: fadeInUp 0.5s ease-out;
            }

            .alert-success {
                background: rgba(67, 233, 123, 0.2);
                color: #43e97b;
                border: 1px solid rgba(67, 233, 123, 0.3);
            }

            .alert-error {
                background: rgba(245, 87, 108, 0.2);
                color: #f5576c;
                border: 1px solid rgba(245, 87, 108, 0.3);
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .login-card {
                    margin: 1rem;
                    padding: 2rem;
                }
                
                .login-title {
                    font-size: 2rem;
                }
            }
        </style>
    </head>
    <body>
        <!-- Animated Background -->
        <div class="animated-bg"></div>
        
        <!-- Floating Elements -->
        <div class="floating-element"></div>
        <div class="floating-element"></div>
        <div class="floating-element"></div>
        
        <!-- Login Container -->
        <div class="login-container">
            <div class="login-card">
                <div class="login-header">
                    <h1 class="login-title">
                        <i class="fas fa-sign-in-alt"></i> Welcome Back
                    </h1>
                    <p class="login-subtitle">Sign in to continue your learning journey</p>
                </div>
                
                <div id="alert-container"></div>
                
                <form id="loginForm">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-user"></i> Username
                        </label>
                        <input type="text" id="username" class="form-input" placeholder="Enter your username" required>
                        <i class="fas fa-user input-icon"></i>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-lock"></i> Password
                        </label>
                        <input type="password" id="password" class="form-input" placeholder="Enter your password" required>
                        <i class="fas fa-lock input-icon"></i>
                    </div>
                    
                    <button type="submit" class="btn-modern btn-primary-modern" id="loginBtn">
                        <span id="loginBtnText">
                            <i class="fas fa-sign-in-alt"></i> Sign In
                        </span>
                        <div id="loginSpinner" class="loading-spinner" style="display: none;"></div>
                    </button>
                </form>
                
                <div class="text-center mt-4">
                    <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 1rem;">
                        Don't have an account?
                    </p>
                    <a href="/signup" class="btn-modern btn-secondary-modern">
                        <i class="fas fa-user-plus"></i> Create Account
                    </a>
                </div>
                
                <div class="text-center mt-3">
                    <a href="/" class="btn-modern btn-secondary-modern" style="width: auto; padding: 0.5rem 1rem;">
                        <i class="fas fa-home"></i> Back to Home
                    </a>
                </div>
            </div>
        </div>

        <script>
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const loginBtn = document.getElementById('loginBtn');
                const loginBtnText = document.getElementById('loginBtnText');
                const loginSpinner = document.getElementById('loginSpinner');
                const alertContainer = document.getElementById('alert-container');
                
                // Show loading state
                loginBtn.disabled = true;
                loginBtnText.style.display = 'none';
                loginSpinner.style.display = 'inline-block';
                
                try {
                    const response = await fetch('/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ username, password })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        // Store user data
                        localStorage.setItem('user', JSON.stringify({
                            id: data.user_id,
                            username: data.username
                        }));
                        
                        // Show success message
                        alertContainer.innerHTML = `
                            <div class="alert-modern alert-success">
                                <i class="fas fa-check-circle"></i> Login successful! Redirecting...
                            </div>
                        `;
                        
                        // Redirect to dashboard
                        setTimeout(() => {
                            window.location.href = '/dashboard';
                        }, 1500);
                    } else {
                        // Show error message
                        alertContainer.innerHTML = `
                            <div class="alert-modern alert-error">
                                <i class="fas fa-exclamation-circle"></i> ${data.message}
                            </div>
                        `;
                        
                        // Shake animation
                        document.querySelector('.login-card').classList.add('shake');
                        setTimeout(() => {
                            document.querySelector('.login-card').classList.remove('shake');
                        }, 500);
                    }
                } catch (error) {
                    alertContainer.innerHTML = `
                        <div class="alert-modern alert-error">
                            <i class="fas fa-exclamation-circle"></i> Network error. Please try again.
                        </div>
                    `;
                } finally {
                    // Reset loading state
                    loginBtn.disabled = false;
                    loginBtnText.style.display = 'inline';
                    loginSpinner.style.display = 'none';
                }
            });
            
            // Add input focus effects
            document.querySelectorAll('.form-input').forEach(input => {
                input.addEventListener('focus', function() {
                    this.parentElement.style.transform = 'scale(1.02)';
                });
                
                input.addEventListener('blur', function() {
                    this.parentElement.style.transform = 'scale(1)';
                });
            });
            
            // Add hover effects
            document.querySelectorAll('.btn-modern').forEach(btn => {
                btn.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-3px) scale(1.02)';
                });
                
                btn.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });
        </script>
    </body>
    </html>
    '''

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        db = get_db()
        
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            return jsonify({'success': False, 'message': 'Username or email already exists'})
        
        # Create new user
        hashed_password = generate_password_hash(password)
        new_user = User(
            username=username,
            email=email,
            hashed_password=hashed_password
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return jsonify({'success': True, 'user_id': new_user.id, 'username': new_user.username})
    
    return '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign Up - Quiziac</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                --success-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                --warning-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                --dark-gradient: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                --glass-bg: rgba(255, 255, 255, 0.1);
                --glass-border: rgba(255, 255, 255, 0.2);
                --shadow-soft: 0 8px 32px rgba(0, 0, 0, 0.1);
                --shadow-strong: 0 20px 60px rgba(0, 0, 0, 0.15);
                --border-radius: 20px;
                --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Inter', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                overflow-x: hidden;
            }

            /* Animated Background */
            .animated-bg {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
                background-size: 400% 400%;
                animation: gradientShift 15s ease infinite;
            }

            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            /* Floating Elements */
            .floating-element {
                position: absolute;
                width: 80px;
                height: 80px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                animation: float 6s ease-in-out infinite;
            }

            .floating-element:nth-child(1) {
                top: 15%;
                left: 5%;
                animation-delay: 0s;
            }

            .floating-element:nth-child(2) {
                top: 70%;
                right: 5%;
                animation-delay: 2s;
            }

            .floating-element:nth-child(3) {
                bottom: 15%;
                left: 15%;
                animation-delay: 4s;
            }

            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-15px) rotate(180deg); }
            }

            /* Glass Morphism */
            .glass-card {
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-soft);
                transition: var(--transition);
            }

            .glass-card:hover {
                transform: translateY(-5px);
                box-shadow: var(--shadow-strong);
                border-color: rgba(255, 255, 255, 0.3);
            }

            /* Signup Container */
            .signup-container {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
            }

            .signup-card {
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: var(--border-radius);
                padding: 3rem;
                width: 100%;
                max-width: 500px;
                box-shadow: var(--shadow-strong);
                animation: fadeInUp 1s ease-out;
            }

            .signup-header {
                text-align: center;
                margin-bottom: 2rem;
            }

            .signup-title {
                font-size: 2.5rem;
                font-weight: 800;
                background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 0.5rem;
            }

            .signup-subtitle {
                color: rgba(255, 255, 255, 0.8);
                font-size: 1.1rem;
                font-weight: 300;
            }

            /* Form Elements */
            .form-group {
                margin-bottom: 1.5rem;
                position: relative;
            }

            .form-label {
                display: block;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 500;
                margin-bottom: 0.5rem;
                font-size: 0.95rem;
            }

            .form-input {
                width: 100%;
                padding: 1rem 1.5rem;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                color: white;
                font-size: 1rem;
                transition: var(--transition);
                backdrop-filter: blur(10px);
            }

            .form-input::placeholder {
                color: rgba(255, 255, 255, 0.6);
            }

            .form-input:focus {
                outline: none;
                border-color: rgba(255, 255, 255, 0.5);
                background: rgba(255, 255, 255, 0.15);
                box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
            }

            .input-icon {
                position: absolute;
                right: 1rem;
                top: 50%;
                transform: translateY(-50%);
                color: rgba(255, 255, 255, 0.6);
                font-size: 1.1rem;
            }

            /* Buttons */
            .btn-modern {
                width: 100%;
                padding: 1rem 2rem;
                border: none;
                border-radius: 12px;
                font-weight: 600;
                font-size: 1.1rem;
                text-decoration: none;
                display: inline-block;
                transition: var(--transition);
                position: relative;
                overflow: hidden;
                margin: 0.5rem 0;
            }

            .btn-primary-modern {
                background: var(--primary-gradient);
                color: white;
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
            }

            .btn-primary-modern:hover {
                transform: translateY(-3px);
                box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
                color: white;
            }

            .btn-secondary-modern {
                background: transparent;
                color: white;
                border: 2px solid rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(10px);
            }

            .btn-secondary-modern:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.5);
                color: white;
                transform: translateY(-3px);
            }

            /* Animations */
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }

            .shake {
                animation: shake 0.5s ease-in-out;
            }

            /* Loading Animation */
            .loading-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                display: inline-block;
                margin-right: 0.5rem;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Alert Styles */
            .alert-modern {
                padding: 1rem 1.5rem;
                border-radius: 12px;
                margin-bottom: 1rem;
                border: none;
                backdrop-filter: blur(10px);
                animation: fadeInUp 0.5s ease-out;
            }

            .alert-success {
                background: rgba(67, 233, 123, 0.2);
                color: #43e97b;
                border: 1px solid rgba(67, 233, 123, 0.3);
            }

            .alert-error {
                background: rgba(245, 87, 108, 0.2);
                color: #f5576c;
                border: 1px solid rgba(245, 87, 108, 0.3);
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .signup-card {
                    margin: 1rem;
                    padding: 2rem;
                }
                
                .signup-title {
                    font-size: 2rem;
                }
            }
        </style>
    </head>
    <body>
        <!-- Animated Background -->
        <div class="animated-bg"></div>
        
        <!-- Floating Elements -->
        <div class="floating-element"></div>
        <div class="floating-element"></div>
        <div class="floating-element"></div>
        
        <!-- Signup Container -->
        <div class="signup-container">
            <div class="signup-card">
                <div class="signup-header">
                    <h1 class="signup-title">
                        <i class="fas fa-user-plus"></i> Join Quiziac
                    </h1>
                    <p class="signup-subtitle">Create your account and start learning</p>
                </div>
                
                <div id="alert-container"></div>
                
                <form id="signupForm">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-user"></i> Username
                        </label>
                        <input type="text" id="username" class="form-input" placeholder="Choose a username" required>
                        <i class="fas fa-user input-icon"></i>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-envelope"></i> Email
                        </label>
                        <input type="email" id="email" class="form-input" placeholder="Enter your email" required>
                        <i class="fas fa-envelope input-icon"></i>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-lock"></i> Password
                        </label>
                        <input type="password" id="password" class="form-input" placeholder="Create a password" required>
                        <i class="fas fa-lock input-icon"></i>
                    </div>
                    
                    <button type="submit" class="btn-modern btn-primary-modern" id="signupBtn">
                        <span id="signupBtnText">
                            <i class="fas fa-user-plus"></i> Create Account
                        </span>
                        <div id="signupSpinner" class="loading-spinner" style="display: none;"></div>
                    </button>
                </form>
                
                <div class="text-center mt-4">
                    <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 1rem;">
                        Already have an account?
                    </p>
                    <a href="/login" class="btn-modern btn-secondary-modern">
                        <i class="fas fa-sign-in-alt"></i> Sign In
                    </a>
                </div>
                
                <div class="text-center mt-3">
                    <a href="/" class="btn-modern btn-secondary-modern" style="width: auto; padding: 0.5rem 1rem;">
                        <i class="fas fa-home"></i> Back to Home
                    </a>
                </div>
            </div>
        </div>

        <script>
            document.getElementById('signupForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const signupBtn = document.getElementById('signupBtn');
                const signupBtnText = document.getElementById('signupBtnText');
                const signupSpinner = document.getElementById('signupSpinner');
                const alertContainer = document.getElementById('alert-container');
                
                // Show loading state
                signupBtn.disabled = true;
                signupBtnText.style.display = 'none';
                signupSpinner.style.display = 'inline-block';
                
                try {
                    const response = await fetch('/signup', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ username, email, password })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        // Store user data
                        localStorage.setItem('user', JSON.stringify({
                            id: data.user_id,
                            username: data.username
                        }));
                        
                        // Show success message
                        alertContainer.innerHTML = `
                            <div class="alert-modern alert-success">
                                <i class="fas fa-check-circle"></i> Account created successfully! Redirecting...
                            </div>
                        `;
                        
                        // Redirect to dashboard
                        setTimeout(() => {
                            window.location.href = '/dashboard';
                        }, 1500);
                    } else {
                        // Show error message
                        alertContainer.innerHTML = `
                            <div class="alert-modern alert-error">
                                <i class="fas fa-exclamation-circle"></i> ${data.message}
                            </div>
                        `;
                        
                        // Shake animation
                        document.querySelector('.signup-card').classList.add('shake');
                        setTimeout(() => {
                            document.querySelector('.signup-card').classList.remove('shake');
                        }, 500);
                    }
                } catch (error) {
                    alertContainer.innerHTML = `
                        <div class="alert-modern alert-error">
                            <i class="fas fa-exclamation-circle"></i> Network error. Please try again.
                        </div>
                    `;
                } finally {
                    // Reset loading state
                    signupBtn.disabled = false;
                    signupBtnText.style.display = 'inline';
                    signupSpinner.style.display = 'none';
                }
            });
            
            // Add input focus effects
            document.querySelectorAll('.form-input').forEach(input => {
                input.addEventListener('focus', function() {
                    this.parentElement.style.transform = 'scale(1.02)';
                });
                
                input.addEventListener('blur', function() {
                    this.parentElement.style.transform = 'scale(1)';
                });
            });
            
            // Add hover effects
            document.querySelectorAll('.btn-modern').forEach(btn => {
                btn.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-3px) scale(1.02)';
                });
                
                btn.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
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
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!user.id) {
            window.location.href = '/login';
        }
        
        document.getElementById('userInfo').textContent = `Welcome, ${user.username || user.email}`;
        
        document.getElementById('numQuestions').addEventListener('input', function() {
            document.getElementById('questionCount').textContent = this.value;
        });
        
        document.getElementById('quizForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const formData = {
                topic: document.getElementById('topic').value,
                num_questions: parseInt(document.getElementById('numQuestions').value),
                difficulty: document.getElementById('difficulty').value,
                user_id: user.id || parseInt(document.getElementById('userId').value)
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
                    alert(`Quiz completed! Score: ${data.score}% (${data.correct_answers}/${data.total_questions} correct)`);
                }
            });
        }
        
        function logout() {
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        </script>
    </body>
    </html>
    '''

@app.route('/history')
def history():
    user = None
    try:
        user = json.loads(request.cookies.get('user', '{}'))
    except Exception:
        pass
    user_id = user.get('id') if user else None
    if not user_id:
        return "<script>window.location.href='/login';</script>"
    db = get_db()
    quizzes = db.query(Quiz).filter(Quiz.user_id == user_id).order_by(Quiz.created_at.desc()).all()
    quiz_list = []
    for quiz in quizzes:
        num_questions = db.query(Question).filter(Question.quiz_id == quiz.id).count()
        quiz_list.append({
            'id': quiz.id,
            'title': quiz.title,
            'topic': quiz.topic,
            'difficulty': 'Medium',  # Placeholder, update if you store difficulty
            'num_questions': num_questions,
            'duration': '30 min',  # Placeholder, update if you store duration
            'last_attempt': quiz.created_at.strftime('%d/%m/%Y %I:%M:%S %p')
        })
    return render_template('history.html', quizzes=quiz_list)

@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    data = request.get_json()
    topic = data.get('topic', 'General Knowledge')
    num_questions = int(data.get('num_questions', 5))
    user_id = data.get('user_id')
    if user_id is None:
        user_id = 1
    else:
        user_id = int(user_id)
    
    db = get_db()
    seed = generate_unique_seed(user_id, topic)
    
    db_quiz = Quiz(
        user_id=user_id,
        title=f"Quiz about {topic}",
        topic=topic,
        question_seed=seed
    )
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    
    questions_data = generate_questions(topic, num_questions, seed)
    
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
    
    return jsonify({
        'success': True,
        'score': score,
        'correct_answers': correct_count,
        'total_questions': total_questions
    })

@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy", 
        "message": "Quiz App with Authentication is running!",
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