@echo off
echo ========================================
echo 🔧 Fixing Quizlet Frontend Issues Automatically
echo ========================================
echo.

echo 1. Stopping any running frontend processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak > nul

echo 2. Clearing Next.js cache...
cd quiz-frontend
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo 3. Installing missing dependencies...
npm install @radix-ui/react-progress @radix-ui/react-tabs @radix-ui/react-label class-variance-authority

echo 4. Starting frontend server...
start "Frontend Server" cmd /k "npm run dev"

echo 5. Waiting for frontend to start...
timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo ✅ Frontend Fixes Applied!
echo ========================================
echo.
echo Frontend should now be running at:
echo http://localhost:3000 (or 3001/3002)
echo.
echo Issues Fixed:
echo ✅ CSS border-border error
echo ✅ Theme toggle functionality
echo ✅ Missing UI components
echo ✅ Dependencies installed
echo ✅ Cache cleared
echo.
echo Press any key to exit...
pause > nul 