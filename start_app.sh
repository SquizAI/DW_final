#!/bin/bash

# Default backend port
BACKEND_PORT=${1:-8001}

echo "Starting Data Whisperer application..."
echo "Backend will run on port $BACKEND_PORT"
echo "Frontend will run on port 5173"

# Create a temporary .env.local file for the frontend
cat > frontend/.env.local << EOL
VITE_API_URL=http://localhost:$BACKEND_PORT
VITE_APP_NAME=Data Whisperer
VITE_APP_VERSION=1.0.0
EOL

echo "Created frontend/.env.local with backend port $BACKEND_PORT"

# Start the backend in the background
echo "Starting backend..."
cd backend
./start_backend.sh $BACKEND_PORT &
BACKEND_PID=$!
cd ..

# Start the frontend
echo "Starting frontend..."
cd frontend
./start_frontend.sh

# When the frontend is stopped, also stop the backend
kill $BACKEND_PID
echo "Application stopped." 