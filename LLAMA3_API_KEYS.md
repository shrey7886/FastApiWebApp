# Llama3 API Key Integration Guide

This guide explains how to integrate Llama3 API keys from various cloud providers with your quiz application.

## 🦙 Current Setup: Local Llama3 (Recommended)

Our current implementation uses **Ollama** which runs Llama3 locally and **doesn't require an API key**:

```env
# .env file - No API key needed
LLAMA3_API_URL=http://localhost:11434/api/generate
LLAMA3_MODEL=llama3.2:3b
LLAMA3_MAX_TOKENS=2000
LLAMA3_TEMPERATURE=0.7
```

**Benefits:**
- ✅ No API costs
- ✅ Privacy (all processing local)
- ✅ No rate limits
- ✅ No internet dependency

## 🔑 Cloud-Based Llama3 API Options

If you prefer cloud-based Llama3 services, here are the available options:

### Option 1: Meta's Official Llama API

**Setup:**
1. Visit [Meta's Llama API](https://llama-api.com/)
2. Sign up and get your API key
3. Configure your `.env` file:

```env
# Meta Llama API Configuration
LLAMA3_PROVIDER=meta
LLAMA3_API_KEY=your_meta_api_key_here
LLAMA3_MODEL=llama-3.2-3b
LLAMA3_MAX_TOKENS=2000
LLAMA3_TEMPERATURE=0.7
```

**Pricing:** Pay-per-use model
**Models Available:** llama-3.2-3b, llama-3.2-7b, llama-3.2-13b, llama-3.2-70b

### Option 2: Together AI

**Setup:**
1. Visit [Together AI](https://together.ai/)
2. Sign up and get your API key
3. Configure your `.env` file:

```env
# Together AI Configuration
LLAMA3_PROVIDER=together
LLAMA3_API_KEY=your_together_api_key_here
LLAMA3_MODEL=togethercomputer/llama-3.2-3b
LLAMA3_MAX_TOKENS=2000
LLAMA3_TEMPERATURE=0.7
```

**Pricing:** Competitive pay-per-use
**Models Available:** Various Llama3 models and other open-source models

### Option 3: Replicate

**Setup:**
1. Visit [Replicate](https://replicate.com/)
2. Sign up and get your API key
3. Configure your `.env` file:

```env
# Replicate Configuration
LLAMA3_PROVIDER=replicate
LLAMA3_API_KEY=your_replicate_api_key_here
LLAMA3_MODEL=meta/llama-3.2-3b
LLAMA3_MAX_TOKENS=2000
LLAMA3_TEMPERATURE=0.7
```

**Pricing:** Pay-per-use with free tier
**Models Available:** Llama3 and many other models

### Option 4: Custom API Endpoint

**Setup:**
If you have your own Llama3 API endpoint:

```env
# Custom API Configuration
LLAMA3_PROVIDER=custom
LLAMA3_API_KEY=your_api_key_here
LLAMA3_API_URL=https://your-llama3-api.com/v1/chat/completions
LLAMA3_MODEL=llama-3.2-3b
LLAMA3_MAX_TOKENS=2000
LLAMA3_TEMPERATURE=0.7
```

## 🔧 Integration Steps

### Step 1: Choose Your Provider

Decide which cloud provider you want to use:
- **Meta**: Official provider, reliable
- **Together AI**: Good pricing, many models
- **Replicate**: Easy setup, good free tier
- **Custom**: Your own infrastructure

### Step 2: Get API Key

Follow the provider's signup process:
1. Create account
2. Verify email
3. Generate API key
4. Copy the key

### Step 3: Configure Environment

Update your `.env` file with the appropriate configuration:

```env
# Choose one of these configurations:

# For Meta
LLAMA3_PROVIDER=meta
LLAMA3_API_KEY=your_meta_api_key_here

# For Together AI
LLAMA3_PROVIDER=together
LLAMA3_API_KEY=your_together_api_key_here

# For Replicate
LLAMA3_PROVIDER=replicate
LLAMA3_API_KEY=your_replicate_api_key_here

# For Custom API
LLAMA3_PROVIDER=custom
LLAMA3_API_KEY=your_api_key_here
LLAMA3_API_URL=https://your-api-endpoint.com/v1/chat/completions

# Common settings
LLAMA3_MODEL=llama-3.2-3b
LLAMA3_MAX_TOKENS=2000
LLAMA3_TEMPERATURE=0.7
```

### Step 4: Update AI Service

Modify `ai_service.py` to use the cloud service:

```python
# Add this import at the top
from llama3_cloud_service import llama3_cloud_service

# In the generate_quiz_questions function, replace:
# questions = llama3_service.generate_quiz_questions(topic, num_questions, difficulty)
# with:
questions = llama3_cloud_service.generate_quiz_questions(topic, num_questions, difficulty)
```

### Step 5: Test Integration

Run the test script:

```bash
python test_llama3_cloud.py
```

## 🧪 Testing Cloud Integration

Create a test script for cloud API:

```python
# test_llama3_cloud.py
import os
from dotenv import load_dotenv
from llama3_cloud_service import llama3_cloud_service

load_dotenv()

def test_cloud_api():
    """Test cloud-based Llama3 API"""
    print("🔍 Testing Llama3 Cloud API...")
    
    try:
        questions = llama3_cloud_service.generate_quiz_questions(
            "Python Programming", 3, "medium"
        )
        
        if questions:
            print(f"✅ Successfully generated {len(questions)} questions!")
            for i, q in enumerate(questions, 1):
                print(f"Q{i}: {q['question']}")
        else:
            print("❌ No questions generated")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_cloud_api()
```

## 💰 Cost Comparison

| Provider | Free Tier | Cost per 1M tokens | Notes |
|----------|-----------|-------------------|-------|
| **Local (Ollama)** | ✅ Unlimited | $0 | One-time model download |
| Meta | ❌ | ~$0.20 | Official provider |
| Together AI | ✅ $25 credit | ~$0.15 | Good pricing |
| Replicate | ✅ 500 requests | ~$0.10 | Good free tier |

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate API keys** regularly
4. **Monitor usage** to avoid unexpected charges
5. **Set up billing alerts** with your provider

## 🚨 Troubleshooting

### Common Issues

**1. API Key Not Found**
```bash
# Check your .env file
cat .env | grep LLAMA3_API_KEY
```

**2. Invalid API Key**
```bash
# Test with curl
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"llama-3.2-3b","messages":[{"role":"user","content":"Hello"}]}' \
     https://api.llama-api.com/chat/completions
```

**3. Rate Limiting**
```bash
# Check your provider's rate limits
# Consider implementing retry logic
```

**4. Model Not Available**
```bash
# Check available models with your provider
# Update LLAMA3_MODEL in .env
```

## 🔄 Switching Between Local and Cloud

You can easily switch between local and cloud providers:

### Local Mode (Default)
```env
# Use local Ollama
LLAMA3_API_URL=http://localhost:11434/api/generate
LLAMA3_MODEL=llama3.2:3b
```

### Cloud Mode
```env
# Use cloud provider
LLAMA3_PROVIDER=meta
LLAMA3_API_KEY=your_api_key_here
LLAMA3_MODEL=llama-3.2-3b
```

## 📊 Performance Comparison

| Aspect | Local (Ollama) | Cloud API |
|--------|----------------|-----------|
| **Speed** | 3-8 seconds | 1-3 seconds |
| **Cost** | $0 | $0.10-0.20 per 1M tokens |
| **Privacy** | ✅ Full | ❌ Data sent to provider |
| **Reliability** | Depends on hardware | High uptime |
| **Setup** | Requires Ollama | Just API key |

## 🎯 Recommendation

**For Development/Testing:** Use local Ollama (no API key needed)
**For Production:** Consider cloud API for better reliability and speed
**For Privacy-Critical Apps:** Stick with local Ollama

## 📞 Support

If you encounter issues:

1. **Check provider documentation**
2. **Verify API key format**
3. **Test with curl first**
4. **Check rate limits**
5. **Monitor billing/usage**

## 🎉 Success!

Once configured, your quiz app will use the cloud-based Llama3 API for generating questions, providing:

- ✅ Fast response times
- ✅ High reliability
- ✅ Scalability
- ✅ Professional support

Remember to monitor your usage and costs! 🚀 