require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 8000;
const SECRET = process.env.JWT_SECRET || "life-compass-dev-key-2026";
const DB_PATH = path.join(__dirname, "data");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

let genAI = null;
let geminiModel = null;
const GEMINI_AVAILABLE = !!GEMINI_API_KEY;
if (GEMINI_AVAILABLE) {
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Gemini AI: ✅ aktif");
  } catch (e) {
    console.log("Gemini AI: ❌ gagal load -", e.message);
  }
}

if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH, { recursive: true });

function readDB(name) {
  const p = path.join(DB_PATH, `${name}.json`);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function writeDB(name, data) {
  fs.writeFileSync(path.join(DB_PATH, `${name}.json`), JSON.stringify(data, null, 2));
}

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:8000",
  "https://lifecompass.arishia.cyou",
  "https://life-compass-frontend.pages.dev",
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    cb(null, ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".arishia.cyou"));
  },
}));
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

async function callGemini(prompt) {
  if (!geminiModel) return "";
  try {
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.log("Gemini error:", e.message);
    return "";
  }
}

function findCache(profileKey) {
  const cacheKey = crypto.createHash("md5").update(profileKey).digest("hex");
  const cache = readDB("cache");
  const found = cache.find((c) => c.cache_key === cacheKey);
  return { cacheKey, cache, found };
}

function saveCache(cacheKey, data, cache) {
  cache.push({ id: cache.length + 1, cache_key: cacheKey, data, created_at: new Date().toISOString() });
  writeDB("cache", cache);
}

// Auth
app.post("/api/auth/login", (req, res) => {
  const { email, google_token } = req.body;
  const users = readDB("users");
  const userEmail = email || `user_${Date.now()}@lifecompass.app`;
  let user = users.find((u) => u.email === userEmail);
  if (!user) {
    user = { id: users.length + 1, email: userEmail, display_name: email ? email.split("@")[0] : "User", auth_provider: google_token ? "google" : "email", created_at: new Date().toISOString(), deleted_at: null };
    users.push(user);
    writeDB("users", users);
  }
  const token = jwt.sign({ user_id: user.id, email: user.email }, SECRET, { expiresIn: "24h" });
  res.json({ access_token: token, token_type: "bearer", user_id: user.id });
});

app.delete("/api/auth/account", auth, (req, res) => {
  const user_id = req.user.user_id;
  const users = readDB("users");
  const idx = users.findIndex((u) => u.id === user_id);
  if (idx !== -1) {
    users[idx].deleted_at = new Date().toISOString();
    writeDB("users", users);
  }
  res.json({ message: "Account deleted" });
});

// Middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(authHeader.replace("Bearer ", ""), SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
}

function adminAuth(req, res, next) {
  auth(req, res, () => {
    const users = readDB("users");
    const u = users.find((u) => u.id === req.user.user_id);
    if (!u || u.email !== "admin@lifecompass.app") return res.status(403).json({ error: "Admin only" });
    next();
  });
}

// Seed careers
const CAREER_CATEGORIES = {
  "Teknologi (IT)": ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile Developer", "UI/UX Designer", "Data Analyst", "Data Scientist", "DevOps Engineer", "IT Support", "Cyber Security Analyst", "Database Administrator", "QA Engineer"],
  "Kesehatan": ["Dokter Umum", "Dokter Spesialis", "Perawat", "Bidan", "Apoteker", "Ahli Gizi", "Analis Kesehatan", "Fisioterapis"],
  "Pendidikan": ["Guru SD", "Guru SMP/SMA", "Dosen", "Tutor Les Privat", "Instruktur Kursus", "Tenaga Kependidikan"],
  "Pemerintahan & BUMN": ["PNS Administrasi", "PNS Teknis", "TNI AD", "TNI AL", "TNI AU", "Polri", "Diplomat", "BUMN Bank", "BUMN Non-Bank", "Pemda"],
  "Kreatif & Media": ["Content Creator", "Graphic Designer", "Video Editor", "Fotografer", "Penulis Artikel", "Social Media Specialist", "Animator", "Copywriter"],
  "Bisnis & Marketing": ["Sales Marketing", "Digital Marketing", "Business Development", "Human Resources", "Wirausaha", "Project Manager", "Konsultan Bisnis", "Customer Service"],
  "Teknik non-IT": ["Teknik Sipil", "Arsitek", "Teknik Elektro", "Teknik Mesin", "Teknik Industri", "Teknik Kimia", "Teknik Lingkungan", "Surveyor"],
  "Keuangan & Hukum": ["Akuntan", "Auditor", "Pengacara", "Notaris", "Financial Planner", "Analis Keuangan", "Konsultan Pajak", "Legal Officer"],
  "Jasa & Pariwisata": ["Admin Kantor", "Chef Koki", "Tour Guide", "Hotel Staff", "Event Organizer", "Driver Online"],
  "Pertanian & Kelautan": ["Petani Modern", "Peternak", "Ahli Perikanan", "Penyuluh Pertanian", "Teknologi Pangan", "Perkebunan"]
};

function seedCareers() {
  let careers = readDB("careers");
  if (careers.length > 0) return careers;
  let id = 1;
  for (const [cat, titles] of Object.entries(CAREER_CATEGORIES)) {
    for (const title of titles) {
      careers.push({ id: id++, title, category: cat, description: `${title} adalah karir di bidang ${cat} di Indonesia.`, common_tasks: ["Tugas rutin harian", "Koordinasi tim", "Pelaporan"], required_skills: ["Komunikasi", "Problem Solving"], optional_skills: ["Leadership"], education_paths: ["S1 terkait", "D3/D4"], salary_min: "Rp4.000.000", salary_max: "Rp15.000.000", market_prospect: "Tinggi", ai_risk: "Sedang", status: "published", created_at: new Date().toISOString() });
    }
  }
  writeDB("careers", careers);
  return careers;
}
seedCareers();

function ruleBasedScoring(careers, interests, skills) {
  return careers.map((c) => {
    let score = 50;
    const reasons = [];
    const userSkills = (skills || []).map((s) => s.toLowerCase());
    const careerSkills = (c.required_skills || []).map((s) => s.toLowerCase());
    const overlap = userSkills.filter((s) => careerSkills.includes(s));
    if (overlap.length > 0) { score += overlap.length * 5; reasons.push(`Skill cocok: ${overlap.slice(0, 2).join(", ")}`); }
    if ((interests || []).some((i) => c.category.toLowerCase().includes(i.toLowerCase()))) { score += 10; reasons.push("Kategori sesuai minat"); }
    if ((interests || []).some((i) => c.title.toLowerCase().includes(i.toLowerCase()))) { score += 5; reasons.push("Minat sesuai karir"); }
    score = Math.min(score, 98);
    const label = score >= 80 ? "Cocok Tinggi" : score >= 60 ? "Cocok Sedang" : score >= 40 ? "Coba Dulu" : "Kurang Cocok";
    return { career_id: c.id, title: c.title, category: c.category, score: Math.round(score), label, reason: reasons.length > 0 ? reasons.join("; ") : "Data terbatas" };
  }).sort((a, b) => b.score - a.score);
}

async function geminiScoring(careers, profileData) {
  const careerText = JSON.stringify(careers.map((c) => ({
    id: c.id, title: c.title, category: c.category, description: c.description,
    required_skills: c.required_skills, market_prospect: c.market_prospect, ai_risk: c.ai_risk
  })));

  const prompt = `Kamu adalah asisten karir untuk Life Compass. Berikut data user:
${JSON.stringify(profileData, null, 2)}

Bandingkan dengan ${careers.length} data karir berikut:
${careerText}

Beri skor 0-100 untuk SETIAP karir berdasarkan:
1. Kecocokan minat (20%)
2. Kecocokan nilai kerja (20%)
3. Kedekatan skill (20%)
4. Kecocokan kendala (15%)
5. Kelayakan pasar (15%)
6. Risiko (10%)

Output: JSON array saja, tanpa teks lain. Format: [{"career_id": int, "title": str, "score": float, "label": str, "reason": str}]
Label: Cocok Tinggi (>=80), Cocok Sedang (60-79), Coba Dulu (40-59), Kurang Cocok (<40)`;

  const result = await callGemini(prompt);
  if (!result) return null;
  try {
    let cleaned = result.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.split("```json")[1].split("```")[0];
    else if (cleaned.startsWith("```")) cleaned = cleaned.split("```")[1].split("```")[0];
    return JSON.parse(cleaned.trim());
  } catch (e) {
    return null;
  }
}

// Discovery
app.post("/api/discovery/submit", auth, async (req, res) => {
  const { stage, interests, work_values, skills, constraints, work_preferences, reflection } = req.body;
  const careers = readDB("careers").filter((c) => c.status === "published");
  const profiles = readDB("profiles");

  const profile = { id: profiles.length + 1, user_id: req.user.user_id, stage, interests: interests || [], work_values: work_values || [], skills: skills || [], constraints: constraints || [], work_preferences: work_preferences || {}, reflection: reflection || "", created_at: new Date().toISOString() };
  profiles.push(profile);
  writeDB("profiles", profiles);

  const profileKey = JSON.stringify({ interests, work_values, skills, constraints });
  const { cacheKey, cache, found: cached } = findCache(profileKey);

  let scored;
  if (cached) {
    scored = cached.data;
  } else if (GEMINI_AVAILABLE && geminiModel) {
    scored = await geminiScoring(careers, { stage, interests, work_values, skills, constraints });
    if (scored) {
      saveCache(cacheKey, scored, cache);
    } else {
      scored = ruleBasedScoring(careers, interests, skills);
      saveCache(cacheKey, scored, cache);
    }
  } else {
    scored = ruleBasedScoring(careers, interests, skills);
    saveCache(cacheKey, scored, cache);
  }

  const matches = readDB("matches");
  const match = { id: matches.length + 1, user_id: req.user.user_id, profile_snapshot: req.body, results: scored, is_free_visible: true, cache_key: cacheKey, created_at: new Date().toISOString() };
  matches.push(match);
  writeDB("matches", matches);

  // Summary via Gemini or fallback
  let summary;
  if (GEMINI_AVAILABLE && geminiModel) {
    const sp = `Buat ringkasan profil karir 2-3 paragraf dalam Bahasa Indonesia dari data berikut:
${JSON.stringify({ stage, interests, work_values, skills, constraints }, null, 2)}
Fokus: minat, nilai kerja, skill, dan kendala user. Bahasa Indonesia yang ramah.`;
    const sr = await callGemini(sp);
    summary = sr || `Kamu sedang dalam tahap: ${stage || "eksplorasi"}. Minat kamu meliputi ${(interests || []).slice(0, 3).join(", ") || "berbagai bidang"}. Keahlian: ${(skills || []).slice(0, 3).join(", ") || "terus berkembang"}.`;
  } else {
    summary = `Kamu sedang dalam tahap: ${stage || "eksplorasi"}. Minat kamu meliputi ${(interests || []).slice(0, 3).join(", ") || "berbagai bidang"}. Keahlian: ${(skills || []).slice(0, 3).join(", ") || "terus berkembang"}.`;
  }

  // Experiment plan via Gemini or fallback
  const top = scored[0] || { title: "" };
  let tasks;
  if (GEMINI_AVAILABLE && geminiModel) {
    const ep = `Buat rencana eksperimen 7 hari untuk karir "${top.title}" dalam Bahasa Indonesia.
Output: JSON array of 7 string tasks. Tugas harus konkret, murah, dan bisa dilakukan dalam 30-60 menit per hari.`;
    const er = await callGemini(ep);
    if (er) {
      try {
        let cleaned = er.trim();
        if (cleaned.startsWith("```json")) cleaned = cleaned.split("```json")[1].split("```")[0];
        else if (cleaned.startsWith("```")) cleaned = cleaned.split("```")[1].split("```")[0];
        tasks = JSON.parse(cleaned.trim());
      } catch (e) { tasks = null; }
    }
  }
  if (!tasks) {
    tasks = [
      `Hari 1: Cari 3 lowongan ${top.title} dan catat skill yang diminta`,
      `Hari 2: Tonton 1 video tentang keseharian ${top.title}`,
      `Hari 3: Coba 1 mini-project sederhana di bidang ini`,
      `Hari 4: Hubungi 1 orang yang bekerja sebagai ${top.title}`,
      `Hari 5: Baca artikel tentang perkembangan karir ini`,
      `Hari 6: Bandingkan 2 jalur pendidikan untuk masuk ke bidang ini`,
      `Hari 7: Diskusikan dengan teman/keluarga tentang apa yang kamu pelajari`
    ];
  }

  const plans = readDB("experiments");
  plans.push({ id: plans.length + 1, user_id: req.user.user_id, match_id: match.id, career_title: top.title, tasks, status: "active", completion_rate: 0, created_at: new Date().toISOString() });
  writeDB("experiments", plans);

  const alt = scored[1] || scored[0] || {};
  const riskNote = scored.slice(0, 3).filter((c) => c.label === "Coba Dulu" || c.label === "Kurang Cocok").map((c) => `${c.title}: ${c.reason}`).join("; ") || "Tidak ada risiko signifikan.";

  res.json({
    match_id: match.id, summary,
    top_recommendation: { career_title: top.title, score: top.score, label: top.label, reason: top.reason },
    exploration: { career_title: alt.title, score: alt.score, label: alt.label, reason: alt.reason },
    risk_note: riskNote, experiment_plan: tasks, is_paid_unlocked: false
  });
});

app.get("/api/discovery/history", auth, (req, res) => {
  const matches = readDB("matches").filter((m) => m.user_id === req.user.user_id).reverse();
  res.json(matches.map((m) => ({ match_id: m.id, created_at: m.created_at, top_result: m.results[0]?.title || "", is_paid: !m.is_free_visible })));
});

app.get("/api/discovery/result/:match_id", auth, (req, res) => {
  const match = readDB("matches").find((m) => m.id === parseInt(req.params.match_id) && m.user_id === req.user.user_id);
  if (!match) return res.status(404).json({ error: "Not found" });
  const entitlements = readDB("entitlements");
  const paid = entitlements.some((e) => e.user_id === req.user.user_id && e.product_type === "full_report" && e.status === "active");
  const results = match.results || [];
  const top = results[0] || {};
  const alt = results[1] || results[0] || {};
  res.json({
    match_id: match.id, summary: "Ringkasan profil tersedia.",
    top_recommendation: { career_title: top.title, score: top.score, label: top.label, reason: top.reason },
    exploration: { career_title: alt.title, score: alt.score, label: alt.label, reason: alt.reason },
    risk_note: "", is_paid_unlocked: paid
  });
});

// Careers
app.get("/api/careers/", (req, res) => {
  const careers = readDB("careers").filter((c) => c.status === "published");
  if (req.query.category) return res.json(careers.filter((c) => c.category === req.query.category));
  res.json(careers.map((c) => ({ id: c.id, title: c.title, category: c.category, description: c.description?.substring(0, 100) + "...", market_prospect: c.market_prospect })));
});

app.get("/api/careers/:id", (req, res) => {
  const c = readDB("careers").find((c) => c.id === parseInt(req.params.id));
  if (!c) return res.status(404).json({ error: "Not found" });
  res.json(c);
});

// Payment
app.post("/api/payment/create", auth, (req, res) => {
  const payments = readDB("payments");
  const payment = { id: payments.length + 1, user_id: req.user.user_id, provider: "mayar", external_reference: `LC-${Date.now()}`, amount: 25000, currency: "IDR", status: "pending", product_type: "full_report", created_at: new Date().toISOString() };
  payments.push(payment);
  writeDB("payments", payments);
  res.json({ payment_id: payment.id, amount: 25000, checkout_url: `https://app.mayar.id/checkout?reference=${payment.external_reference}&amount=25000`, status: "pending" });
});

app.post("/api/payment/webhook", (req, res) => {
  const { reference, status } = req.body;
  if (!reference) return res.json({ message: "OK" });
  const payments = readDB("payments");
  const payment = payments.find((p) => p.external_reference === reference);
  if (payment && payment.status === "pending") {
    payment.status = status === "success" ? "completed" : "failed";
    writeDB("payments", payments);
    if (payment.status === "completed") {
      const entitlements = readDB("entitlements");
      if (!entitlements.some((e) => e.user_id === payment.user_id && e.product_type === "full_report")) {
        entitlements.push({ id: entitlements.length + 1, user_id: payment.user_id, product_type: "full_report", status: "active", starts_at: new Date().toISOString(), expires_at: null });
        writeDB("entitlements", entitlements);
      }
    }
  }
  res.json({ message: "OK" });
});

app.get("/api/payment/status", auth, (req, res) => {
  const entitlements = readDB("entitlements");
  const has = entitlements.some((e) => e.user_id === req.user.user_id && e.product_type === "full_report" && e.status === "active");
  res.json({ has_access: has, product: has ? "full_report" : null });
});

// Admin routes
app.get("/api/admin/stats", adminAuth, (req, res) => {
  const users = readDB("users").filter((u) => !u.deleted_at);
  const matches = readDB("matches");
  const payments = readDB("payments").filter((p) => p.status === "completed");
  const uniqueUsers = new Set(matches.map((m) => m.user_id));
  res.json({ total_users: users.length, completed_discovery: uniqueUsers.size, total_payments: payments.length, revenue: payments.reduce((s, p) => s + p.amount, 0) });
});

app.get("/api/admin/users", adminAuth, (req, res) => {
  const users = readDB("users").filter((u) => !u.deleted_at);
  const entitlements = readDB("entitlements");
  res.json(users.map((u) => ({ id: u.id, email: u.email, display_name: u.display_name, created_at: u.created_at, has_paid: entitlements.some((e) => e.user_id === u.id && e.status === "active") })));
});

app.get("/api/admin/payments", adminAuth, (req, res) => {
  res.json(readDB("payments").reverse());
});

app.get("/api/admin/landing-page", (req, res) => {
  const p = path.join(DB_PATH, "landing.json");
  if (fs.existsSync(p)) return res.json(JSON.parse(fs.readFileSync(p, "utf-8")));
  res.json({ hero_title: "Temukan Arah Karirmu", hero_subtitle: "Free Direction Map dalam 10 menit", cta_text: "Mulai Sekarang", testimonials: [{ name: "Andi", text: "Life Compass bantu aku nemuin arah karir!", role: "Mahasiswa" }], price: 25000 });
});

app.put("/api/admin/landing-page", adminAuth, (req, res) => {
  fs.writeFileSync(path.join(DB_PATH, "landing.json"), JSON.stringify(req.body, null, 2));
  res.json({ message: "Landing page updated" });
});

app.post("/api/careers/admin", adminAuth, (req, res) => {
  const careers = readDB("careers");
  const career = { id: careers.length + 1, ...req.body, status: "published", created_at: new Date().toISOString() };
  careers.push(career);
  writeDB("careers", careers);
  res.json({ id: career.id, message: "Career created" });
});

app.put("/api/careers/admin/:id", adminAuth, (req, res) => {
  const careers = readDB("careers");
  const idx = careers.findIndex((c) => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  Object.assign(careers[idx], req.body);
  writeDB("careers", careers);
  res.json({ message: "Updated" });
});

app.delete("/api/careers/admin/:id", adminAuth, (req, res) => {
  let careers = readDB("careers").filter((c) => c.id !== parseInt(req.params.id));
  writeDB("careers", careers);
  res.json({ message: "Deleted" });
});

app.post("/api/admin/career/generate", adminAuth, async (req, res) => {
  const { title, category } = req.body;
  if (GEMINI_AVAILABLE && geminiModel) {
    const prompt = `Generate data karir untuk "${title}" di bidang "${category || "umum"}" di Indonesia.
Output JSON saja: {"description": string, "common_tasks": string[], "required_skills": string[], "optional_skills": string[], "education_paths": string[], "salary_min": string, "salary_max": string, "market_prospect": string, "ai_risk": string}
Bahasa Indonesia. Market prospect: Rendah/Sedang/Tinggi. AI risk: Rendah/Sedang/Tinggi.`;
    const result = await callGemini(prompt);
    if (result) {
      try {
        let cleaned = result.trim();
        if (cleaned.startsWith("```json")) cleaned = cleaned.split("```json")[1].split("```")[0];
        else if (cleaned.startsWith("```")) cleaned = cleaned.split("```")[1].split("```")[0];
        const data = JSON.parse(cleaned.trim());
        return res.json(data);
      } catch (e) { /* fall through */ }
    }
  }
  res.json({ description: `${title} adalah karir di bidang ${category || "umum"} di Indonesia. Prospek menjanjikan dengan perkembangan teknologi.`, common_tasks: ["Tugas harian", "Koordinasi", "Pelaporan"], required_skills: ["Komunikasi", "Analisa"], optional_skills: ["Kepemimpinan"], education_paths: ["S1", "D3"], salary_min: "Rp5.000.000", salary_max: "Rp15.000.000", market_prospect: "Tinggi", ai_risk: "Sedang" });
});

// Chatbot
app.post("/api/chat/", auth, async (req, res) => {
  const { question } = req.body;
  let answer;

  if (GEMINI_AVAILABLE && geminiModel) {
    const systemPrompt = `Kamu adalah asisten resmi Life Compass. Tugasmu hanya menjawab pertanyaan seputar:
- Cara menggunakan Life Compass
- Fitur gratis vs berbayar (Free Snapshot gratis, Full Report Rp25.000)
- Cara pembayaran (Mayar.id, Rp25.000 sekali bayar, akses seumur hidup)
- Cara baca hasil rekomendasi
- Cara bagikan hasil
- Kebijakan privasi
- Cara hapus akun

Jika ditanya di luar topik Life Compass, jawab: "Maaf, saya hanya bisa membantu pertanyaan seputar Life Compass. Silakan cek FAQ atau hubungi support."
Gunakan bahasa Indonesia yang ramah dan mudah dipahami.`;

    const chat = geminiModel.startChat({ systemInstruction: systemPrompt });
    try {
      const result = await chat.sendMessage(question);
      answer = result.response.text();
    } catch (e) {
      answer = "Maaf, saya sedang tidak bisa menjawab. Silakan coba lagi nanti.";
    }
  } else {
    const q = question.toLowerCase();
    if (q.includes("gratis") || q.includes("free")) answer = "Ya! Direction Snapshot (rekomendasi + rencana 7 hari) GRATIS. Full Compass Report Rp25.000 sekali bayar.";
    else if (q.includes("bayar") || q.includes("harga") || q.includes("rp")) answer = "Full Compass Report Rp25.000 via Mayar.id (QRIS/VA/Transfer). Sekali bayar, akses seumur hidup.";
    else if (q.includes("cara") || q.includes("pakai")) answer = "1. Daftar/login 2. Isi discovery 8-12 menit 3. Dapat hasil gratis 4. Upgrade jika mau.";
    else if (q.includes("beda") || q.includes("chatgpt")) answer = "Life Compass pake discovery terstruktur + database 80+ karir Indonesia. Hasil lebih akurat untuk pasar lokal.";
    else if (q.includes("aman") || q.includes("data") || q.includes("privasi")) answer = "Data kamu dienkripsi, tidak dijual, AI tidak dilatih dari data kamu. Bisa hapus akun kapan saja.";
    else if (q.includes("faq")) answer = "Silakan kunjungi halaman FAQ di /faq untuk informasi lengkap.";
    else if (q.includes("hapus akun")) answer = "Kamu bisa hapus akun melalui pengaturan. Data akan dianonimkan.";
    else answer = "Maaf, saya hanya bisa membantu pertanyaan seputar Life Compass. Silakan cek FAQ di /faq.";
  }

  const logs = readDB("chatlogs");
  logs.push({ id: logs.length + 1, user_id: req.user.user_id, question, answer, created_at: new Date().toISOString() });
  writeDB("chatlogs", logs);
  res.json({ answer });
});

// Health
app.get("/api/health", (req, res) => res.json({ status: "ok", version: "1.0.0" }));

app.get("/api/sample-report", (req, res) => {
  res.json({
    summary: "Kamu memiliki minat di bidang teknologi dan kreativitas. Dengan skill analisa dan desain yang kamu miliki, beberapa karir menarik bisa kamu coba.",
    top_recommendation: { career_title: "UI/UX Designer", score: 85, label: "Cocok Tinggi", reason: "Minat desain + skill analisa cocok dengan tugas utama UI/UX Designer" },
    exploration: { career_title: "Frontend Developer", score: 72, label: "Cocok Sedang", reason: "Kreativitas dan ketelitianmu berguna di pengembangan frontend" },
    risk_note: "Pastikan kamu meng-update skill secara berkala.",
    experiment_plan: [
      "Hari 1: Cari 3 lowongan UI/UX Designer dan catat skill yang diminta",
      "Hari 2: Tonton 1 video tentang keseharian UI/UX Designer",
      "Hari 3: Coba redesign 1 aplikasi sederhana",
      "Hari 4: Hubungi 1 orang yang bekerja sebagai UI/UX Designer",
      "Hari 5: Baca artikel tentang perkembangan desain digital",
      "Hari 6: Bandingkan 2 jalur pendidikan",
      "Hari 7: Diskusikan dengan teman"
    ]
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Life Compass API running on http://localhost:${PORT}`);
  console.log(`Careers seeded: ${readDB("careers").length}`);
});
