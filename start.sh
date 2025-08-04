#!/bin/bash

# vLedger Quick Start Script
echo "🚀 Starting vLedger System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install backend dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

# Install admin panel dependencies if not already installed
if [ ! -d "admin/node_modules" ]; then
    echo "📦 Installing admin panel dependencies..."
    cd admin && npm install && cd ..
else
    echo "✅ Admin panel dependencies already installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "🔧 Creating .env file from .env.example..."
    cp .env.example .env
    echo "📝 Please update .env file with your database configuration if needed"
else
    echo "✅ .env file exists"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run generate

# Check if database exists, if not create it
if [ ! -f "dev.db" ]; then
    echo "🗄️ Creating database..."
    npx prisma migrate dev --name init
    
    echo "🌱 Seeding database with sample data..."
    npx ts-node scripts/seed.ts
else
    echo "✅ Database already exists"
fi

echo ""
echo "🎉 Setup complete! Starting the application..."
echo ""
echo "📊 Admin Panel: http://localhost:3001"
echo "🔌 API Server: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the servers"
echo ""

# Start both servers
echo "Starting API server and Admin panel..."
(npm run dev) &
(cd admin && npm run dev) &

# Wait for user to stop
wait
