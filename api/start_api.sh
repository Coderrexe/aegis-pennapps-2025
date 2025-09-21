#!/bin/bash

# PennApps Crime Data API Startup Script

echo "🚀 Starting PennApps Crime Data API..."
echo "======================================="

# Activate conda environment
echo "📦 Activating conda environment..."
eval "$(conda shell.bash hook)"
conda activate pennApps-crime-api

# Check if port 5000 is available, otherwise use 5001
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5000 is busy, using port 5001..."
    export PORT=5001
    echo "🌐 API will be available at: http://localhost:5001"
else
    export PORT=5000
    echo "🌐 API will be available at: http://localhost:5000"
fi

echo "📍 Perfect for your PennApps navigation project!"
echo "📚 Check README.md for API documentation"
echo "🧪 Run 'python test_api.py' in another terminal to test"
echo ""

# Start the API
python run.py
