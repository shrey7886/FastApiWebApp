@echo off
echo Starting Quiziac Application...
echo.

echo Starting Backend Server (FastAPI)...
start "Backend Server" cmd /k "python -m uvicorn main:app --host 127.0.0.1 --port 8007"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server (Next.js)...
start "Frontend Server" cmd /k "cd quiz-frontend && npm run dev"

echo.
echo ========================================
echo 🚀 Quizlet Application Starting...
echo ========================================
echo.
echo Backend API:  http://127.0.0.1:8007
echo Frontend App: http://localhost:3000 (or 3001/3002)
echo.
echo ⚡ Access the app at: http://localhost:3000
echo.
echo Press any key to exit this launcher...
pause > nul 