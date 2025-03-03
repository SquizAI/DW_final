#!/bin/bash

# Default port
PORT=${1:-8001}

echo "Starting Data Whisperer backend on port $PORT..."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "Virtual environment activated"
fi

# Set environment variables
export PORT=$PORT

# Start the FastAPI application
python -m uvicorn main:app --host 0.0.0.0 --port $PORT --reload

# Note: If you're getting "address already in use" errors, try:
# 1. Check what's using the port: lsof -i :8000
# 2. Kill the process: kill -9 <PID>
# 3. Or simply use a different port: ./start_backend.sh 8001 