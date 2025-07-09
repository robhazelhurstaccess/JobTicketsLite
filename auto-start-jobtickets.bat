@echo off
REM JobTickets Lite - Auto Startup Script
REM Place this file in your Windows Startup folder

REM Start minimized to avoid cluttering desktop
if not "%1"=="minimized" (
    start /min "" "%~f0" minimized
    exit /b
)

REM Change to application directory
cd /d "C:\Users\Rob.Hazelhurst\git\jobticketslite"

REM Start the application in the background
start /b /min cmd /c "npm run dev"

REM Wait for server to start
timeout /t 5 /nobreak >nul

REM Open browser to login page
start http://localhost:3000/login.html

REM Exit this script (server continues running in background)
exit /b
