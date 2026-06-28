#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file.gz>"
  echo "Available backups:"
  ls -lh /data/backups/*.gz 2>/dev/null || echo "No backups found"
  exit 1
fi

BACKUP_FILE="$1"
DB_PATH="${DB_PATH:-/data/life_compass.db}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "=== Restore SQLite ==="
echo "Restoring from: $BACKUP_FILE"
echo "Target: $DB_PATH"
echo ""
read -p "This will OVERWRITE the current database. Continue? (y/N) " CONFIRM
if [ "$CONFIRM" != "y" ]; then
  echo "Cancelled."
  exit 0
fi

if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" > /tmp/restore_temp.db
  sqlite3 "$DB_PATH" ".restore '/tmp/restore_temp.db'"
  rm /tmp/restore_temp.db
else
  sqlite3 "$DB_PATH" ".restore '$BACKUP_FILE'"
fi

echo "Restore complete. Restart the backend: docker compose restart app"
