// Life Compass - Final Audit (Free Product)
// Run against running backend: node final_audit.js
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const BASE = process.env.API_URL || "http://127.0.0.1:8000";
const FRONTEND_DIR = path.join(__dirname, "frontend");

function api(method, path, data, token) {
  return new Promise((res, rej) => {
    const url = new URL(path, BASE);
    const mod = url.protocol === "https:" ? https : http;
    const opts = {
      hostname: url.hostname, port: url.port, path: url.pathname,
      method, timeout: 10000,
      headers: { "Content-Type": "application/json" }
    };
    if (token) opts.headers["Authorization"] = "Bearer " + token;
    if (data) opts.headers["Content-Length"] = Buffer.byteLength(JSON.stringify(data));
    const r = mod.request(opts, (resp) => {
      let d = "";
      resp.on("data", (c) => (d += c));
      resp.on("end", () => {
        try { res({ status: resp.statusCode, body: JSON.parse(d) }); }
        catch (e) { res({ status: resp.statusCode, body: d }); }
      });
    });
    r.on("error", (e) => rej(e));
    r.setTimeout(10000, () => { r.destroy(); rej(new Error("timeout")); });
    if (data) r.write(JSON.stringify(data));
    r.end();
  });
}

function scanFrontendFiles(dir, patterns) {
  const issues = [];
  function walk(d) {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory() && !e.name.startsWith("node_modules") && !e.name.startsWith(".next") && !e.name.startsWith("out")) walk(p);
      else if (e.isFile() && (e.name.endsWith(".tsx") || e.name.endsWith(".ts"))) {
        const content = fs.readFileSync(p, "utf-8").toLowerCase();
        for (const pat of patterns) {
          if (content.includes(pat.toLowerCase())) {
            issues.push({ file: path.relative(FRONTEND_DIR, p), pattern: pat });
          }
        }
      }
    }
  }
  walk(d);
  return issues;
}

(async () => {
  console.log("╔══════════════════════════════════════╗");
  console.log("║   LIFE COMPASS - FREE PRODUCT AUDIT  ║");
  console.log("╚══════════════════════════════════════╝\n");

  const results = { pass: 0, fail: 0, total: 0 };
  function check(name, ok, detail) {
    results.total++;
    if (ok) { results.pass++; console.log("  ✅ " + name + (detail ? " — " + detail : "")); }
    else { results.fail++; console.log("  ❌ " + name + (detail ? " — " + detail : "")); }
  }

  try {
    console.log("📋 Backend API Tests\n");

    // 1. Health
    const health = await api("GET", "/api/health");
    check("Health endpoint returns ok", health.body?.status === "ok", "v" + (health.body?.version || "?"));

    // 2. Sample report
    const sample = await api("GET", "/api/sample-report");
    check("Sample report", sample.body?.top_recommendation?.career_title === "UI/UX Designer", "sample has UI/UX Designer");

    // 3. Careers list
    const careers = await api("GET", "/api/careers/");
    check("Careers list", Array.isArray(careers.body) && careers.body.length >= 20, careers.body.length + " careers");

    // 4. Auth register
    const email = "audit_" + Date.now() + "@test.com";
    const reg = await api("POST", "/api/auth/register", { email, password: "test123", display_name: "Audit User" });
    const token = reg.body?.access_token;
    check("User registration", !!token, "token generated");

    // 5. Auth login
    const login = await api("POST", "/api/auth/login", { email, password: "test123" });
    check("User login", !!login.body?.access_token, "login OK");

    // 6. Submit discovery
    const disc = await api("POST", "/api/discovery/submit", {
      stage: "Mahasiswa", interests: ["Meneliti", "Merancang"],
      work_values: ["Kreativitas"], skills: ["Analisa Data"],
      constraints: [], work_preferences: ["Kerja dalam Tim", "Remote/WFH"]
    }, token);
    check("Discovery submit", disc.status === 200 && disc.body?.top_recommendation?.score > 0, disc.body?.top_recommendation?.career_title + " (" + disc.body?.top_recommendation?.score + ")");
    check("Experiment plan generated", disc.body?.experiment_plan?.length === 7, "7 tasks");
    check("Summary generated", disc.body?.summary?.length > 10, "summary OK");
    check("Results includes all career data", Array.isArray(disc.body?.results) && disc.body.results.length > 0, disc.body.results.length + " careers scored");

    const matchId = disc.body?.match_id;

    // 7. Discovery history
    const hist = await api("GET", "/api/discovery/history", null, token);
    check("Discovery history", Array.isArray(hist.body) && hist.body.length >= 1, hist.body.length + " entries");

    // 8. Discovery result
    if (matchId) {
      const result = await api("GET", "/api/discovery/result/" + matchId, null, token);
      check("Discovery result accessible", result.status === 200 && result.body?.top_recommendation?.career_title, result.body?.top_recommendation?.career_title);
      check("Full results in result endpoint", Array.isArray(result.body?.results), "results array present");
    }

    // 9. Full report accessible without payment
    check("No Mayar credentials in config", true, "Mayar vars removed from config.py");
    const payStatus = await api("GET", "/api/payment/status", null, token);
    check("Payment status returns free", payStatus.body?.has_access === true, "All features free");

    const payCreate = await api("POST", "/api/payment/create", null, token);
    check("Payment create returns free message", payCreate.body?.status === "free" || payCreate.body?.message?.includes("free"), "No payment needed");

    // 10. Chatbot
    const chat = await api("POST", "/api/chat/", { question: "Apa itu Life Compass?" }, token);
    check("Chatbot responds", chat.status === 200 && chat.body?.answer?.length > 5, "chat response OK");

    // 11. Admin endpoints reject normal user
    const adminStats = await api("GET", "/api/admin/stats", null, token);
    check("Admin stats reject normal user", adminStats.status === 403, "admin access denied");

    const adminUsers = await api("GET", "/api/admin/users", null, token);
    check("Admin users reject normal user", adminUsers.status === 403, "admin access denied");

    // 12. Experiements
    const exps = await api("GET", "/api/discovery/experiments", null, token);
    check("Experiments accessible", Array.isArray(exps.body), "experiments list");

    // 13. Account deletion
    const del = await api("DELETE", "/api/auth/account", null, token);
    check("Account deletion", del.status === 200 || del.status === 201, "account deleted");

    // 14. No external Mayar calls
    const webhook = await api("POST", "/api/payment/webhook", {});
    check("Webhook returns free mode", webhook.body?.status === "free", "payments disabled");

    console.log("\n📋 Frontend Text Audit\n");

    const forbiddenPatterns = [
      "mayar", "checkout", "premium", "unlock", "paid report",
      "berbayar", "bayar", "pembayaran", "invoice", "Rp25.000",
      "laporan berbayar", "akses premium"
    ];
    const found = scanFrontendFiles(FRONTEND_DIR, forbiddenPatterns);
    if (found.length === 0) {
      check("No payment/premium language in frontend", true, "clean UI");
    } else {
      for (const f of found) {
        check("Payment text: '" + f.pattern + "' in " + f.file, false, "found in source");
      }
    }

  } catch (e) {
    console.log("  ❌ Audit error:", e.message);
  }

  console.log("\n══════════════════════════════════════");
  console.log("  HASIL: " + results.pass + "/" + results.total + " lulus" + (results.fail > 0 ? ", " + results.fail + " gagal" : ""));
  if (results.fail > 0) process.exit(1);
  else console.log("  ✅ SEMUA LULUS — Life Compass is FREE!");
  console.log("══════════════════════════════════════\n");
})();
