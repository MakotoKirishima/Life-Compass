# Deploy Life Compass ke STB + Cloudflare

Pedoman ini mengikuti pola yang sama seperti [cloudflare_stb_self_hosting_template.md](./cloudflare_stb_self_hosting_template.md).

## Arsitektur

```
Browser User
    ↓
Cloudflare DNS / Worker / Pages / Tunnel
    ↓
Frontend: Cloudflare Pages (static HTML dari next build)
Backend/API: STB → Cloudflare Tunnel → localhost:8000
    ↓
Docker container (lifecompass-app) di STB
    ↓
JSON file storage di Docker volume lifecompass-data
```

## Domain

| Subdomain | Tujuan | Routing |
|-----------|--------|---------|
| `lifecompass.arishia.cyou` | Frontend utama | Cloudflare Worker → Pages |
| `api.lifecompass.arishia.cyou` | Backend API | Cloudflare Tunnel → STB:8000 |
| `admin.lifecompass.arishia.cyou` | Admin panel | Cloudflare Tunnel → STB:8000 |

## File yang sudah disiapkan

| File | Lokasi | Fungsi |
|------|--------|--------|
| `backend-node/Dockerfile` | `./backend-node/Dockerfile` | Build image backend Express |
| `backend-node/.dockerignore` | `./backend-node/.dockerignore` | Exclude node_modules/data saat build |
| `docker-compose.yml` | `./docker-compose.yml` | Service app (backend) |
| `docker-compose.tunnel.yml` | `./docker-compose.tunnel.yml` | Service cloudflared |
| `frontend/next.config.js` | `./frontend/next.config.js` | Static export (`output: "export"`) |

---

## Langkah 1: Setup Cloudflare

### 1.1 Domain

Gunakan domain yang sudah ada: **arishia.cyou**. Tidak perlu beli domain baru.

### 1.2 DNS Records

Di Cloudflare Dashboard → Domain `arishia.cyou` → DNS:

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | `lifecompass` | `192.0.2.1` | Proxied |

Subdomain `api.lifecompass` dan `admin.lifecompass` akan dibuat otomatis oleh Tunnel nanti.

### 1.3 Cloudflare Pages — Frontend

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Pilih repo `life-compass`
3. Build settings:
   - **Build command**: `npm run build`
   - **Build output**: `out`
   - **Root directory**: `frontend`
4. Environment variables (Production):
   - `NEXT_PUBLIC_API_URL` = `https://api.lifecompass.arishia.cyou`
5. Deploy → akan dapat URL `https://life-compass-frontend.pages.dev`

### 1.4 Cloudflare Worker — Frontend Router

Buat Worker baru di **Workers & Pages** → **Create Worker**:

```js
const PAGES_ORIGIN = "https://life-compass-frontend.pages.dev";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = new URL(url.pathname + url.search, PAGES_ORIGIN);

    const headers = new Headers(request.headers);
    headers.set("Host", "life-compass-frontend.pages.dev");

    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "follow",
    });

    const finalResponse = new Response(response.body, response);
    finalResponse.headers.set("x-lifecompass-router", "frontend-worker");
    return finalResponse;
  },
};
```

Worker Routes:
- `lifecompass.arishia.cyou/*`

### 1.5 Cloudflare Tunnel

1. Cloudflare Dashboard → **Zero Trust** → **Networks** → **Tunnels**
2. Create a tunnel → beri nama `lifecompass-tunnel`
3. Install `cloudflared` nanti di STB (dapat token seperti `eyJhIjoi...`)
4. **Public Hostname**:
   | Subdomain | Domain | URL |
   |-----------|--------|-----|
   | `api` | `lifecompass.arishia.cyou` | `http://127.0.0.1:8000` |
   | `admin` | `lifecompass.arishia.cyou` | `http://127.0.0.1:8000` |

Simpan **CLOUDFLARED_TOKEN** dari halaman tunnel.

---

## Langkah 2: Setup STB

### 2.1 Pasang Docker

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
docker --version
docker compose version
```

### 2.2 Pindahkan Docker Root ke HDD Eksternal

```bash
mkdir -p /mnt/usb-hdd/life-compass
mkdir -p /mnt/usb-hdd/docker-root

cat > /etc/docker/daemon.json << 'EOF'
{
  "data-root": "/mnt/usb-hdd/docker-root"
}
EOF

systemctl restart docker
docker info --format 'Docker Root Dir: {{.DockerRootDir}}'
# Harus: /mnt/usb-hdd/docker-root
```

### 2.3 Clone Project

```bash
cd /mnt/usb-hdd/life-compass
git clone https://github.com/username/life-compass.git .
```

### 2.4 Setup Environment

```bash
cp backend-node/.env.example backend-node/.env
nano backend-node/.env
```

Isi:
```
GEMINI_API_KEY=AIzaSy...
JWT_SECRET=<generate random: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
```

---

## Langkah 3: Deploy Backend

### 3.1 Build & Jalankan

```bash
cd /mnt/usb-hdd/life-compass

docker compose build app

CLOUDFLARED_TOKEN=eyJhIjoi... \
docker compose -f docker-compose.yml -f docker-compose.tunnel.yml up -d --force-recreate

docker compose logs --tail=50 app
```

### 3.2 Test Lokal

```bash
curl -i http://127.0.0.1:8000/api/health
# {"status":"ok","version":"1.0.0"}

curl http://127.0.0.1:8000/api/careers/ | head -c 200
# array of careers
```

---

## Langkah 4: Deploy Frontend

### 4.1 Build Local (Optional)

```bash
cd frontend
NEXT_PUBLIC_API_URL=https://api.lifecompass.arishia.cyou npm run build
ls out/
# index.html, admin/index.html, dashboard/index.html, dll.
```

### 4.2 Push ke GitHub

```bash
git add .
git commit -m "Ready deploy"
git push origin main
```

Cloudflare Pages akan otomatis build dan deploy.

---

## Langkah 5: Verifikasi

### 5.1 Backend via Tunnel

```bash
curl -i https://api.lifecompass.arishia.cyou/api/health
# Status 200 ✅

curl -I https://api.lifecompass.arishia.cyou/
# Status 404 atau blocked (benar ✅)

curl -I https://admin.lifecompass.arishia.cyou/
# Status 200 ✅
```

### 5.2 Frontend

```bash
curl -I https://lifecompass.arishia.cyou
# Status 200, header: x-lifecompass-router: frontend-worker ✅
```

### 5.3 Flow Lengkap

```bash
curl -s -X POST https://api.lifecompass.arishia.cyou/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
# Dapat token ✅

TOKEN="eyJ..."
curl -s -X POST https://api.lifecompass.arishia.cyou/api/discovery/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"stage":"Mahasiswa","interests":["Meneliti","Merancang"],"work_values":["Kreativitas"],"skills":["Analisa Data"],"constraints":[]}'
# Dapat rekomendasi ✅
```

---

## Langkah 6: Update Deployment

### Backend update
```bash
cd /mnt/usb-hdd/life-compass

BACKUP="/mnt/usb-hdd/stb-deploy-backups/pre-git-pull-$(date +%F_%H%M%S)"
mkdir -p "$BACKUP"
cp -a backend-node/.env "$BACKUP/" 2>/dev/null || true
cp -a docker-compose*.yml "$BACKUP/" 2>/dev/null || true

git stash push -u -m "stb-local-before-update"
git pull --ff-only origin main

cp "$BACKUP"/.env backend-node/.env 2>/dev/null || true

docker compose build app
CLOUDFLARED_TOKEN=eyJhIjoi... \
docker compose -f docker-compose.yml -f docker-compose.tunnel.yml up -d --force-recreate app cloudflared

docker compose logs --tail=50 app
```

### Frontend update
```bash
git add frontend/
git commit -m "Update frontend"
git push origin main
# Cloudflare Pages build otomatis
```

---

## Perbedaan dengan Portfolio

| Aspek | Portfolio | Life Compass |
|-------|-----------|-------------|
| Domain | `arishia.cyou` | `lifecompass.arishia.cyou` |
| API | `api.arishia.cyou` | `api.lifecompass.arishia.cyou` |
| Admin | `admin.arishia.cyou` | `admin.lifecompass.arishia.cyou` |
| Frontend framework | Vite (SPA) | Next.js (static export) |
| Build output | `dist/` | `out/` |
| Database | PostgreSQL | JSON file (Docker volume) |
| Backend port | 3000 | 8000 |
| Frontend env | `VITE_API_URL` | `NEXT_PUBLIC_API_URL` |

---

## Fill-In Template

```txt
Project name: life-compass
Repository: (isi)
STB path: /mnt/usb-hdd/life-compass
Docker root: /mnt/usb-hdd/docker-root
Main domain: lifecompass.arishia.cyou
API domain: api.lifecompass.arishia.cyou
Admin domain: admin.lifecompass.arishia.cyou
Frontend Cloudflare project: life-compass-frontend (atau terserah)
Frontend origin: https://life-compass-frontend.pages.dev
Backend local port: 8000
Database service: none (JSON file)
Cloudflared compose file: docker-compose.tunnel.yml
Tunnel public hostname API target: http://127.0.0.1:8000
Tunnel public hostname admin target: http://127.0.0.1:8000
Frontend env NEXT_PUBLIC_API_URL: https://api.lifecompass.arishia.cyou
Backend .env location: /mnt/usb-hdd/life-compass/backend-node/.env
Important volumes: lifecompass-data (JSON files)
Health endpoint: /api/health
```

---

## Troubleshooting

### Frontend blank/loading terus
```bash
curl -i https://api.lifecompass.arishia.cyou/api/health

ASSET="$(curl -s https://lifecompass.arishia.cyou | grep -oE '/_next/static/chunks/pages/[^"]+\.js' | head -1)"
curl -sL "https://lifecompass.arishia.cyou$ASSET" | grep -oE 'https://api\.lifecompass\.arishia\.cyou' | sort -u
```

### Backend error
```bash
docker compose logs --tail=50 app
docker compose restart app
```

### Reset data
```bash
docker compose down
docker volume rm life-compass_lifecompass-data
docker compose up -d
```

### Tunnel tidak connect
```bash
docker compose -f docker-compose.tunnel.yml logs --tail=20
```
