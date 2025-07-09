#!/bin/bash

# JobTickets Lite - Quick Start Script
echo "🎫 JobTickets Lite - Quick Start"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies are already installed"
fi

# Check if database exists
if [ ! -f "tickets.db" ]; then
    echo "🗄️  Initializing database..."
    node backend/models/database.js
else
    echo "✅ Database already exists"
fi

echo ""
echo "🚀 Starting JobTickets Lite server..."
echo "📱 Open your browser and navigate to: http://localhost:3000"
echo "🔑 Default login: admin / admin123"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm run dev
