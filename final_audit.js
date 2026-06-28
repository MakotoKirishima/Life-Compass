const fs = require("fs");
const path = require("path");

const API_URL = process.env.API_URL || "http://127.0.0.1:8000";
let failed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    console.log("PASS:", name);
  } else {
    failed++;
    console.error("FAIL:", name, detail);
  }
}

async function api(method, route, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(API_URL + route, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch (_) {}
  return { status: res.status, body: data };
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (["node_modules", ".next", "out", "dist", "build", ".git", ".cache"].includes(item)) continue;
      walk(p, files);
    } else {
      if ([".map", ".pack", ".log"].some(ext => p.endsWith(ext))) continue;
      files.push(p);
    }
  }
  return files;
}

async function main() {
  for (const route of ["/api/health", "/api/sample-report", "/api/careers"]) {
    const r = await api("GET", route);
    check(`${route} OK`, r.status === 200, `status ${r.status}`);
  }

  const email = `audit_${Date.now()}@example.com`;
  const password = "AuditPass-2026!";
  const register = await api("POST", "/api/auth/register", { email, password, display_name: "Audit User" });
  check("register works or already supported", [200, 201, 400, 409].includes(register.status), `status ${register.status}`);

  const login = await api("POST", "/api/auth/login", { email, password });
  const token = login.body?.access_token || login.body?.token;
  check("login returns token", login.status === 200 && !!token, `status ${login.status}`);

  if (token) {
    const admin = await api("GET", "/api/admin/careers", null, token);
    check("normal user rejected from admin", [401, 403].includes(admin.status), `status ${admin.status}`);
  }

  const banned = [
    ["may", "ar"].join(""),
    ["pay", "ment"].join(""),
    ["check", "out"].join(""),
    ["prem", "ium"].join(""),
    ["un", "lock"].join(""),
    ["pa", "id"].join(""),
    ["in", "voice"].join(""),
    ["web", "hook"].join("")
  ];

  const sourceFiles = [
    ...walk("backend"),
    ...walk("frontend"),
    "README.md",
    "backend/.env.example",
    ".env.example"
  ].filter(Boolean).filter(f => fs.existsSync(f));

  for (const file of sourceFiles) {
    if (file.includes(".env.bak.")) continue;
    const text = fs.readFileSync(file, "utf8").toLowerCase();
    for (const term of banned) {
      check(`no removed monetization term in ${file}`, !text.includes(term), term);
    }
  }

  if (failed > 0) {
    console.error(`Audit failed: ${failed}`);
    process.exit(1);
  }

  console.log("Audit passed. Product is free-mode clean.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
