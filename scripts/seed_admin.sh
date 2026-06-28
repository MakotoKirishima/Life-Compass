#!/bin/bash
set -e

DB_PATH="${DB_PATH:-/data/life_compass.db}"

if [ ! -f "$DB_PATH" ]; then
  echo "No database found at $DB_PATH"
  echo "Start the backend first: docker compose up -d app"
  exit 1
fi

echo "=== Seed Admin User ==="

if [ -z "$INITIAL_ADMIN_EMAIL" ] || [ -z "$INITIAL_ADMIN_PASSWORD" ]; then
  echo "Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD in backend/.env"
  echo "Then restart the backend: docker compose restart app"
  exit 1
fi

echo "Admin will be created on next startup from backend/.env"
echo "Restart: docker compose restart app"
echo ""
echo "Or run manually:"
echo "  docker compose exec app python -c \"from app.main import _seed_admin; _seed_admin()\""
