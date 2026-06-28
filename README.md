# Life Compass

Alat bantu keputusan karir berbasis AI. Frontend: Cloudflare Pages. Backend: FastAPI + SQLite on STB.

## Architecture

- Frontend: Next.js + TypeScript + Tailwind → Cloudflare Pages
- Backend: FastAPI + SQLAlchemy + SQLite → Docker on STB HG680P
- Tunnel: Cloudflare Tunnel (cloudflared) → STB port 8000
- Storage: External HDD mounted at /data (SQLite, uploads, backups)

## Domain Structure

| Domain | Service |
|--------|---------|
| lifecompass.arishia.cyou | Frontend (Cloudflare Pages) |
| api-lifecompass.arishia.cyou | Backend API (Cloudflare Tunnel → STB:8000) |

## Required Environment Variables

### backend/.env

| Variable | Description |
|----------|-------------|
| APP_ENV | Environment mode: development, staging, production |
| DATABASE_URL | SQLite database connection string |
| DATA_DIR | Directory for data storage |
| FRONTEND_URL | Frontend URL for CORS |
| API_PUBLIC_URL | Public API URL |
| SECRET_KEY | JWT access token signing key |
| REFRESH_TOKEN_SECRET | JWT refresh token signing key |
| REFLECTION_ENCRYPTION_KEY | Encryption key for reflection data |
| ALGORITHM | JWT algorithm (HS256) |
| ACCESS_TOKEN_EXPIRE_MINUTES | Access token TTL |
| REFRESH_TOKEN_EXPIRE_DAYS | Refresh token TTL |
| GOOGLE_CLIENT_ID | Google OAuth client ID |
| GEMINI_API_KEY | Google Gemini API key for AI features |
| ADMIN_EMAILS | Comma-separated admin email addresses |
| INITIAL_ADMIN_EMAIL | Email for admin auto-seed |
| INITIAL_ADMIN_PASSWORD | Password for admin auto-seed |
| CORS_ALLOWED_ORIGINS | Comma-separated CORS origins |
| CLOUDFLARED_TOKEN | Cloudflare Tunnel token |
| R2_BACKUP_ENABLED | Enable R2 backup (true/false) |
| R2_BUCKET | Cloudflare R2 bucket name |
| R2_ACCOUNT_ID | Cloudflare R2 account ID |
| R2_ACCESS_KEY_ID | Cloudflare R2 access key |
| R2_SECRET_ACCESS_KEY | Cloudflare R2 secret key |
| CACHE_ENABLED | Enable response caching |
| CAREER_DATA_VERSION | Career data schema version |

### frontend/.env.local

```
NEXT_PUBLIC_API_URL=https://api-lifecompass.arishia.cyou
NEXT_PUBLIC_APP_URL=https://lifecompass.arishia.cyou
```

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

## Deployment to STB (Portfolio style)

1. SSH into STB
2. cd /path/to/life-compass
3. git pull
4. Ensure backend/.env is configured
5. ./scripts/deploy_stb.sh

### First time setup

1. Copy .env.example to backend/.env and fill in values
2. mkdir -p data backups
3. docker compose build app
4. docker compose -f docker-compose.yml -f docker-compose.tunnel.yml up -d
5. Verify: curl http://localhost:8000/api/health

## Cloudflare Pages Setup

1. Connect GitHub repo
2. Build command: cd frontend && npm install && npm run build
3. Build output: frontend/out
4. Environment variables:
   - NEXT_PUBLIC_API_URL: https://api-lifecompass.arishia.cyou
   - NEXT_PUBLIC_APP_URL: https://lifecompass.arishia.cyou
   - NODE_VERSION: 18

## Cloudflare Tunnel Setup

1. Dashboard → Zero Trust → Networks → Tunnels
2. Create tunnel → get token
3. Set CLOUDFLARED_TOKEN in backend/.env
4. Public hostname: api-lifecompass.arishia.cyou → service: http://localhost:8000

## Backup

Daily cron:

```
0 3 * * * cd /path/to/life-compass && ./scripts/backup_sqlite.sh
```

Optional R2 backup: set R2_* env vars and R2_BACKUP_ENABLED=true

## Update

```bash
cd /path/to/life-compass
git pull
./scripts/deploy_stb.sh
```

## Smoke Tests

```bash
./scripts/healthcheck.sh
```

Or with remote URL:

```bash
./scripts/healthcheck.sh https://api-lifecompass.arishia.cyou
```

## API Endpoints

### Public

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| GET | /api/careers/ | List careers (optional category filter) |
| GET | /api/careers/{id} | Get career detail |
| GET | /api/sample-report | Get sample AI report |
| GET | /api/admin/landing-page | Get landing page content |

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register email/password |
| POST | /api/auth/login | Login (email/password or Google token) |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Logout (revoke refresh token) |
| DELETE | /api/auth/account | Delete account |
| GET | /api/auth/export | Export user data |

### Discovery (Authenticated)

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/discovery/submit | Submit discovery answers |
| GET | /api/discovery/history | Get discovery history |
| GET | /api/discovery/result/{match_id} | Get specific result |
| GET | /api/discovery/experiments | Get experiment plans |
| PUT | /api/discovery/experiments/{plan_id}/tasks/{task_index} | Update task status |


### Chat (Authenticated)

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/chat/ | Send chat message |

### User Profile (Authenticated)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/user/profile | Get profile |
| PUT | /api/user/profile | Update profile |

### Admin

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/stats | Dashboard statistics |
| GET | /api/admin/users | List all users |
| GET | /api/admin/users/{id} | Get user detail |
| GET | /api/admin/careers | List careers |
| POST | /api/admin/careers | Create career |
| PUT | /api/admin/careers/{id} | Update career |
| DELETE | /api/admin/careers/{id} | Delete career |
| POST | /api/admin/careers/generate | AI-generate career data |
| GET | /api/admin/landing-page | Get landing page |
| PUT | /api/admin/landing-page | Update landing page |
| GET | /api/admin/settings | Get admin settings |
| PUT | /api/admin/settings | Update admin settings |
