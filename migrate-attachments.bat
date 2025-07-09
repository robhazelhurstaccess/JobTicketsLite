@echo off

echo Adding attachments table to database...

:: Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

:: Check if database exists
if not exist "tickets.db" (
    echo Database file not found. Please run 'npm run setup' first.
    pause
    exit /b 1
)

:: Run the migration
node add-attachments-table.js

echo Migration completed. You can now restart the server.
pause
