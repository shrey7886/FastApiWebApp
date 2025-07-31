# 🎯 AI-Powered Quiz Application

A modern, full-stack quiz application with AI-powered question generation, built with FastAPI, Next.js, and OpenAI GPT.

## 🌟 Features

### 🤖 AI-Powered Question Generation
- **OpenAI GPT-3.5-turbo** for high-quality questions
- **Any topic** support with intelligent question generation
- **Multiple difficulty levels** (Easy, Medium, Hard)
- **Educational explanations** for each answer

### 🎨 Modern User Interface
- **Responsive design** - works on all devices
- **Dark/Light theme** toggle
- **Real-time timer** for quiz taking
- **Progress tracking** and analytics

### 🔐 User Management
- **Secure authentication** with JWT tokens
- **User registration** and login
- **Progress tracking** across sessions
- **Quiz history** and performance analytics

### 📊 Comprehensive Analytics
- **Performance tracking** by topic
- **Time analysis** and speed metrics
- **Weak area identification**
- **Progress visualization**

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - Database (production-ready)
- **OpenAI GPT-3.5-turbo** - AI question generation
- **JWT** - Authentication

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **Vercel** - Deployment platform

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd FastApiWebApp
```

2. **Install frontend dependencies**
```bash
cd quiz-frontend
npm install
```

3. **Install backend dependencies**
```bash
cd ..
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
# Create .env file in quiz-frontend directory
OPENAI_API_KEY=your_openai_api_key_here
```

5. **Start the development servers**

**Backend (FastAPI):**
```bash
python main.py
# Server runs on http://localhost:8001
```

**Frontend (Next.js):**
```bash
cd quiz-frontend
npm run dev
# App runs on http://localhost:3000
```

## 🌍 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**
```bash
cd quiz-frontend
vercel --prod
```

3. **Add environment variables in Vercel dashboard**
- `OPENAI_API_KEY` - Your OpenAI API key

## 📁 Project Structure

```
FastApiWebApp/
├── quiz-frontend/          # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   └── lib/          # Utility functions
│   ├── package.json
│   └── vercel.json
├── main.py               # FastAPI backend
├── models.py             # Database models
├── schemas.py            # Pydantic schemas
├── requirements.txt      # Python dependencies
└── README.md
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local):**
```env
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-your-anthropic-api-key
```

**Backend (.env):**
```env
DATABASE_URL=sqlite:///./quiziac.db
SECRET_KEY=your-secret-key
```

## 🎯 Usage

1. **Register/Login** - Create an account or sign in
2. **Create Quiz** - Choose topic, difficulty, questions, and time
3. **Take Quiz** - Answer questions with timer
4. **View Results** - See score, explanations, and analytics
5. **Track Progress** - Monitor performance over time

## 🔒 Security

- **JWT Authentication** for secure sessions
- **Password hashing** with bcrypt
- **Input validation** and sanitization
- **CORS protection** for API endpoints
- **Rate limiting** to prevent abuse

## 💰 Cost Analysis

- **OpenAI API**: ~$10-50/month for 1000 quizzes
- **Vercel Hosting**: Free tier available
- **Database**: SQLite (free) or PostgreSQL (~$5/month)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using FastAPI, Next.js, and OpenAI GPT** 