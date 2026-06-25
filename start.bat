@echo off
REM 🚀 QUICK START SCRIPT FOR APEXSTRIDE (Windows)
REM Run this to set up and start the development environment

echo 👋 Welcome to AuraKinematics Local Setup!
echo ========================================
echo.

REM Check Node.js version
echo 🔍 Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install Node.js 18+
    echo    Visit: https://nodejs.org
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%
echo.

REM Navigate to web directory
echo 📋 Setting up frontend...
cd web

REM Check for node_modules
if not exist "node_modules" (
    echo 💾 Installing npm packages...
    call npm install
    echo ✅ Dependencies installed
    echo.
) else (
    echo ✅ node_modules already exists, skipping install
    echo.
)

REM Check for .env.local
echo 🖥️ Setting up environment variables...
if not exist ".env.local" (
    echo 📝 Creating .env.local from .env.example
    copy .env.example .env.local
    echo ⚠️  Please update .env.local with your Supabase credentials
) else (
    echo ✅ .env.local already exists
    echo.
)

REM Start development server
echo.
echo 🚀 Starting development server...
echo ========================================
echo.
echo 📱 Open: http://localhost:3000
echo 🔍 API: http://localhost:8000 (backend)
echo 🛑 Press Ctrl+C to stop
echo.

call npm run dev
pause
