#!/bin/bash

# AgriFair Frontend Migration Script
# This script helps migrate from old frontend to new frontend

echo "🌱 AgriFair Frontend Migration Script"
echo "======================================"

# Check if we're in the right directory
if [ ! -d "NewFrontend/harat-farm-link-main" ]; then
    echo "❌ Error: Please run this script from the AgriFair root directory"
    exit 1
fi

echo "✅ Found new frontend directory"

# Navigate to new frontend
cd NewFrontend/harat-farm-link-main

echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🚀 Starting development server..."
echo "The new frontend will be available at: http://localhost:5173"
echo ""
echo "📋 Migration Checklist:"
echo "1. ✅ API integration completed"
echo "2. ✅ Login/Signup pages updated"
echo "3. ✅ Dashboard pages created"
echo "4. ✅ Navigation updated"
echo "5. ✅ Backend integration maintained"
echo ""
echo "🔧 Make sure your backend is running on http://localhost:8080"
echo ""

# Start the development server
npm run dev
