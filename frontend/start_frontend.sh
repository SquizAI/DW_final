#!/bin/bash

echo "Starting Data Whisperer frontend..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the development server
npm run dev -- --port 5173

# Note: If you're getting "address already in use" errors, try:
# 1. Check what's using the port: lsof -i :5173
# 2. Kill the process: kill -9 <PID>
# 3. Or use a different port: npm run dev -- --port 5174 