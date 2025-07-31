@echo off
echo 🚀 Deploying Quiz App with OpenAI AI-Powered Questions
echo ======================================================

echo.
echo 📋 Prerequisites:
echo - OpenAI API Key: [YOUR_OPENAI_API_KEY_HERE]
echo - Vercel CLI installed
echo.

echo 🔧 Setting up OpenAI API Key...
vercel env add OPENAI_API_KEY

echo.
echo 🏗️ Building the application...
npm run build

echo.
echo 🚀 Deploying to Vercel...
vercel --prod

echo.
echo ✅ Deployment complete!
echo 🌍 Your app is now live with AI-powered questions for users worldwide!
echo.
echo 🎯 Features:
echo - ✅ OpenAI GPT-3.5-turbo for question generation
echo - ✅ Any client from anywhere can access
echo - ✅ AI-powered questions for any topic
echo - ✅ Single URL deployment
echo.
echo 🎉 Enjoy your global quiz application! 