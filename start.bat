@echo off
REM JobTickets Lite - Quick Start Script for Windows

echo 🎫 JobTickets Lite - Quick Start
echo ================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
) else (
    echo ✅ Dependencies are already installed
)

REM Check if database exists
if not exist "tickets.db" (
    echo 🗄️  Initializing database...
    node backend/models/database.js
) else (
    echo ✅ Database already exists
)

echo.
echo 🚀 Starting JobTickets Lite server...
echo 📱 Open your browser and navigate to: http://localhost:3000
echo 🔑 Default login: admin / admin123
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
npm run dev
