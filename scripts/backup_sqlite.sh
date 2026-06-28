#!/bin/bash
set -e

BACKUP_DIR="${BACKUP_DIR:-/data/backups}"
DB_PATH="${DB_PATH:-/data/life_compass.db}"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/life_compass_$TIMESTAMP.db"

echo "=== SQLite Backup ==="

if [ ! -f "$DB_PATH" ]; then
  echo "No database found at $DB_PATH"
  exit 0
fi

sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"
gzip "$BACKUP_FILE"
echo "Backup created: $BACKUP_FILE.gz"

# Clean old backups
find "$BACKUP_DIR" -name "life_compass_*.db.gz" -mtime +$RETENTION_DAYS -delete
echo "Cleaned backups older than $RETENTION_DAYS days"

echo "=== Backup complete ==="
