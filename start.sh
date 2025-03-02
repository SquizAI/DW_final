#!/bin/bash

# Make script exit on first error
set -e

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to clean up containers on script exit
cleanup() {
    echo "Cleaning up..."
    docker-compose down
}

# Register cleanup function
trap cleanup EXIT

# Check Docker
check_docker

# Build and start services
echo "Building and starting services..."
docker-compose up --build

# Keep containers running
echo "Services are running. Press Ctrl+C to stop."
wait 