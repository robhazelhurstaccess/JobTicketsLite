@echo off
echo Starting JobTickets Lite...
echo.

REM Change to the application directory
cd /d "C:\Users\Rob.Hazelhurst\git\jobticketslite"

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm packages are installed
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install npm packages
        pause
        exit /b 1
    )
)

REM Start the application in development mode
echo Starting JobTickets Lite server...
echo.
echo The application will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server in the background and open browser
start /b cmd /c "npm run dev"

REM Wait a moment for the server to start
timeout /t 3 /nobreak >nul

REM Open the default browser to the login page
start http://localhost:3000/login.html

REM Keep the window open to show server output
echo.
echo JobTickets Lite is running...
echo Close this window to stop the server.
echo.
pause
