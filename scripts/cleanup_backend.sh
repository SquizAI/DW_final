#!/bin/bash

# cleanup_backend.sh
# Script to clean up multiple backend instances

echo "Checking for processes using port 8000..."

# Find processes using port 8000
PIDS=$(lsof -t -i:8000)

if [ -z "$PIDS" ]; then
  echo "No processes found using port 8000."
  exit 0
fi

echo "Found the following processes using port 8000:"
for PID in $PIDS; do
  PROCESS_INFO=$(ps -p $PID -o pid,ppid,user,command | tail -n +2)
  echo "$PROCESS_INFO"
done

echo ""
echo "Do you want to kill these processes? (y/n)"
read -r RESPONSE

if [[ "$RESPONSE" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  echo "Killing processes..."
  for PID in $PIDS; do
    echo "Killing process $PID..."
    kill -9 $PID
  done
  echo "All processes killed."
else
  echo "Operation cancelled."
fi

# Check if port is now available
sleep 1
if lsof -i:8000 > /dev/null; then
  echo "Warning: Port 8000 is still in use. Some processes may not have been killed."
else
  echo "Success: Port 8000 is now available."
fi
