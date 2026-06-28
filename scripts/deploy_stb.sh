#!/bin/bash
set -e

echo "=== Life Compass STB Deploy ==="

cd "$(dirname "$0")/.."

echo "1. Git pull..."
git pull

echo "2. Check .env..."
if [ ! -f backend/.env ]; then
  echo "ERROR: backend/.env not found. Copy .env.example and configure."
  exit 1
fi

echo "3. Build backend..."
docker compose build app

echo "4. Deploy backend + tunnel..."
docker compose -f docker-compose.yml -f docker-compose.tunnel.yml up -d --force-recreate app cloudflared

echo "5. Wait for health..."
sleep 5
curl -f http://localhost:8000/api/health || echo "WARNING: Health check failed"

echo "=== Deploy complete ==="
