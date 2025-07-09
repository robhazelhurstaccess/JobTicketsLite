@echo off
title JobTickets Lite - Startup

REM ===================================================
REM JobTickets Lite - Startup Script
REM ===================================================

echo.
echo  =============================================
echo   Starting JobTickets Lite Application
echo  =============================================
echo.

REM Change to the application directory
cd /d "C:\Users\Rob.Hazelhurst\git\jobticketslite"

REM Verify we're in the correct directory
if not exist "package.json" (
    echo ERROR: Cannot find package.json
    echo Please check if the application is installed in the correct directory
    echo Expected location: C:\Users\Rob.Hazelhurst\git\jobticketslite
    pause
    exit /b 1
)

REM Check if Node.js is installed
echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do echo     Found Node.js %%i
)

REM Check if npm packages are installed
echo [2/4] Checking npm packages...
if not exist "node_modules" (
    echo     Installing npm packages (this may take a moment)...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install npm packages
        pause
        exit /b 1
    )
) else (
    echo     npm packages are already installed
)

REM Initialize database if needed
echo [3/4] Initializing database...
if not exist "tickets.db" (
    echo     Creating database...
    call npm run init-db
    if %errorlevel% neq 0 (
        echo ERROR: Failed to initialize database
        pause
        exit /b 1
    )
) else (
    echo     Database already exists
)

REM Start the application
echo [4/4] Starting JobTickets Lite server...
echo.
echo  =============================================
echo   JobTickets Lite is starting...
echo  =============================================
echo.
echo   Application URL: http://localhost:3000
echo   Login Page:      http://localhost:3000/login.html
echo.
echo   Default Login:
echo   - Username: admin
echo   - Password: admin123
echo.
echo   Alternative Login:
echo   - Username: Rob  
echo   - Password: password123
echo.
echo  =============================================
echo.

REM Start the server and open browser
echo Starting server...
start /b cmd /c "npm run dev 2>&1"

REM Wait for server to start
echo Waiting for server to start...
timeout /t 5 /nobreak >nul

REM Check if server is running by trying to connect
echo Checking server status...
for /L %%i in (1,1,10) do (
    ping 127.0.0.1 -n 1 >nul 2>&1
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -TimeoutSec 2 -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
    if %errorlevel% equ 0 (
        echo Server is running successfully!
        goto :server_ready
    )
    echo Waiting for server... (attempt %%i/10)
    timeout /t 2 /nobreak >nul
)

echo Warning: Server may not be fully ready, but opening browser anyway...

:server_ready
REM Open the browser to the login page
echo Opening browser...
start http://localhost:3000/login.html

echo.
echo  =============================================
echo   JobTickets Lite is now running!
echo  =============================================
echo.
echo   - Server is running in the background
echo   - Browser should open automatically
echo   - Close this window to stop the server
echo   - Press Ctrl+C to stop the server manually
echo.
echo  =============================================
echo.

REM Keep the window open
pause >nul
