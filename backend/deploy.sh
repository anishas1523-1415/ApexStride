#!/bin/bash
set -e

echo "==================================="
echo "AuraKinematics Production Deploy"
echo "==================================="

# Update codebase
echo "[1/4] Pulling latest changes..."
# git pull origin main

# Build containers
echo "[2/4] Building Docker images..."
docker-compose build

# Apply database migrations
echo "[3/4] Applying database migrations..."
# Assuming you have a .env file loaded or exported
docker-compose run --rm api alembic upgrade head

# Start services
echo "[4/4] Starting services in background..."
docker-compose up -d

echo "==================================="
echo "Deployment successful! Services are running."
echo "View logs with: docker-compose logs -f"
echo "==================================="
