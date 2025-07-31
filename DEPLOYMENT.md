# 🚀 Deployment Guide - Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Neon Database**: Set up PostgreSQL database at [neon.tech](https://neon.tech)
4. **OpenAI API Key**: Get from [platform.openai.com](https://platform.openai.com)

## Step 1: Environment Variables Setup

### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
DATABASE_URL=postgresql://neondb_owner:password@ep-wild-tree-adgli2vl-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## Step 2: Update Next.js Configuration

Edit `quiz-frontend/next.config.js` and replace the backend URL:

```javascript
destination: process.env.NODE_ENV === 'production' 
  ? 'https://your-vercel-app.vercel.app/api/:path*'  // Your Vercel app URL
  : 'http://127.0.0.1:8001/:path*',
```

## Step 3: Deploy to Vercel

### Option A: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option B: GitHub Integration
1. Connect your GitHub repository to Vercel
2. Vercel will automatically deploy on push to main branch

## Step 4: Verify Deployment

1. **Frontend**: `https://your-app.vercel.app`
2. **Backend API**: `https://your-app.vercel.app/api/health`
3. **API Docs**: `https://your-app.vercel.app/api/docs`

## Step 5: Test the Application

1. **User Registration**: Create a new account
2. **Quiz Generation**: Test AI-powered quiz creation
3. **Analytics**: Check if data is being stored in Neon DB
4. **Chatbot**: Test the RAG-powered assistant

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check environment variables are set correctly
   - Ensure all dependencies are in package.json

2. **Database Connection**:
   - Verify DATABASE_URL is correct
   - Check Neon DB is accessible from Vercel

3. **API Errors**:
   - Check CORS configuration
   - Verify API routes are working

4. **Environment Variables**:
   - Ensure all required variables are set in Vercel
   - Check variable names match exactly

## Production Checklist

- [ ] Environment variables configured
- [ ] Database connection working
- [ ] Frontend builds successfully
- [ ] API endpoints responding
- [ ] User registration working
- [ ] Quiz generation functional
- [ ] Analytics tracking data
- [ ] Chatbot responding
- [ ] Error handling in place
- [ ] Performance optimized

## Monitoring

- **Vercel Analytics**: Monitor performance and errors
- **Neon DB Dashboard**: Check database performance
- **Application Logs**: Monitor API calls and errors

## Security Notes

- Keep environment variables secure
- Use strong SECRET_KEY
- Enable HTTPS (automatic with Vercel)
- Monitor for suspicious activity 