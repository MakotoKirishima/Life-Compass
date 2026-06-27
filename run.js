// Life Compass - Unified Runner
// Starts both backend (Express) and proxies frontend (Next.js)
// Run: node run.js

const { spawn } = require("child_process");
const path = require("path");

const BACKEND_DIR = path.join(__dirname, "backend-node");
const FRONTEND_DIR = path.join(__dirname, "frontend");

console.log("=== Life Compass Starter ===");

// Start backend
const backend = spawn("node", ["server.js"], {
  cwd: BACKEND_DIR,
  stdio: ["pipe", "inherit", "inherit"],
  env: { ...process.env, PORT: "8000" },
});

backend.on("error", (err) => console.error("Backend error:", err.message));

// Start frontend
const frontend = spawn("npx", ["next", "dev", "-p", "3000"], {
  cwd: FRONTEND_DIR,
  stdio: ["pipe", "inherit", "inherit"],
  shell: true,
  env: { ...process.env, PORT: "3000" },
});

frontend.on("error", (err) => console.error("Frontend error:", err.message));

console.log("Backend starting on port 8000...");
console.log("Frontend starting on port 3000...");
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

// Keep running
process.on("SIGTERM", () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});
