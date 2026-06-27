# Cloudflare + STB Self-Hosting Deployment Template

Use this document as context for a new AI chat when deploying or debugging a project using the same pattern as the current `portfolio-cms` project.

This setup uses **Cloudflare as the public internet layer** and an **STB / low-power home server as the backend runtime**. The public website is served from Cloudflare, while private backend services remain on the STB and are exposed safely through Cloudflare Tunnel.

---

## 1. Main Goal

The goal of this architecture is to deploy web projects cheaply and safely on low-power hardware.

The preferred pattern is:

```txt
User Browser
   ↓
Cloudflare DNS / Worker / Pages / Tunnel
   ↓
Frontend from Cloudflare Pages or Worker
Backend/API/Admin from STB through Cloudflare Tunnel
   ↓
Docker containers on external HDD
   ↓
Database, storage, app services
```

The STB does **not** need a public IP address. Cloudflare Tunnel creates the outbound connection from the STB to Cloudflare.

---

## 2. Current Reference Project

Current project:

```txt
Project name: portfolio-cms
Repository: MakotoKirishima/Portofolio
STB path: /mnt/usb-hdd/portfolio-cms
Docker root: /mnt/usb-hdd/docker-root
Public domain: arishia.cyou
API domain: api.arishia.cyou
Admin domain: admin.arishia.cyou
Frontend Cloudflare project: arishia-frontend
Frontend origin used by Worker: https://arishia-frontend.pages.dev
```

Current intended routing:

```txt
https://arishia.cyou
https://www.arishia.cyou
    → Cloudflare Worker route
    → https://arishia-frontend.pages.dev
    → static frontend from apps/frontend

https://api.arishia.cyou
    → Cloudflare Tunnel
    → STB backend at http://127.0.0.1:3000
    → only public API routes should be accessible

https://admin.arishia.cyou
    → Cloudflare Tunnel
    → STB backend at http://127.0.0.1:3000
    → admin login/dashboard only
```

---

## 3. Reusable Domain Pattern for New Projects

For each new project, use a similar split:

```txt
Main website:
https://example.com
https://www.example.com

API:
https://api.example.com

Admin:
https://admin.example.com
```

Recommended routing:

```txt
example.com and www.example.com
    → Cloudflare Pages or Cloudflare Worker proxy
    → static frontend build

api.example.com
    → Cloudflare Tunnel
    → STB app container

admin.example.com
    → Cloudflare Tunnel
    → STB app container
```

Do not expose the STB directly to the internet with port forwarding unless there is a very specific reason. Prefer Cloudflare Tunnel.

---

## 4. Cloudflare Responsibilities

Cloudflare handles:

```txt
DNS
HTTPS certificates
Public routing
Worker proxy for frontend
Pages deployment for frontend
Tunnel routing to STB
Optional caching
Optional security rules
```

Cloudflare does **not** store the backend database. It is only the public entry layer.

### 4.1 DNS Records

For the root and www domains, use proxied placeholder records if the traffic is handled by a Worker route:

```txt
A @    192.0.2.1    Proxied
A www  192.0.2.1    Proxied
```

For API and admin domains, Cloudflare Tunnel usually creates CNAME-style tunnel records automatically.

Expected DNS/routing:

```txt
@ / root domain    → Worker route or Pages custom domain
www                → Worker route or Pages custom domain
api                → Cloudflare Tunnel
admin              → Cloudflare Tunnel
```

### 4.2 Frontend Worker Router

In the reference project, the root website is routed by a Worker that proxies to the Pages frontend.

Example Worker logic:

```js
const PAGES_ORIGIN = "https://PROJECT_FRONTEND.pages.dev";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = new URL(url.pathname + url.search, PAGES_ORIGIN);

    const headers = new Headers(request.headers);
    headers.set("Host", "PROJECT_FRONTEND.pages.dev");

    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "follow",
    });

    const finalResponse = new Response(response.body, response);
    finalResponse.headers.set("x-project-router", "frontend-worker");
    return finalResponse;
  },
};
```

Worker routes:

```txt
example.com/*
www.example.com/*
```

The header is useful for debugging:

```txt
x-project-router: frontend-worker
```

### 4.3 Cloudflare Pages Frontend

For frontend-only apps, use Cloudflare Pages or Worker Git deployment.

Typical frontend variables:

```txt
VITE_API_URL=https://api.example.com
VITE_MEDIA_BASE_URL=https://api.example.com/uploads
```

For the current project:

```txt
VITE_API_URL=https://api.arishia.cyou
VITE_MEDIA_BASE_URL=https://api.arishia.cyou/uploads
```

Important: Cloudflare frontend deployment is usually automatic after:

```bash
git push origin main
```

The frontend build runs on Cloudflare, not on the STB.

---

## 5. STB Responsibilities

The STB handles:

```txt
Backend app runtime
Database
Object/media storage
Docker containers
Cloudflared tunnel process
Persistent data on external HDD
Manual backend deployment
```

The STB should use the external HDD for project files, Docker data, database volumes, and storage volumes.

Current reference path:

```txt
/mnt/usb-hdd/portfolio-cms
/mnt/usb-hdd/docker-root
```

Recommended principle:

```txt
Do not store important project data on the STB internal storage.
Keep project, Docker data, database volume, and storage volume on the external HDD.
```

---

## 6. Docker Storage on External HDD

Docker should use the HDD, not the internal STB storage.

Verify:

```bash
docker info --format 'Docker Root Dir: {{.DockerRootDir}}'
df -h "$(docker info --format '{{.DockerRootDir}}')"
```

Expected:

```txt
Docker Root Dir: /mnt/usb-hdd/docker-root
```

Recommended `/etc/docker/daemon.json`:

```json
{
  "data-root": "/mnt/usb-hdd/docker-root"
}
```

Recommended systemd mount dependency:

```ini
[Unit]
RequiresMountsFor=/mnt/usb-hdd
```

This helps Docker wait for the HDD before starting.

---

## 7. Docker Compose Pattern

The backend app usually runs with:

```txt
app
db
minio or other storage
cloudflared
```

Use the main compose file for app services:

```txt
docker-compose.yml
```

Use a separate compose file for the tunnel:

```txt
docker-compose.tunnel.yml
```

Reference tunnel compose:

```yaml
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: PROJECT-cloudflared
    restart: unless-stopped
    network_mode: host
    command: tunnel --no-autoupdate run --token ${CLOUDFLARED_TOKEN}
```

In Cloudflare Tunnel public hostname settings:

```txt
api.example.com    → http://127.0.0.1:APP_PORT
admin.example.com  → http://127.0.0.1:APP_PORT
```

For the reference project:

```txt
api.arishia.cyou    → http://127.0.0.1:3000
admin.arishia.cyou  → http://127.0.0.1:3000
```

Using `network_mode: host` avoids Docker DNS issues where cloudflared cannot resolve the app container name.

---

## 8. Environment Variables

Keep secrets in `.env` on the STB.

Reference variables:

```env
CLOUDFLARED_TOKEN=your-cloudflare-tunnel-token
DATABASE_URL=postgresql://...
VISITOR_HASH_SALT=random-long-secret
```

Frontend variables are configured in Cloudflare Pages/Worker settings, not only on the STB:

```env
VITE_API_URL=https://api.example.com
VITE_MEDIA_BASE_URL=https://api.example.com/uploads
```

Never print real tokens or passwords into chat unless intentionally rotating them afterward.

---

## 9. Backend Deployment Flow on STB

Frontend deployment can be automatic through Cloudflare, but backend deployment on the STB is usually manual.

Standard backend deployment:

```bash
cd /mnt/usb-hdd/PROJECT_FOLDER

git pull

grep -q '^VISITOR_HASH_SALT=' .env || openssl rand -hex 32 | sed 's/^/VISITOR_HASH_SALT=/' >> .env

docker compose build app

docker compose -f docker-compose.yml -f docker-compose.tunnel.yml up -d --force-recreate app cloudflared

docker compose -f docker-compose.yml -f docker-compose.tunnel.yml logs --tail=180 app
```

For the reference project:

```bash
cd /mnt/usb-hdd/portfolio-cms

git pull

grep -q '^VISITOR_HASH_SALT=' .env || openssl rand -hex 32 | sed 's/^/VISITOR_HASH_SALT=/' >> .env

docker compose build app

docker compose -f docker-compose.yml -f docker-compose.tunnel.yml up -d --force-recreate app cloudflared

docker compose -f docker-compose.yml -f docker-compose.tunnel.yml logs --tail=180 app
```

If local STB emergency edits block `git pull`, back them up before stashing:

```bash
BACKUP="/mnt/usb-hdd/stb-deploy-backups/pre-git-pull-$(date +%F_%H%M%S)"
mkdir -p "$BACKUP"

cp -a Dockerfile "$BACKUP/" 2>/dev/null || true
cp -a docker-compose.tunnel.yml "$BACKUP/" 2>/dev/null || true
cp -a src/middleware.ts "$BACKUP/" 2>/dev/null || true
cp -a next.config.mjs "$BACKUP/" 2>/dev/null || true
cp -a .dockerignore "$BACKUP/" 2>/dev/null || true

git stash push -u -m "stb-local-deploy-fixes-before-update"
git pull --ff-only origin main
```

---

## 10. Frontend Deployment Flow

Frontend changes are pushed from laptop/dev machine:

```bash
git add .
git commit -m "Update frontend"
git push origin main
```

Cloudflare then builds the frontend automatically.

Check in Cloudflare:

```txt
Workers & Pages
→ PROJECT_FRONTEND
→ Deployments
→ latest deployment should show Success / Production / main
```

Check from terminal:

```bash
curl -I https://PROJECT_FRONTEND.pages.dev
curl -I https://example.com
curl -I https://www.example.com
```

Expected:

```txt
HTTP/2 200
content-type: text/html
x-project-router: frontend-worker
```

For the reference project:

```bash
curl -I https://arishia-frontend.pages.dev
curl -I https://arishia.cyou
curl -I https://www.arishia.cyou
```

Expected:

```txt
HTTP/2 200
x-arishia-router: arishia-frontend-worker
```

---

## 11. Host-Based Route Protection

The backend must behave differently depending on hostname.

Expected behavior:

```txt
Public website domain:
example.com
www.example.com
    → public frontend only

API domain:
api.example.com
    → allow only public API routes such as /api/public/*
    → block normal pages like /, /work, /admin

Admin domain:
admin.example.com
    → allow only /admin, /admin/*, and /api/admin/*
    → block public portfolio pages like /work
```

Reference expectation:

```txt
https://api.arishia.cyou                    → 404 or blocked
https://api.arishia.cyou/work               → 404 or blocked
https://api.arishia.cyou/api/public/health  → 200 JSON

https://admin.arishia.cyou                  → /admin/login or admin redirect
https://admin.arishia.cyou/admin/login      → admin login page
https://admin.arishia.cyou/work             → 404 or blocked

https://arishia.cyou                        → 200 frontend
https://www.arishia.cyou                    → 200 frontend
```

Useful debug headers:

```txt
x-arishia-guard: allowed
x-arishia-guard: blocked
x-arishia-guard: admin-redirect
x-arishia-guard: allowed-admin-host
x-arishia-guard: blocked-admin-host
```

For a new project, use a project-specific header name if possible.

---

## 12. Health Checks

After backend deployment, always run:

```bash
curl -i http://127.0.0.1:APP_PORT/api/public/health

curl -I https://api.example.com
curl -I https://api.example.com/work
curl -i https://api.example.com/api/public/health

curl -I https://admin.example.com
curl -I https://admin.example.com/admin/login
curl -I https://admin.example.com/work

curl -I https://example.com
curl -I https://www.example.com
```

For the reference project:

```bash
curl -i http://127.0.0.1:3000/api/public/health

curl -I https://api.arishia.cyou
curl -I https://api.arishia.cyou/work
curl -i https://api.arishia.cyou/api/public/health

curl -I https://admin.arishia.cyou
curl -I https://admin.arishia.cyou/admin/login
curl -I https://admin.arishia.cyou/work

curl -I https://arishia.cyou
curl -I https://www.arishia.cyou
```

Expected:

```txt
local health         → 200 JSON
api root             → 404/block
api /work            → 404/block
api /api/public/...  → 200 JSON
admin root           → redirect to /admin/login or /admin
admin /admin/login   → 200
admin /work          → 404/block
root public domain   → 200 frontend
www public domain    → 200 frontend
```

---

## 13. API Endpoint Checks

For frontend loading problems, test all public API endpoints directly:

```bash
for url in \
  https://api.example.com/api/public/site \
  https://api.example.com/api/public/home \
  https://api.example.com/api/public/about \
  https://api.example.com/api/public/projects \
  https://api.example.com/api/public/social-links \
  https://api.example.com/api/public/snapshot
do
  echo
  echo "=== $url ==="
  curl -s -o /dev/null -w "%{http_code} %{content_type} %{time_total}s\n" "$url"
done
```

Expected:

```txt
200 application/json
```

If all public API endpoints return 200 but the frontend still shows loading, the problem is usually frontend JavaScript, not the STB backend.

Common frontend causes:

```txt
VITE_API_URL missing or wrong
infinite React loading hook
fetch helper never sets loading=false
CORS issue
browser cache serving old assets
Cloudflare serving stale frontend build
runtime JavaScript error
```

---

## 14. CORS Check

Test browser-like origin:

```bash
curl -i https://api.example.com/api/public/home \
  -H "Origin: https://example.com" \
  -H "Accept: application/json"
```

Expected:

```txt
HTTP/2 200
access-control-allow-origin: *
content-type: application/json
```

---

## 15. Frontend Asset Debugging

Find the active deployed JS file:

```bash
ASSET="$(curl -s https://example.com | grep -oE '/assets/index-[^"]+\.js' | head -1)"
echo "JS asset: $ASSET"
```

Check whether the deployed frontend contains the correct API URL:

```bash
curl -sL "https://example.com$ASSET" | grep -oE 'https://api\.example\.com|/api/public/[a-zA-Z0-9/_-]+' | sort | uniq | head -80
```

For the reference project:

```bash
ASSET="$(curl -s https://arishia.cyou | grep -oE '/assets/index-[^"]+\.js' | head -1)"
echo "JS asset: $ASSET"

curl -sL "https://arishia.cyou$ASSET" | grep -oE 'https://api\.arishia\.cyou|/api/public/[a-zA-Z0-9/_-]+' | sort | uniq | head -80
```

Expected:

```txt
https://api.arishia.cyou
/api/public/home
/api/public/projects
...
```

---

## 16. Dockerfile Lessons for Low-Power STB

On STB, builds are slow and fragile. Avoid repeated full rebuilds unless necessary.

Important fixes learned from the reference project:

### 16.1 Ensure `/app/public` Exists

If Docker build fails with:

```txt
COPY --from=builder /app/public ./public:
"/app/public": not found
```

Fix builder command:

```dockerfile
RUN mkdir -p public && npx prisma generate && npm run build
```

### 16.2 Ensure Prisma Exists in Runtime Image

If logs show:

```txt
sh: 1: prisma: not found
```

The runtime image is missing Prisma CLI.

Robust fix:

```dockerfile
COPY --from=builder /app/node_modules ./node_modules
```

This makes the runtime image larger but avoids missing:

```txt
prisma
tsx
esbuild
argon2
node-gyp-build
@prisma
.prisma
node_modules/.bin
```

Verify image before starting:

```bash
docker run --rm --entrypoint sh PROJECT-app -lc '
echo "PATH=$PATH"
ls -lah node_modules/.bin/prisma node_modules/.bin/tsx
./node_modules/.bin/prisma --version
./node_modules/.bin/tsx --version
'
```

### 16.3 Verify Compiled Routes Exist

For Next.js apps:

```bash
docker exec PROJECT-app sh -lc "find /app/.next/server/app/api/public -type f | sort | grep health || true"
docker exec PROJECT-app sh -lc "find /app/.next/server/app/api/public -type f | sort | grep visits || true"
docker exec PROJECT-app sh -lc "find /app/.next/server/app/api/admin -type f | sort | grep statistics || true"
```

If source route exists but compiled route is missing, rebuild the app image.

---

## 17. What Not To Do

Avoid destructive commands unless you intentionally want to wipe the project:

```bash
docker compose down -v
docker volume rm ...
docker system prune -a
npx prisma migrate reset
npx prisma db push --force-reset
rm -rf /mnt/usb-hdd/docker-root
rm -rf /var/lib/docker
```

Do not delete database volumes while debugging normal routing/build problems.

Do not reset Prisma just because a route returns 404.

Do not touch Cloudflare DNS if local `curl` to `127.0.0.1:APP_PORT` already shows the same issue. Fix the app first.

---

## 18. Typical Debugging Decision Tree

### Problem: Public domain shows wrong page

Check:

```bash
curl -I https://example.com
curl -I https://www.example.com
```

Look for Worker header:

```txt
x-project-router: frontend-worker
```

If missing, check Cloudflare Worker routes and DNS.

### Problem: API returns 404

Check local backend first:

```bash
curl -i http://127.0.0.1:APP_PORT/api/public/health
```

If local fails, problem is backend container.

If local works but public fails, problem is Cloudflare Tunnel or middleware.

### Problem: Frontend stuck loading

Check APIs:

```bash
curl -i https://api.example.com/api/public/home
curl -i https://api.example.com/api/public/snapshot
```

If APIs work, inspect frontend JS, env variables, console errors, and fetch hook logic.

### Problem: Admin shows public homepage

Check host-based middleware.

Expected admin hostname behavior:

```txt
admin.example.com/             → redirect to /admin/login
admin.example.com/admin/login  → admin login
admin.example.com/work         → 404/block
```

If `admin.example.com/` shows the public homepage, middleware is allowing public routes on the admin host.

### Problem: Admin route exists but returns 404

Check source and compiled routes:

```bash
find src/app -maxdepth 8 -type f | sort | grep -Ei 'admin|login|dashboard|auth'

docker exec PROJECT-app sh -lc "find /app/.next/server/app -type f | sort | grep -Ei 'admin|login|dashboard|auth' || true"
```

If compiled routes exist but middleware blocks them, fix middleware rule order.

---

## 19. Recommended Prompt for a New AI Chat

Paste this section into a new chat before asking for help:

```txt
I am deploying a project using a Cloudflare + STB self-hosting pattern.

Architecture:
- Public frontend is deployed on Cloudflare Pages or served through a Cloudflare Worker.
- Root domain and www domain point to the frontend.
- API subdomain points through Cloudflare Tunnel to my STB backend.
- Admin subdomain points through Cloudflare Tunnel to the same STB backend.
- STB uses Docker Compose.
- Docker data root is on an external HDD, not internal STB storage.
- Backend deployment is manual on the STB after git pull.
- Frontend deployment is automatic after git push through Cloudflare.
- Do not suggest destructive commands like docker compose down -v, prisma reset, docker volume delete, or system prune unless I explicitly approve wiping data.

Reference commands:
- Project path: /mnt/usb-hdd/PROJECT_FOLDER
- Docker root: /mnt/usb-hdd/docker-root
- Backend app runs on localhost port APP_PORT.
- Cloudflared uses network_mode: host and routes api/admin domains to http://127.0.0.1:APP_PORT.

Expected routing:
- https://example.com → public frontend
- https://www.example.com → public frontend
- https://api.example.com/api/public/health → 200 JSON
- https://api.example.com and /work → blocked/404
- https://admin.example.com → redirect to /admin/login or /admin
- https://admin.example.com/admin/login → admin login
- https://admin.example.com/work → blocked/404

Please debug step-by-step:
1. Check local backend first.
2. Check compiled routes inside the container.
3. Check Cloudflare Tunnel only if local backend works.
4. Check frontend build/env only if APIs work but browser is broken.
5. Avoid destructive database/storage commands.
```

---

## 20. Fill-In Template for a New Project

Copy this and replace placeholders:

```txt
Project name:
Repository:
STB path:
Docker root:
Main domain:
WWW domain:
API domain:
Admin domain:
Frontend Cloudflare project:
Frontend origin:
Backend local port:
Database service:
Storage service:
Cloudflared compose file:
Tunnel public hostname API target:
Tunnel public hostname admin target:
Frontend env VITE_API_URL:
Frontend env VITE_MEDIA_BASE_URL:
Backend .env location:
Important volumes:
Admin login route:
Health endpoint:
```

Example:

```txt
Project name: portfolio-cms
Repository: MakotoKirishima/Portofolio
STB path: /mnt/usb-hdd/portfolio-cms
Docker root: /mnt/usb-hdd/docker-root
Main domain: arishia.cyou
WWW domain: www.arishia.cyou
API domain: api.arishia.cyou
Admin domain: admin.arishia.cyou
Frontend Cloudflare project: arishia-frontend
Frontend origin: https://arishia-frontend.pages.dev
Backend local port: 3000
Database service: postgres
Storage service: minio
Cloudflared compose file: docker-compose.tunnel.yml
Tunnel public hostname API target: http://127.0.0.1:3000
Tunnel public hostname admin target: http://127.0.0.1:3000
Frontend env VITE_API_URL: https://api.arishia.cyou
Frontend env VITE_MEDIA_BASE_URL: https://api.arishia.cyou/uploads
Backend .env location: /mnt/usb-hdd/portfolio-cms/.env
Important volumes: postgres data, minio data, uploads/media
Admin login route: /admin/login
Health endpoint: /api/public/health
```

Life Compass example:

```txt
Project name: life-compass
Repository: (your repo)
STB path: /mnt/usb-hdd/life-compass
Docker root: /mnt/usb-hdd/docker-root
Main domain: lifecompass.arishia.cyou
API domain: api.lifecompass.arishia.cyou
Admin domain: admin.lifecompass.arishia.cyou
Frontend Cloudflare project: life-compass-frontend
Frontend origin: https://life-compass-frontend.pages.dev
Backend local port: 8000
Database service: none (JSON file)
Storage service: none
Cloudflared compose file: docker-compose.tunnel.yml
Tunnel public hostname API target: http://127.0.0.1:8000
Tunnel public hostname admin target: http://127.0.0.1:8000
Frontend env NEXT_PUBLIC_API_URL: https://api.lifecompass.arishia.cyou
Backend .env location: /mnt/usb-hdd/life-compass/backend-node/.env
Important volumes: lifecompass-data (JSON files)
Admin login route: /admin
Health endpoint: /api/health
```

---

## 21. Final Operating Rule

When debugging, always separate the system into layers:

```txt
Layer 1: Browser / frontend JavaScript
Layer 2: Cloudflare Worker / Pages
Layer 3: Cloudflare DNS
Layer 4: Cloudflare Tunnel
Layer 5: STB Docker container
Layer 6: App routing / middleware
Layer 7: Database / storage
```

Fix the first broken layer found from the bottom upward:

```txt
Local backend broken → fix STB/container/app first.
Local backend works but public API fails → fix tunnel/middleware.
Public API works but frontend loading fails → fix frontend fetch/build/env.
Frontend works but root domain wrong → fix Worker/Pages/DNS.
```
