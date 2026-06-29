const { spawn } = require("child_process");
const path = require("path");

const BACKEND_DIR = path.join(__dirname, "backend");
const FRONTEND_DIR = path.join(__dirname, "frontend");

console.log("=== Life Compass Starter ===");

const backend = spawn("uvicorn", ["app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"], {
  cwd: BACKEND_DIR,
  stdio: ["pipe", "inherit", "inherit"],
  env: { ...process.env },
});

backend.on("error", (err) => console.error("Backend error:", err.message));

const frontend = spawn("npx", ["next", "dev", "-p", "3000"], {
  cwd: FRONTEND_DIR,
  stdio: ["pipe", "inherit", "inherit"],
  shell: true,
  env: { ...process.env, PORT: "3000" },
});

frontend.on("error", (err) => console.error("Frontend error:", err.message));

console.log("Backend (uvicorn) starting on port 8000...");
console.log("Frontend (Next.js) starting on port 3000...");
console.log("");
console.log("Wait a few seconds, then open: http://localhost:3000");

setTimeout(() => {
  const http = require("http");
  http.get({ host: "127.0.0.1", port: 8000, path: "/api/health", timeout: 3000 }, (r) => {
    let d = "";
    r.on("data", (c) => (d += c));
    r.on("end", () => console.log("Backend: OK -", d));
  }).on("error", (e) => console.log("Backend: not ready yet -", e.message));

  http.get({ host: "127.0.0.1", port: 3000, path: "/", timeout: 3000 }, (r) => {
    console.log("Frontend: OK (status", r.statusCode + ")");
  }).on("error", (e) => console.log("Frontend: not ready yet -", e.message));
}, 5000);

process.on("SIGTERM", () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});
