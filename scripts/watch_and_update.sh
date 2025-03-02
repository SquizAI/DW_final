#!/bin/bash

# watch_and_update.sh
# Script to watch for file changes and update documentation

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WATCH_DIRS=(
  "${PROJECT_ROOT}/frontend/src"
  "${PROJECT_ROOT}/backend/app"
)
UPDATE_SCRIPT="${PROJECT_ROOT}/scripts/auto_update_docs.sh"

# Check if fswatch is installed
if ! command -v fswatch &> /dev/null; then
  echo "fswatch is not installed. Please install it first."
  echo "On macOS: brew install fswatch"
  echo "On Ubuntu: sudo apt-get install fswatch"
  exit 1
fi

# Function to update documentation
update_docs() {
  echo "File change detected. Updating documentation..."
  bash "$UPDATE_SCRIPT"
  echo "Documentation updated. Watching for changes..."
}

# Watch for file changes
watch_files() {
  echo "Watching for file changes in:"
  for dir in "${WATCH_DIRS[@]}"; do
    echo "- $dir"
  done
  echo "Press Ctrl+C to stop watching."
  
  # Initial update
  update_docs
  
  # Watch for changes
  fswatch -0 "${WATCH_DIRS[@]}" | while read -d "" event; do
    update_docs
  done
}

# Main function
main() {
  watch_files
}

# Run the main function
main 