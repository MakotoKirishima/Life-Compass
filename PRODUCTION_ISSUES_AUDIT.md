# Production Issues Audit — Life Compass

## 1. Google Login Returns "Google login is not configured"

### Root Cause
File: `backend/app/routes/auth.py:61-62`
```python
if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
    return JSONResponse(status_code=501, content={"detail": "Google login is not configured"})
```
Both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are empty in the production `.env`.

### Required Env Variables
- `GOOGLE_CLIENT_ID` — from Google Cloud Console OAuth 2.0 credentials
- `GOOGLE_CLIENT_SECRET` — from Google Cloud Console OAuth 2.0 credentials
- `GOOGLE_REDIRECT_URI` — `https://api-lifecompass.arishia.cyou/api/auth/google/callback`
- `FRONTEND_URL` — `https://lifecompass.arishia.cyou`
- `API_PUBLIC_URL` — `https://api-lifecompass.arishia.cyou`
- `COOKIE_DOMAIN` — `.arishia.cyou`

### Frontend Gap
File: `frontend/pages/login.tsx:14-16`
```javascript
const handleGoogleLogin = () => {
    window.location.href = `${api}/api/auth/google/login`;
};
```
The frontend blindly redirects to the backend endpoint without checking if Google OAuth is configured. When env vars are missing, the backend returns raw JSON `{"detail":"Google login is not configured"}`, which the user sees as a naked JSON page — no redirect, no friendly message.

### What Must Change
1. Add `GET /api/auth/google/status` endpoint that returns `{configured: bool, missing: string[]}` without exposing secrets.
2. Frontend must check this status before enabling the Google login button.
3. If not configured, show a friendly disabled state: "Login Google belum dikonfigurasi. Gunakan email untuk sementara."
4. Never redirect to raw JSON on the backend's origin.

---

## 2. Client-Side Exception After Submitting Assistant Question

### Root Cause
File: `frontend/components/ChatBot.tsx:20-26`
```javascript
const res = await fetch(`${API}/api/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ question: q }),
});
const data = await res.json();
setMessages((prev) => [...prev, { role: "bot", text: data.answer }]);
```

Multiple potential failure points:

1. **Non-JSON response**: If the backend returns a non-200 response without JSON body (e.g., 500 HTML error page, reverse proxy error), `res.json()` throws. The `.catch` block currently sets a generic error message, but if the error occurs during the React state update after the catch, the app can crash.

2. **Missing `data.answer`**: If the backend returns `{"detail": "..."}` (e.g., 401 auth error, 422 validation error), `data.answer` is `undefined`. React renders `undefined` as nothing, but the state update before/after could cause issues in a cascading render.

3. **Token expiration mid-session**: The `/api/chat/` endpoint requires `Depends(get_current_user)`. If the token expires or is invalid, the backend returns 401 with `{"detail": "Not authenticated"}`. The frontend has no token refresh or re-auth flow for this scenario — it just crashes.

4. **No ErrorBoundary**: The app has no `_error.tsx` page and no React ErrorBoundary. Any unhandled exception in the component tree (including in ChatBot during async operations) causes the white-screen "Application error" page.

5. **No safe fetch helper**: Every API call in the app directly uses `fetch()` without shared error handling for non-JSON responses, network failures, 401/403/422/500 responses, or missing fields.

### What Must Change
1. Create a safe fetch helper that handles all error types.
2. Add `_error.tsx` page and ErrorBoundary component.
3. Wrap ChatBot and other stateful components in error boundaries.
4. Never call `.map()` on undefined or access nested fields without fallback.
5. Add retry capability for failed assistant requests.
6. Show friendly error states without crashing the full app.

---

## 3. Assistant Refuses Almost Every Question

### Root Cause A — Gemini System Prompt
File: `backend/app/gemini.py:275-283`
```python
system_prompt = """Kamu adalah asisten resmi Life Compass. Tugasmu hanya menjawab pertanyaan seputar:
- Cara menggunakan Life Compass
- Fitur gratis (semua fitur gratis, tidak ada biaya)
- Cara baca hasil rekomendasi
- Kebijakan privasi
- Cara hapus akun

Jika ditanya di luar topik, jawab: "Maaf, saya hanya bisa membantu pertanyaan seputar Life Compass."
Gunakan Bahasa Indonesia yang ramah."""
```
The system prompt explicitly restricts the assistant to only 5 narrow topics. Any career/education question like "Aku bingung pilih karir setelah SMA" is considered "outside topic" and the assistant answers with the refusal.

### Root Cause B — Fallback Chat
File: `backend/app/gemini.py:291-301`
```python
def _fallback_chat(question: str) -> str:
    q = question.lower()
    if "gratis" in q or "free" in q or "bayar" in q or "harga" in q or "rp" in q:
        return "..."
    if "cara" in q or "pakai" in q:
        return "..."
    if "beda" in q or "chatgpt" in q:
        return "..."
    if "aman" in q or "data" in q or "privasi" in q:
        return "..."
    return "Maaf, saya hanya bisa membantu seputar Life Compass. Cek FAQ di /faq."
```
The fallback only matches 4 narrow keyword categories. Everything else (including career questions, education questions, skill questions) falls through to the final refusal line.

### What Must Change
1. Broaden the Gemini system prompt to cover career, education, skill, self-discovery, and Indonesian career context.
2. Keep appropriate guardrails for unsafe/illegal/unrelated topics.
3. Expand the fallback keyword matching to detect career/education questions.
4. Change the final fallback from a refusal to a gentle redirect in Indonesian.
5. Never say "Sorry, I can only help with Life Compass. Check the FAQ at /faq."

---

## 4. UI/UX Is Very Poor

### Current Issues
- No reusable design system components (Button, Card, Badge, EmptyState, etc.)
- Generic Tailwind classes repeated across pages with inconsistent spacing and styling
- Landing page lacks trust-building elements and clear value proposition
- Missing loading skeletons — uses simple spinners
- Missing polished empty states — shows basic centered text
- Missing error states with retry capabilities
- No Auth guard wrapper — each page individually checks for user
- Dashboard has poor information hierarchy
- Assessment flow uses basic buttons without proper progress indicators
- Chat window is minimal with no visual polish
- No dark mode consideration
- Mobile layout is functional but not optimized
- Cookie consent popup works but has basic styling
- No micro-interactions or animations

### What Must Change
1. Create reusable UI components in `frontend/components/ui/`
2. Redesign landing page with proper hero, trust strip, problem/solution, how-it-works, preview cards
3. Redesign all pages with consistent design language
4. Add loading skeletons, empty states, error states
5. Improve assessment flow with better progress visualization
6. Improve chat experience with typing indicators, suggested questions, examples
7. Add PageShell component for consistent layout across pages

---

## 5. Free Product Compliance

### Current Status
✅ No payment/premium code in active backend (`backend/`)
✅ No payment/premium code in frontend
✅ No Mayar, Stripe, pricing, subscription references
⚠️ Archived `backend-node.legacy/` contains old payment code (not deployed)

All features are free after login. No changes needed.

---

## 6. Deployment Safety

### Current Status
File: `docker-compose.yml:9` — Uses `env_file: ./backend/.env`
File: `scripts/deploy_stb.sh:12-13` — Checks for `.env`, errors if missing
`.gitignore` — Ignores `backend/.env`

### Issues
- No explicit documentation that `.env` must NOT be overwritten during updates
- No env validation script to check required vars
- No startup logging of missing env (without printing secrets)

### What Must Change
1. Create `DEPLOYMENT_STB.md` with explicit first-time vs update instructions
2. Create `scripts/check_production_env.py` that validates required vars
3. Ensure `deploy_stb.sh` never copies `.env.example` over `.env`
4. Add startup log to backend that warns about missing critical config

---

## Files Summary

| Issue | File | Lines |
|-------|------|-------|
| Google blocked | `backend/app/routes/auth.py` | 61-62 |
| Google blind redirect | `frontend/pages/login.tsx` | 14-16 |
| Chat crash | `frontend/components/ChatBot.tsx` | 20-26 |
| No error boundary | (missing) | — |
| No safe fetch | (missing utility) | — |
| Gemini too strict | `backend/app/gemini.py` | 275-283 |
| Fallback too strict | `backend/app/gemini.py` | 291-301 |
| No design system | (missing `frontend/components/ui/`) | — |
| No page shell | (missing) | — |
| No DEPLOYMENT_STB.md | (missing) | — |
| No check_production_env.py | (missing) | — |
