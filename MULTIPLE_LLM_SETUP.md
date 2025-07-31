# 🤖 Multiple LLM Models Setup Guide

This guide explains how to set up multiple LLM providers as fallback options for robust quiz generation.

## 🎯 Overview

The quiz application now supports **7 different LLM providers** in order of preference:

1. **OpenAI GPT-3.5/4** (Primary) - Best for production
2. **Google Gemini** (Secondary) - Excellent alternative
3. **Anthropic Claude** (Tertiary) - High quality responses
4. **Cohere** (Quaternary) - Good for specific tasks
5. **Hugging Face** (Quinary) - Open source models
6. **Ollama Local** (Sextary) - Self-hosted option
7. **Local Hugging Face** (Septenary) - Specialized local models

## 🔑 API Keys Setup

### 1. OpenAI (Recommended for Production)
```bash
# Get API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 2. Google Gemini
```bash
# Get API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Anthropic Claude
```bash
# Get API key from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
```

### 4. Cohere
```bash
# Get API key from: https://dashboard.cohere.ai/
COHERE_API_KEY=your-cohere-api-key-here
```

### 5. Hugging Face
```bash
# Get API key from: https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=hf-your-huggingface-api-key-here
```

### 6. Ollama (Local)
```bash
# Set Ollama URL (default: http://localhost:11434)
OLLAMA_URL=http://localhost:11434
```

### 7. Local Hugging Face Model
```bash
# Set Local HF URL (default: http://localhost:8000)
LOCAL_HF_URL=http://localhost:8000
```

## 🚀 Environment Variables

Add these to your `.env.local` file in the `quiz-frontend` directory:

```env
# Primary LLM (OpenAI)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Secondary LLM (Google Gemini)
GEMINI_API_KEY=your-gemini-api-key-here

# Tertiary LLM (Anthropic Claude)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here

# Quaternary LLM (Cohere)
COHERE_API_KEY=your-cohere-api-key-here

# Quinary LLM (Hugging Face)
HUGGINGFACE_API_KEY=hf-your-huggingface-api-key-here

# Sextary LLM (Ollama Local)
OLLAMA_URL=http://localhost:11434

# Septenary LLM (Local Hugging Face)
LOCAL_HF_URL=http://localhost:8000
```

## 🔧 Vercel Deployment

For Vercel deployment, add these environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each API key with the exact names above

## 💰 Cost Comparison

| Provider | Cost per 1K tokens | Best For | Notes |
|----------|-------------------|----------|-------|
| OpenAI GPT-3.5 | $0.0015 | Production | Most reliable, good pricing |
| Google Gemini | Free tier available | Development | Generous free tier |
| Anthropic Claude | $0.003 | High quality | Excellent reasoning |
| Cohere | $0.001 | Specific tasks | Good for structured output |
| Hugging Face | Free tier available | Open source | Community models |
| Ollama Local | $0 | Self-hosted | No API costs, requires setup |
| Local HF | $0 | Specialized | Custom models, requires setup |

## 🛠️ Local Model Setup (Optional)

### Local Ollama Setup

If you want to use local models:

1. **Install Ollama:**
   ```bash
   # macOS/Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Windows
   # Download from: https://ollama.ai/download
   ```

2. **Pull a model:**
   ```bash
   ollama pull llama2
   ollama pull mistral
   ollama pull codellama
   ```

3. **Start Ollama service:**
   ```bash
   ollama serve
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:11434/api/generate -d '{
     "model": "llama2",
     "prompt": "Hello, how are you?"
     }'
  ```

### Local Hugging Face Setup

If you want to use specialized local models like Solidity-LLM:

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements_local_hf.txt
   ```

2. **Start the local server:**
   ```bash
   python local_hf_server.py
   ```

3. **Test the API:**
   ```bash
   curl http://localhost:8000/health
   curl -X POST http://localhost:8000/generate \
     -H "Content-Type: application/json" \
     -d '{
       "prompt": "Generate 3 easy questions about Python programming",
       "max_length": 1000,
       "temperature": 0.7
     }'
   ```

4. **Available endpoints:**
   - `GET /health` - Check server status
   - `POST /generate` - Generate quiz questions
   - `GET /models` - List available models
   - `POST /reload` - Reload the model

## 🔄 Fallback Logic

The system automatically tries providers in this order:

1. **OpenAI** → If fails or not configured
2. **Google Gemini** → If fails or not configured  
3. **Anthropic Claude** → If fails or not configured
4. **Cohere** → If fails or not configured
5. **Hugging Face** → If fails or not configured
6. **Ollama Local** → If fails or not configured
7. **Local Hugging Face** → If fails or not configured
8. **Enhanced Fallback** → Always works (no API needed)

## 📊 Provider Comparison

| Feature | OpenAI | Gemini | Claude | Cohere | HF | Ollama | Local HF |
|---------|--------|--------|--------|--------|----|--------|----------|
| Ease of Setup | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐ |
| Response Quality | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Cost | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Reliability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Speed | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

## 🎯 Recommended Setup

### For Production:
```env
OPENAI_API_KEY=sk-your-key
GEMINI_API_KEY=your-key
ANTHROPIC_API_KEY=sk-ant-your-key
```

### For Development:
```env
GEMINI_API_KEY=your-key  # Free tier
COHERE_API_KEY=your-key  # Free tier
```

### For Self-Hosted:
```env
OLLAMA_URL=http://localhost:11434
LOCAL_HF_URL=http://localhost:8000
```

## 🔍 Testing Your Setup

1. **Check API Keys:**
   ```bash
   # The app will log which providers are available
   npm run dev
   ```

2. **Test Quiz Generation:**
   - Go to the quiz creation page
   - Enter any topic
   - Check browser console for provider logs

3. **Monitor Fallbacks:**
   - If one provider fails, the system automatically tries the next
   - All logs show which provider is being used

## 🚨 Troubleshooting

### Common Issues:

1. **"API key not configured"**
   - Check environment variable names
   - Ensure keys are added to Vercel if deployed

2. **"Rate limit exceeded"**
   - System automatically falls back to next provider
   - Consider upgrading API plan

3. **"Network error"**
   - Check internet connection
   - Verify API endpoints are accessible

4. **"Invalid response format"**
   - Some providers may return different JSON formats
   - System falls back to next provider automatically

### Debug Mode:
The app logs detailed information about:
- Which providers are configured
- Which provider is being used
- Success/failure of each attempt
- Fallback to next provider

## 🎉 Benefits

✅ **High Availability** - Multiple fallbacks ensure quiz generation always works
✅ **Cost Optimization** - Use cheaper providers when possible
✅ **Quality Assurance** - Different providers offer different strengths
✅ **No Single Point of Failure** - If one provider is down, others continue working
✅ **Flexibility** - Choose providers based on your needs and budget

## 📝 Notes

- **No API keys required** - The enhanced fallback generator always works
- **Automatic fallback** - System tries providers in order until one succeeds
- **Detailed logging** - Check console for provider status and errors
- **Cost control** - Start with free tiers, upgrade as needed
- **Local option** - Ollama provides completely offline capability

This robust system ensures your quiz application will always generate questions, regardless of API availability or costs! 