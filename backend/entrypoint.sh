#!/bin/sh

# Create necessary directories
mkdir -p /app/data/kaggle
mkdir -p /app/uploads
mkdir -p /app/exports

# Set permissions
chmod -R 777 /app/data
chmod -R 777 /app/uploads
chmod -R 777 /app/exports

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! pg_isready -h db -p 5432 -U postgres; do
  sleep 1
done
echo "Database is ready!"

# Run initialization
echo "Running initialization..."
python -m app.run_init

# Start the application
echo "Starting application..."
exec "$@" 