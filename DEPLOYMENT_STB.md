# Life Compass — STB Deployment Guide

## Architecture

| Component | Location | URL |
|-----------|----------|-----|
| Frontend | Cloudflare Pages (static export) | `https://lifecompass.arishia.cyou` |
| Backend | Docker on STB HG680P | `https://api-lifecompass.arishia.cyou` |
| Database | SQLite on external HDD (`/data/life_compass.db`) | — |
| Tunnel | Cloudflared (Docker, host network) | — |

## First-Time Setup (One-Time)

### 1. Server Setup on STB

```bash
git clone <repo-url> /opt/life-compass
cd /opt/life-compass
cp backend/.env.example backend/.env
```

### 2. Configure Environment

Edit `backend/.env`:

```env
APP_ENV=production
FRONTEND_URL=https://lifecompass.arishia.cyou
API_PUBLIC_URL=https://api-lifecompass.arishia.cyou
DATABASE_URL=sqlite:////data/life_compass.db
DATA_DIR=/data
SECRET_KEY=<run: openssl rand -hex 32>
REFRESH_TOKEN_SECRET=<run: openssl rand -hex 32>
REFLECTION_ENCRYPTION_KEY=<run: openssl rand -base64 32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
GOOGLE_REDIRECT_URI=https://api-lifecompass.arishia.cyou/api/auth/google/callback
COOKIE_DOMAIN=.arishia.cyou
GEMINI_API_KEY=<your Gemini API key>
ADMIN_EMAILS=
INITIAL_ADMIN_EMAIL=<your-admin@email.com>
INITIAL_ADMIN_PASSWORD=<strong-password>
CORS_ALLOWED_ORIGINS=https://lifecompass.arishia.cyou
CLOUDFLARED_TOKEN=<your Cloudflare Tunnel token>
CACHE_ENABLED=true
CAREER_DATA_VERSION=1
```

### 3. Verify Environment

```bash
python3 scripts/check_production_env.py
```

### 4. Deploy

```bash
./scripts/deploy_stb.sh
```

### 5. Verify

```bash
./scripts/healthcheck.sh
python3 scripts/smoke_test.py
```

---

## Subsequent Updates (Code Changes Only)

### Important: Do NOT edit `backend/.env` during updates

The `.env` file is permanent configuration. It is never overwritten by deploy scripts.

```bash
cd /opt/life-compass
git pull                              # Pull latest code
docker compose build --no-cache app   # Rebuild backend image
docker compose up -d app              # Restart backend
```

Or use the deploy script (it checks `.env` exists and never overwrites):

```bash
./scripts/deploy_stb.sh
```

### What the deploy script does:
1. `git pull` — pulls latest code
2. Checks `backend/.env` exists (errors if missing)
3. `docker compose build app` — rebuilds backend image
4. `docker compose up -d app cloudflared` — restarts containers
5. Runs health check

### What the deploy script does NOT do:
- ❌ Copy `backend/.env.example` over `backend/.env`
- ❌ Edit or regenerate `.env`
- ❌ Delete `backend/.env`
- ❌ Ask you to reconfigure Google OAuth

---

## Environment Variable Safety

### Required (app will crash without these):
- `SECRET_KEY`
- `REFRESH_TOKEN_SECRET`

### Required for Google OAuth:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (must be `https://api-lifecompass.arishia.cyou/api/auth/google/callback`)

### Recommended:
- `GEMINI_API_KEY` — enables AI-powered recommendations and assistant
- `REFLECTION_ENCRYPTION_KEY` — encrypts user reflections at rest
- `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` — creates admin on first start

### Check Missing Variables

```bash
python3 scripts/check_production_env.py
```

This script checks variable *names* only — it never prints secret values.

---

## Backend Health Check

```bash
# Quick health
curl https://api-lifecompass.arishia.cyou/api/health

# Full smoke test
python3 scripts/smoke_test.py

# Basic endpoint checks
./scripts/healthcheck.sh
```

---

## Backup & Restore

### Backup SQLite database

```bash
./scripts/backup_sqlite.sh
```

Backups go to `/data/backups/`.

### Restore

```bash
./scripts/restore_sqlite.sh /data/backups/life_compass_2026-06-28.db
```

---

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Backend won't start | `docker compose logs app` |
| Health check fails | `docker compose ps`, check port 8000 |
| Google login returns "not configured" | Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in `.env` |
| Assistant refuses questions | Check GEMINI_API_KEY; if missing, assistant uses limited fallback mode |
| Frontend can't reach API | Check `NEXT_PUBLIC_API_URL` in Cloudflare Pages env vars |
| CORS errors in browser | Check `CORS_ALLOWED_ORIGINS` includes the frontend URL |
