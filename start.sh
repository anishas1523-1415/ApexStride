#!/bin/bash

# 🚀 QUICK START SCRIPT FOR APEXSTRIDE
# Run this to set up and start the development environment

set -e

echo "👋 Welcome to AuraKinematics Local Setup!"
echo "========================================\n"

# Check Node.js version
echo "🔍 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    echo "   Visit: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js version: $NODE_VERSION\n"

# Navigate to web directory
echo "📋 Setting up frontend..."
cd web

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "💾 Installing npm packages..."
    npm install
    echo "✅ Dependencies installed\n"
else
    echo "✅ node_modules already exists, skipping install\n"
fi

# Check for .env.local
echo "🎛️ Setting up environment variables..."
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from .env.example"
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your Supabase credentials"
else
    echo "✅ .env.local already exists\n"
fi

# Start development server
echo "
🚀 Starting development server..."
echo "========================================\n"
echo "📱 Open: http://localhost:3000"
echo "🔍 API: http://localhost:8000 (backend)"
echo "🔽 Press Ctrl+C to stop\n"

npm run dev
