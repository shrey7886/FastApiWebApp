# Llama3 Integration Setup Guide

This guide will help you set up Llama3 as the primary LLM for generating dynamic quiz questions in your FastAPI quiz application.

## 🚀 Overview

The quiz app now uses **Llama3** as the primary AI model for generating questions, with OpenAI as a fallback. This provides:

- **Local AI processing** - No API costs or rate limits
- **Dynamic topic support** - Generate questions for any topic
- **Privacy** - All processing happens locally
- **Reliability** - Fallback to OpenAI if needed

## 📋 Prerequisites

- Python 3.8+
- Windows, macOS, or Linux
- At least 4GB RAM (8GB recommended)
- Internet connection for initial model download

## 🛠️ Installation Steps

### 1. Install Ollama

**Windows:**
```bash
# Download from https://ollama.ai/download
# Run the installer and restart your terminal
```

**macOS/Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Setup the Quiz App

```bash
# Clone or navigate to your project directory
cd FastApiWebApp

# Install Python dependencies
pip install -r requirements.txt

# Run the automated setup script
python setup_llama3.py
```

### 3. Manual Setup (Alternative)

If the automated setup doesn't work, follow these manual steps:

```bash
# 1. Start Ollama service
ollama serve

# 2. Download Llama3 model (in a new terminal)
ollama pull llama3.2:3b

# 3. Test the connection
python test_llama3.py
```

### 4. Configure Environment

Create a `.env` file in your project root:

```env
# Llama3 Configuration
LLAMA3_API_URL=http://localhost:11434/api/generate
LLAMA3_MODEL=llama3.2:3b
LLAMA3_MAX_TOKENS=2000
LLAMA3_TEMPERATURE=0.7

# OpenAI Configuration (fallback)
OPENAI_API_KEY=your-openai-api-key-here

# Database Configuration
DATABASE_URL=sqlite:///./quiziac.db

# Security
SECRET_KEY=your-secret-key-here
```

## 🧪 Testing the Integration

### Test Llama3 Connection

```bash
python test_llama3.py
```

Expected output:
```
🚀 Llama3 Integration Test
==================================================
🔧 Configuration:
  API URL: http://localhost:11434/api/generate
  Model: llama3.2:3b

🔍 Testing Llama3 connection...
✅ Llama3 connection successful!
Response preview: Hello! I'm doing well, thank you for asking...

🎯 Testing quiz question generation...

📝 Testing topic: Python Programming
✅ Generated 3 questions for 'Python Programming'
  Q1: What is the primary purpose of Python's __init__ method?...
  Q2: Which of the following is NOT a Python data type?...
  Q3: What does the 'self' parameter represent in Python class methods?...
```

### Test the Full Application

```bash
# Start the FastAPI server
python main.py

# The server will be available at http://localhost:8001
```

## 🎯 Using Dynamic Topics

### Frontend Usage

The frontend already supports dynamic topic input. Users can:

1. **Enter any topic** in the topic field
2. **Choose from suggestions** in the dropdown
3. **Use custom topics** like "Dogs", "Space Travel", "Cooking", etc.

### API Usage

```bash
# Generate a quiz for any topic
curl -X POST "http://localhost:8001/generate-quiz" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "topic": "Dogs",
    "difficulty": "medium",
    "num_questions": 5,
    "duration": 10,
    "tenant_id": "default"
  }'
```

Response:
```json
{
  "success": true,
  "quiz_id": 123,
  "topic": "Dogs",
  "questions_generated": 5,
  "model_used": "Llama3"
}
```

## 🔧 Configuration Options

### Llama3 Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `LLAMA3_API_URL` | `http://localhost:11434/api/generate` | Ollama API endpoint |
| `LLAMA3_MODEL` | `llama3.2:3b` | Llama3 model to use |
| `LLAMA3_MAX_TOKENS` | `2000` | Maximum tokens per response |
| `LLAMA3_TEMPERATURE` | `0.7` | Creativity level (0.0-1.0) |

### Available Models

You can use different Llama3 models:

```bash
# Download different models
ollama pull llama3.2:3b    # Fastest, 3B parameters
ollama pull llama3.2:7b    # Balanced, 7B parameters
ollama pull llama3.2:13b   # High quality, 13B parameters
ollama pull llama3.2:70b   # Best quality, 70B parameters

# Update your .env file
LLAMA3_MODEL=llama3.2:7b
```

## 🏗️ Architecture

### Service Flow

1. **User enters topic** → Frontend sends to `/generate-quiz`
2. **Llama3 Service** → Generates questions using local AI
3. **Fallback to OpenAI** → If Llama3 fails or generates insufficient questions
4. **Static Questions** → Final fallback if both AI services fail
5. **Database Storage** → Questions saved with topic and metadata

### File Structure

```
FastApiWebApp/
├── llama3_service.py      # Llama3 integration
├── ai_service.py          # Main AI service (updated)
├── main.py               # FastAPI app (updated)
├── setup_llama3.py       # Setup automation
├── test_llama3.py        # Testing script
├── requirements.txt      # Dependencies (updated)
└── LLAMA3_SETUP.md      # This guide
```

## 🐛 Troubleshooting

### Common Issues

**1. Ollama not found**
```bash
# Check if Ollama is installed
ollama --version

# If not installed, follow installation steps above
```

**2. Model not downloaded**
```bash
# Download the model
ollama pull llama3.2:3b

# Check available models
ollama list
```

**3. Service not running**
```bash
# Start Ollama service
ollama serve

# Check if service is running
curl http://localhost:11434/api/tags
```

**4. Connection timeout**
```bash
# Check firewall settings
# Ensure port 11434 is accessible
# Try increasing timeout in .env
LLAMA3_MAX_TOKENS=3000
```

**5. Insufficient memory**
```bash
# Use smaller model
ollama pull llama3.2:3b
LLAMA3_MODEL=llama3.2:3b

# Or increase system RAM
```

### Performance Optimization

**For better performance:**
- Use `llama3.2:3b` for faster generation
- Ensure adequate RAM (8GB+ recommended)
- Close other applications during generation
- Use SSD storage for faster model loading

**For better quality:**
- Use `llama3.2:7b` or `llama3.2:13b`
- Increase `LLAMA3_MAX_TOKENS` to 3000-4000
- Adjust `LLAMA3_TEMPERATURE` to 0.8-0.9

## 🔄 Fallback System

The app uses a robust fallback system:

1. **Primary**: Llama3 (local AI)
2. **Secondary**: OpenAI (cloud AI)
3. **Tertiary**: Static questions (built-in)

This ensures the app always works, even if AI services are unavailable.

## 📊 Monitoring

### Logs

The app provides detailed logging:

```
🎯 Generating quiz for dynamic topic: 'Dogs'
🤖 Generating 5 medium questions about 'Dogs' using Llama3...
✅ Successfully generated 5 Llama3 questions for topic: Dogs
📝 Created new topic: Dogs
✅ Successfully created quiz with 5 questions for topic: 'Dogs'
```

### Health Check

```bash
curl http://localhost:8001/health
```

## 🚀 Deployment

### Local Development

```bash
# Start Ollama service
ollama serve

# Start FastAPI app
python main.py
```

### Production

For production deployment:

1. **Install Ollama** on your server
2. **Download models** during deployment
3. **Configure environment** variables
4. **Set up monitoring** for Ollama service
5. **Use process manager** (systemd, PM2, etc.)

### Docker (Optional)

```dockerfile
# Example Dockerfile for Ollama
FROM ollama/ollama:latest
RUN ollama pull llama3.2:3b
EXPOSE 11434
CMD ["ollama", "serve"]
```

## 🤝 Contributing

To contribute to the Llama3 integration:

1. Test with different models
2. Optimize prompts for better question quality
3. Add support for other local LLMs
4. Improve error handling and fallback logic

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run `python test_llama3.py` for diagnostics
3. Check Ollama logs: `ollama logs`
4. Verify system requirements

## 🎉 Success!

Once setup is complete, you'll have:

- ✅ Local AI-powered quiz generation
- ✅ Dynamic topic support
- ✅ No API costs or rate limits
- ✅ Privacy-focused processing
- ✅ Reliable fallback system

Enjoy generating quizzes for any topic with your local Llama3 AI! 🚀 