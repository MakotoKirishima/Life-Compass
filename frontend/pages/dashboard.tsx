import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import LockModal from "../components/LockModal";
import PageShell from "../components/ui/PageShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ProgressSteps from "../components/ui/ProgressSteps";
import LoadingState from "../components/ui/LoadingState";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import DimensionBar from "../components/ui/DimensionBar";
import { safeFetch } from "../lib/fetch";

/* ===================================================
   v2 — 7-Phase Discovery Assessment
   =================================================== */

type AnswerMap = Record<string, unknown>;

// --- Phase definitions ---
interface Phase {
  id: string;
  title: string;
  icon: string;
  desc: string;
  questions: Question[];
}

interface Question {
  id: string;
  type: "single" | "multi" | "text" | "textarea" | "number" | "scale" | "scenario" | "tradeoff" | "skill_verify";
  question: string;
  hint?: string;
  placeholder?: string;
  options?: { label: string; value: string; icon?: string }[];
  maxLength?: number;
  min?: number;
  max?: number;
}

const FULL_PHASES: Phase[] = [
  // ---- Phase 1: Foundational Context (7 questions) ----
  {
    id: "foundation",
    title: "Tahap Hidup & Konteks",
    icon: "🌱",
    desc: "Ceritakan situasimu saat ini. Ini membantu kami menyesuaikan rekomendasi.",
    questions: [
      { id: "stage", type: "single", question: "Sekarang kamu ada di tahap mana?", hint: "Ini jadi dasar seluruh rekomendasi kami.",
        options: [
          { label: "Pelajar SMA/SMK", value: "Pelajar SMA/SMK" },
          { label: "Mahasiswa", value: "Mahasiswa" },
          { label: "Fresh Graduate", value: "Fresh Graduate" },
          { label: "Karyawan Junior (< 2 tahun)", value: "Karyawan Junior" },
          { label: "Career Switcher", value: "Career Switcher" },
          { label: "Pencari Kerja", value: "Pencari Kerja" },
          { label: "Wirausaha", value: "Wirausaha" },
        ]},
      { id: "education_level", type: "single", question: "Apa pendidikan terakhirmu?", hint: "Setiap karir punya jalur masuk berbeda.",
        options: [
          { label: "SMA/SMK", value: "SMA/SMK" },
          { label: "D3/Diploma", value: "D3/Diploma" },
          { label: "S1/Sarjana", value: "S1/Sarjana" },
          { label: "S2/Magister", value: "S2/Magister" },
          { label: "S3/Doktor", value: "S3/Doktor" },
          { label: "Bootcamp/Sertifikasi", value: "Bootcamp/Sertifikasi" },
          { label: "Otodidak", value: "Otodidak" },
        ]},
      { id: "success_definition", type: "textarea", question: "Apa arti 'sukses dalam karir' menurutmu? Ceritakan dengan kata-katamu sendiri.", hint: "Ini membantu kami memahami motivasi terdalammu.", placeholder: "Contoh: Sukses buatku adalah punya pekerjaan yang bermanfaat buat orang banyak, sambil tetap punya waktu buat keluarga...", maxLength: 500 },
      { id: "aspirational_self", type: "textarea", question: "Kalau uang dan pendapat orang lain tidak penting, apa yang akan kamu lakukan?", hint: "Jawabanmu bisa mengungkap minat yang selama ini terpendam.", placeholder: "Contoh: Aku akan jadi seniman jalanan sambil keliling Indonesia...", maxLength: 500 },
      { id: "perceived_barriers", type: "multi", question: "Apa yang selama ini menghambatmu mengejar karir impian?", hint: "Pilih yang paling relevan.",
        options: [
          { label: "Biaya / Keuangan", value: "Biaya" },
          { label: "Pendidikan", value: "Pendidikan" },
          { label: "Dukungan Keluarga", value: "Dukungan Keluarga" },
          { label: "Kepercayaan Diri", value: "Kepercayaan Diri" },
          { label: "Lokasi / Domisili", value: "Lokasi" },
          { label: "Usia", value: "Usia" },
          { label: "Waktu", value: "Waktu" },
          { label: "Tidak Tahu Mulai Darimana", value: "Bingung Mulai" },
        ]},
      { id: "weekly_hours_available", type: "number", question: "Berapa jam per minggu yang bisa kamu investasikan untuk belajar atau membangun karir?", hint: "Jujur saja — ini penting untuk memperkirakan timeline.", min: 0, max: 168, placeholder: "Contoh: 10" },
      { id: "runway_months", type: "single", question: "Berapa lama kamu bisa bertahan secara finansial sebelum pendapatan jadi kritis?", hint: "Ini membantu kami menyesuaikan urgensi rekomendasi.",
        options: [
          { label: "Kurang dari 1 bulan", value: "0-1" },
          { label: "1–3 bulan", value: "1-3" },
          { label: "3–6 bulan", value: "3-6" },
          { label: "6–12 bulan", value: "6-12" },
          { label: "Lebih dari 1 tahun", value: "12+" },
          { label: "Tidak ada tekanan finansial", value: "none" },
        ]},
    ],
  },
  // ---- Phase 2: Cognitive & Psychological Profile (condensed to 5 scenarios) ----
  {
    id: "cognitive",
    title: "Gaya Kerja & Kepribadian",
    icon: "🧠",
    desc: "Bagaimana kamu berpikir, bekerja, dan merespon situasi.",
    questions: [
      { id: "scenario_ambiguity", type: "scenario", question: "Kamu diberi proyek baru tanpa panduan jelas. Yang paling mendekati reaksimu?", hint: "Tidak ada jawaban benar/salah.",
        options: [
          { label: "Antusias — aku suka eksplorasi sendiri", value: "open_ended", icon: "🔍" },
          { label: "Minta contoh dulu baru mulai", value: "structured", icon: "📋" },
          { label: "Cari referensi sebanyak mungkin", value: "research", icon: "📚" },
          { label: "Tanya aturan biar tidak salah", value: "rule", icon: "✅" },
        ]},
      { id: "scenario_collab", type: "scenario", question: "Kamu paling produktif saat bekerja dengan cara apa?", hint: "Pola kerja idealmu.",
        options: [
          { label: "Sendiri, fokus penuh", value: "solo", icon: "🧘" },
          { label: "Tim kecil (2-5 orang)", value: "small_team", icon: "👥" },
          { label: "Tim besar dengan peran jelas", value: "large_team", icon: "🏢" },
          { label: "Kolaborasi lintas divisi", value: "cross", icon: "🔄" },
        ]},
      { id: "scenario_risk", type: "scenario", question: "Dua tawaran: Gaji tetap 8jt vs komisi 5–25jt. Yang mana?", hint: "Ini mengukur toleransi risiko.",
        options: [
          { label: "8jt — stabil lebih penting", value: "stable", icon: "🛡️" },
          { label: "5-25jt — ambil risiko", value: "risky", icon: "🚀" },
          { label: "Cari keseimbangan", value: "balanced", icon: "⚖️" },
          { label: "Tergantung prospeknya", value: "context", icon: "🤔" },
        ]},
      { id: "scenario_feedback", type: "scenario", question: "Kamu menyelesaikan tugas besar. Yang paling memotivasimu?", hint: "Sumber kepuasan kerja.",
        options: [
          { label: "Hasilnya sendiri sudah cukup memuaskan", value: "internal", icon: "🌟" },
          { label: "Pujian dari atasan/rekan", value: "external", icon: "👏" },
          { label: "Melihat dampak ke pengguna", value: "impact", icon: "❤️" },
          { label: "Target tercapai", value: "target", icon: "🎯" },
        ]},
      { id: "scenario_setback", type: "scenario", question: "Proyek yang sudah dikerjakan 3 minggu diubah arah. Reaksimu?", hint: "Pola menghadapi kegagalan.",
        options: [
          { label: "Frustrasi — buang waktu", value: "frustrated", icon: "😤" },
          { label: "Penasaran — kenapa berubah?", value: "curious", icon: "🤔" },
          { label: "Santai — yang penting hasil akhir", value: "chill", icon: "😌" },
          { label: "Semangat — tantangan baru", value: "energized", icon: "⚡" },
        ]},
    ],
  },
  // ---- Phase 3: Multi-Tier Skills Inventory ----
  {
    id: "skills",
    title: "Skill & Kemampuan",
    icon: "🛠️",
    desc: "Pilih skill yang kamu miliki dan beri tahu sejauh mana penguasaanmu.",
    questions: [
      { id: "skills", type: "multi", question: "Skill apa yang sudah kamu miliki? (Pilih semua yang relevan)", hint: "Soft skill seperti komunikasi juga penting.",
        options: [
          { label: "Komunikasi", value: "Komunikasi" },
          { label: "Analisa Data", value: "Analisa Data" },
          { label: "Desain Grafis", value: "Desain Grafis" },
          { label: "Programming", value: "Programming" },
          { label: "Menulis", value: "Menulis" },
          { label: "Public Speaking", value: "Public Speaking" },
          { label: "Manajemen Proyek", value: "Manajemen Proyek" },
          { label: "Riset", value: "Riset" },
          { label: "Kerja Tim", value: "Kerja Tim" },
          { label: "Bahasa Asing", value: "Bahasa Asing" },
          { label: "SEO / Digital Marketing", value: "SEO" },
          { label: "Video Editing", value: "Video Editing" },
          { label: "Database", value: "Database" },
          { label: "UI/UX Design", value: "UI/UX Design" },
          { label: "Financial Modeling", value: "Financial" },
          { label: "Negosiasi", value: "Negosiasi" },
          { label: "Leadership", value: "Leadership" },
          { label: "Fotografi", value: "Fotografi" },
        ]},
      { id: "skills_demonstrated", type: "skill_verify", question: "Skill mana yang sudah pernah kamu gunakan di dunia nyata (kerja, proyek, volunteering)?", hint: "Skill yang sudah teruji secara praktis." },
      { id: "skills_in_progress", type: "multi", question: "Skill apa yang sedang kamu pelajari?", hint: "Beri tahu kami apa yang sedang kamu usahakan.",
        options: [
          { label: "Programming", value: "Programming" },
          { label: "Desain", value: "Desain" },
          { label: "Data Science", value: "Data Science" },
          { label: "Digital Marketing", value: "Digital Marketing" },
          { label: "Bahasa Asing", value: "Bahasa Asing" },
          { label: "Public Speaking", value: "Public Speaking" },
          { label: "Video Editing", value: "Video Editing" },
          { label: "UI/UX Design", value: "UI/UX Design" },
          { label: "Manajemen", value: "Manajemen" },
        ]},
      { id: "anti_skills", type: "multi", question: "Aktivitas atau skill apa yang benar-benar kamu hindari atau tidak suka?", hint: "Ini penting agar kami tidak merekomendasikan karir dengan aktivitas yang kamu benci.",
        options: [
          { label: "Menghitung / Angka", value: "Angka" },
          { label: "Presentasi di depan umum", value: "Presentasi" },
          { label: "Menulis laporan panjang", value: "Menulis" },
          { label: "Pekerjaan administratif", value: "Administrasi" },
          { label: "Coding", value: "Coding" },
          { label: "Menjual / Sales", value: "Sales" },
          { label: "Multitasking", value: "Multitasking" },
          { label: "Pekerjaan manual/fisik", value: "Manual" },
        ]},
    ],
  },
  // ---- Phase 4: Multi-Dimensional Interest Mapping ----
  {
    id: "interests",
    title: "Minat & Ketertarikan",
    icon: "🎯",
    desc: "Apa yang membuatmu penasaran, bersemangat, dan ingin kamu lakukan?",
    questions: [
      { id: "interests", type: "multi", question: "Bidang apa yang paling menarik perhatianmu?", hint: "Pilih 2-4 bidang yang paling resonate.",
        options: [
          { label: "Teknologi & Digital", value: "Teknologi" },
          { label: "Desain & Kreatif", value: "Desain" },
          { label: "Kesehatan & Kedokteran", value: "Kesehatan" },
          { label: "Pendidikan & Pengajaran", value: "Pendidikan" },
          { label: "Bisnis & Kewirausahaan", value: "Bisnis" },
          { label: "Keuangan & Investasi", value: "Keuangan" },
          { label: "Hukum & Kebijakan", value: "Hukum" },
          { label: "Teknik & Konstruksi", value: "Teknik" },
          { label: "Media & Komunikasi", value: "Media" },
          { label: "Pariwisata & Hospitality", value: "Pariwisata" },
          { label: "Pertanian & Lingkungan", value: "Pertanian" },
          { label: "Pemerintahan & Publik", value: "Pemerintahan" },
        ]},
      { id: "activity_interests", type: "multi", question: "Aktivitas apa yang paling kamu nikmati dalam bekerja?", hint: "Ini lebih prediktif daripada bidang — karena inilah yang akan kamu lakukan 8 jam sehari.",
        options: [
          { label: "Menganalisa data & pola", value: "Analisa" },
          { label: "Menciptakan sesuatu yang baru", value: "Menciptakan" },
          { label: "Mengorganisir & merapikan", value: "Mengorganisir" },
          { label: "Mempengaruhi & meyakinkan orang", value: "Mempengaruhi" },
          { label: "Membangun sesuatu secara fisik/digital", value: "Membangun" },
          { label: "Membantu & melayani orang", value: "Membantu" },
          { label: "Meneliti & menemukan jawaban", value: "Meneliti" },
          { label: "Mengajar & mentransfer pengetahuan", value: "Mengajar" },
          { label: "Mengeksekusi & menyelesaikan", value: "Menyelesaikan" },
          { label: "Memimpin & mengarahkan tim", value: "Memimpin" },
        ]},
      { id: "problem_interests", type: "multi", question: "Masalah seperti apa yang membuatmu bersemangat untuk menyelesaikannya?", hint: "Ini mengungkap motivasi yang lebih dalam.",
        options: [
          { label: "Masalah sosial & kemanusiaan", value: "Sosial" },
          { label: "Masalah teknis & sistem", value: "Teknis" },
          { label: "Masalah kreatif & estetika", value: "Kreatif" },
          { label: "Masalah sains & penemuan", value: "Sains" },
          { label: "Masalah organisasi & efisiensi", value: "Organisasi" },
          { label: "Masalah keuangan & alokasi sumber daya", value: "Keuangan" },
        ]},
    ],
  },
  // ---- Phase 5: Values Archaeology (3 trade-off scenarios) ----
  {
    id: "values",
    title: "Nilai & Prioritas",
    icon: "💎",
    desc: "Keputusan sulit mengungkap apa yang benar-benar penting bagimu.",
    questions: [
      { id: "tradeoff_money_meaning", type: "tradeoff",
        question: "Dua tawaran kerja: (A) Gaji 15jt per bulan, pekerjaan standar. (B) Gaji 8jt per bulan, pekerjaan sangat berarti. Keduanya stabil. Mana?", hint: "Keseimbangan antara makna dan kompensasi.",
        options: [
          { label: "A — Gaji tinggi, saya bisa cari makna di luar kerja", value: "money" },
          { label: "B — Makna lebih penting dari uang", value: "meaning" },
          { label: "Cari yang menengah (gaji 10-12jt, makna sedang)", value: "balance" },
        ]},
      { id: "tradeoff_expert_generalist", type: "tradeoff",
        question: "Kesempatan jadi: (A) Top expert global di bidang spesifik. (B) Generalist leader yang bentuk strategi di banyak area. Mana?", hint: "Kedalaman vs keluasan.",
        options: [
          { label: "A — Ahli dalam satu bidang", value: "expert" },
          { label: "B — Generalis yang paham banyak hal", value: "generalist" },
          { label: "Tergantung bidangnya", value: "depends" },
        ]},
      { id: "tradeoff_stability_autonomy", type: "tradeoff",
        question: "(A) Perusahaan besar, gaji tetap, jenjang jelas. (B) Mulai bisnis sendiri, potensi besar — atau gagal total. Mana?", hint: "Stabilitas vs otonomi.",
        options: [
          { label: "A — Stabilitas, saya tidak suka risiko finansial", value: "stability" },
          { label: "B — Ambil risiko demi kendali penuh", value: "autonomy" },
          { label: "Coba B sambil tetap punya pekerjaan sampingan", value: "side" },
        ]},
    ],
  },
  // ---- Phase 6: Constraint Mapping ----
  {
    id: "constraints",
    title: "Kendala & Realitas",
    icon: "🚧",
    desc: "Apa yang membatasi pilihanmu — dan apa yang justru bisa jadi keunggulan?",
    questions: [
      { id: "constraints", type: "multi", question: "Kendala apa yang kamu hadapi saat ini?", hint: "Jujur — ini membantu kami hindari rekomendasi yang tidak realistis.",
        options: [
          { label: "Biaya terbatas", value: "Biaya terbatas" },
          { label: "Tidak bisa kuliah", value: "Tidak bisa kuliah" },
          { label: "Takut matematika", value: "Takut matematika" },
          { label: "Butuh gaji cepat", value: "Butuh gaji cepat" },
          { label: "Terikat lokasi", value: "Terikat lokasi" },
          { label: "Tidak punya koneksi", value: "Tidak punya koneksi" },
          { label: "Keterbatasan fisik", value: "Keterbatasan fisik" },
          { label: "Tanggung jawab keluarga", value: "Tanggung jawab keluarga" },
          { label: "Usia", value: "Usia" },
          { label: "Tidak ada kendala signifikan", value: "Tidak ada" },
        ]},
      { id: "location", type: "text", question: "Di kota/daerah mana kamu tinggal?", hint: "Kami akan cek ketersediaan lowongan di daerahmu.", placeholder: "Contoh: Jakarta, Bandung, atau desa di Jawa Timur...", maxLength: 100 },
      { id: "reflection", type: "textarea", question: "Ceritakan perjalananmu — latar belakang, pengalaman, atau apa pun yang kamu rasa perlu kami tahu.", hint: "Cerita bebas. Ini membantu AI memberikan rekomendasi yang lebih personal.", placeholder: "Contoh: Aku lulusan SMK Multimedia. Aku suka desain tapi juga tertarik programming. Orang tuaku ingin aku jadi PNS...", maxLength: 1000 },
    ],
  },
  // ---- Phase 7: Work Environment Preferences ----
  {
    id: "environment",
    title: "Lingkungan Kerja",
    icon: "🏢",
    desc: "Di lingkungan seperti apa kamu akan berkembang dan bahagia?",
    questions: [
      { id: "work_preferences", type: "multi", question: "Lingkungan kerja seperti apa yang kamu cari?", hint: "Kantor, remote, startup, atau perusahaan besar?",
        options: [
          { label: "Remote / WFH", value: "Remote" },
          { label: "Hybrid (campuran)", value: "Hybrid" },
          { label: "Kantor", value: "Kantor" },
          { label: "Freelance / Sendiri", value: "Freelance" },
          { label: "Startup (cepat, dinamis)", value: "Startup" },
          { label: "Perusahaan Besar", value: "Perusahaan Besar" },
          { label: "Pemerintahan", value: "Pemerintahan" },
          { label: "Wirausaha", value: "Wirausaha" },
        ]},
      { id: "team_size_pref", type: "single", question: "Ukuran tim idealmu?", hint: "Berapa banyak orang yang kamu ingin bekerja sama setiap hari?",
        options: [
          { label: "Sendiri", value: "solo" },
          { label: "2-5 orang", value: "small" },
          { label: "6-15 orang", value: "medium" },
          { label: "16+ orang", value: "large" },
        ]},
      { id: "pace_pref", type: "single", question: "Kecepatan kerja ideal?", hint: "Apakah kamu suka lingkungan yang terukur atau cepat dan dinamis?",
        options: [
          { label: "Terukur dan konsisten", value: "measured" },
          { label: "Bervariasi — kadang cepat kadang santai", value: "variable" },
          { label: "Cepat dan penuh tekanan", value: "fast" },
        ]},
    ],
  },
];

/* ===================================================
   Express Mode — 22 core questions (first question of each sub-section)
   =================================================== */
const EXPRESS_PHASES: Phase[] = FULL_PHASES.map((phase) => ({
  ...phase,
  questions: phase.questions.slice(0, Math.ceil(phase.questions.length / (phase.id === "foundation" ? 1.5 : 2))),
}));

/* ===================================================
   Helper: flatten all questions for step indexing
   =================================================== */
function flattenQuestions(phases: Phase[]): { phaseIdx: number; question: Question }[] {
  const flat: { phaseIdx: number; question: Question }[] = [];
  phases.forEach((p, pi) => {
    p.questions.forEach((q) => flat.push({ phaseIdx: pi, question: q }));
  });
  return flat;
}

/* ===================================================
   Dimension labels for v2
   =================================================== */
const V2_DIM_KEYS = ["skills_alignment", "interest_resonance", "values_alignment",
  "cognitive_fit", "education_alignment", "constraint_impact",
  "environment_fit", "market_timing", "trajectory_alignment"];

/* ===================================================
   Dashboard Component
   =================================================== */
export default function Dashboard({ user, api, logout }) {
  const [expressMode, setExpressMode] = useState(false);
  const phases = expressMode ? EXPRESS_PHASES : FULL_PHASES;
  const flatQuestions = flattenQuestions(phases);
  const totalPhases = phases.length;
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLock, setShowLock] = useState(false);
  const [loadingText, setLoadingText] = useState("AI sedang menganalisa...");
  const [userName, setUserName] = useState("");
  // Phase intro & insight state
  const [phaseIntroDone, setPhaseIntroDone] = useState<Record<number, boolean>>({});
  const [insightTexts, setInsightTexts] = useState<Record<number, string>>({});
  const [insightLoading, setInsightLoading] = useState<number | null>(null);
  const [showingInsight, setShowingInsight] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { setShowLock(true); return; }
    setUserName(user.display_name || user.email?.split("@")[0] || "Pengguna");
    safeFetch<any[]>("/api/discovery/history", { token: user.token, baseUrl: api })
      .then((res) => { if (res.ok) setHistory(res.data || []); })
      .catch(() => {});
    safeFetch<any[]>("/api/discovery/experiments", { token: user.token, baseUrl: api })
      .then((res) => { if (res.ok) setExperiments(res.data || []); })
      .catch(() => {});
  }, [user]);

  const loadingMessages = [
    "AI menganalisa jawabanmu dengan 9 dimensi penilaian...",
    "Memeriksa kelayakan (feasibility gate) untuk setiap karir...",
    "Mencocokkan minat dengan 27+ profil karir Indonesia...",
    "Menyusun rekomendasi tier 1, 2, dan 3...",
    "Hampir selesai! Menyiapkan laporan gap analysis...",
  ];

  const submitDiscovery = async () => {
    setLoading(true);
    setError("");
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[i]);
    }, 3000);
    try {
      const skillsArr = (answers.skills as string[]) || [];
      const demonstratedArr = (answers.skills_demonstrated as string[]) || [];

      const payload: Record<string, unknown> = {
        stage: String(answers.stage || ""),
        education_level: String(answers.education_level || ""),
        location: String(answers.location || ""),
        interests: answers.interests || [],
        work_values: [],
        skills: skillsArr,
        constraints: answers.constraints || [],
        work_preferences: answers.work_preferences || [],
        reflection: String(answers.reflection || ""),
        success_definition: String(answers.success_definition || ""),
        aspirational_self: String(answers.aspirational_self || ""),
        perceived_barriers: answers.perceived_barriers || [],
        weekly_hours_available: Number(answers.weekly_hours_available) || 0,
        runway_months: String(answers.runway_months || ""),
        skills_demonstrated: demonstratedArr,
        skills_in_progress: (answers.skills_in_progress as string[]) || [],
        anti_skills: (answers.anti_skills as string[]) || [],
        activity_interests: (answers.activity_interests as string[]) || [],
        problem_interests: (answers.problem_interests as string[]) || [],
        values_hierarchy: buildValuesHierarchy(answers),
        cognitive_profile: buildCognitiveProfile(answers),
        team_size_pref: String(answers.team_size_pref || ""),
        pace_pref: String(answers.pace_pref || ""),
      };

      const res = await safeFetch("/api/discovery/submit", {
        method: "POST", data: payload, token: user.token, baseUrl: api,
      });
      clearInterval(interval);
      if (res.ok) {
        setResult(res.data);
        setStep(flatQuestions.length);
      } else {
        setError(res.error || "Gagal mengirim data");
      }
    } catch {
      clearInterval(interval);
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    }
    setLoading(false);
  };

  const buildValuesHierarchy = (ans: AnswerMap): string[] => {
    const list: string[] = [];
    const t1 = String(ans.tradeoff_money_meaning || "");
    const t2 = String(ans.tradeoff_expert_generalist || "");
    const t3 = String(ans.tradeoff_stability_autonomy || "");
    if (t1 === "meaning") list.push("Dampak Sosial");
    if (t1 === "money") list.push("Gaji Tinggi");
    if (t2 === "expert") list.push("Penguasaan/Mastery");
    if (t2 === "generalist") list.push("Keluasan/Variety");
    if (t3 === "autonomy") list.push("Otonomi/Autonomy");
    if (t3 === "stability") list.push("Stabilitas");
    if (t1 === "balance") list.push("Keseimbangan");
    if (list.length === 0) list.push("Tidak ada data");
    return list;
  };

  const buildCognitiveProfile = (ans: AnswerMap): Record<string, number> => {
    return {
      ambiguity_tolerance: ans.scenario_ambiguity === "open_ended" ? 5 : ans.scenario_ambiguity === "research" ? 4 : 2,
      collaboration_mode: ans.scenario_collab === "solo" ? 1 : ans.scenario_collab === "small_team" ? 3 : 5,
      risk_tolerance: ans.scenario_risk === "risky" ? 5 : ans.scenario_risk === "balanced" ? 3 : 1,
      feedback_sensitivity: ans.scenario_feedback === "external" ? 4 : 2,
      resilience: ans.scenario_setback === "energized" ? 5 : ans.scenario_setback === "curious" ? 4 : 2,
    };
  };

  const handleRestart = useCallback(() => {
    setStep(-1); setAnswers({}); setResult(null); setError("");
    setPhaseIntroDone({}); setInsightTexts({}); setShowingInsight(null);
  }, []);

  const handleStartDiscovery = (express: boolean) => {
    setExpressMode(express);
    setPhaseIntroDone({});
    setInsightTexts({});
    setShowingInsight(null);
    setStep(0);
  };

  if (!user) return <LockModal show={showLock} />;

  // ========== LANDING (step === -1) ==========
  if (step === -1) {
    const latestResult = history.length > 0 ? history[0] : null;
    return (
      <>
        <Head>
          <title>Dashboard — Life Compass v2</title>
          <meta name="description" content="Mulai discovery karir 9 dimensi. Dapatkan rekomendasi personal dengan gap analysis, feasibility gate, dan rencana aksi." />
          <meta name="robots" content="noindex" />
        </Head>
        <div className="min-h-screen bg-warm">
          <nav className="bg-card border-b-2 border-ink px-6 py-4 flex items-center justify-between sticky top-0 z-40">
            <h1 className="text-xl font-bold text-ink">Life Compass</h1>
            <div className="flex items-center gap-4">
              <a href="/careers" className="text-ink/50 hover:text-ink text-sm font-semibold">Karir</a>
              <a href="/experiments" className="text-ink/50 hover:text-ink text-sm font-semibold">Eksperimen</a>
              <a href="/faq" className="text-ink/50 hover:text-ink text-sm font-semibold">FAQ</a>
              <button onClick={logout} className="text-primary-500 text-sm font-semibold hover:text-primary-600">Logout</button>
            </div>
          </nav>
          <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-ink">Halo, {userName} 👋</h2>
                <p className="text-ink/60 mt-1">Perjalanan karirmu, dipetakan dengan 9 dimensi kecocokan.</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              <Card padding="sm" className="text-center border-2 border-ink/10">
                <div className="text-lg font-bold text-ink">{history.length}</div>
                <div className="text-[10px] text-ink/50 mt-0.5">Discovery</div>
              </Card>
              <Card padding="sm" className="text-center border-2 border-ink/10">
                <div className="text-lg font-bold text-ink">{experiments.length}</div>
                <div className="text-[10px] text-ink/50 mt-0.5">Eksperimen</div>
              </Card>
              <Card padding="sm" className="text-center border-2 border-ink/10">
                <div className="text-lg font-bold text-ink">{experiments.filter(e => e.completion_rate >= 100).length}</div>
                <div className="text-[10px] text-ink/50 mt-0.5">Selesai ✅</div>
              </Card>
              <Card padding="sm" className="text-center border-2 border-ink/10">
                <div className="text-lg font-bold text-ink">9</div>
                <div className="text-[10px] text-ink/50 mt-0.5">Dimensi ⚡</div>
              </Card>
            </div>

            {latestResult && (
              <Card padding="md" className="bg-emerald-50 border-emerald-500 mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="font-bold text-ink">Hasil terakhirmu</p>
                    <p className="text-sm text-ink/70 mt-1">{latestResult.top_result || "Lihat hasil discovery terbaru"}</p>
                    <a href={`/result?id=${latestResult.match_id}`}>
                      <Button size="sm" variant="outline" className="mt-3">Lihat Hasil</Button>
                    </a>
                  </div>
                </div>
              </Card>
            )}

            {/* 90-Day Delta Prompt */}
            {latestResult && (() => {
              const daysSince = latestResult.created_at
                ? Math.floor((Date.now() - new Date(latestResult.created_at).getTime()) / (1000 * 60 * 60 * 24))
                : 999;
              if (daysSince < 90) return null;
              return (
                <Card padding="md" className="bg-amber-50 border-amber-400 border-2">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🔄</span>
                    <div>
                      <p className="font-bold text-ink">Sudah {daysSince} hari sejak discovery terakhirmu</p>
                      <p className="text-sm text-ink/70 mt-1">Ada perubahan dalam 3 bulan terakhir? Skill baru, constraint yang teratasi, atau perubahan prioritas? Update profilmu untuk hasil yang lebih akurat.</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={() => handleStartDiscovery(false)}>Discovery Ulang</Button>
                        <Button size="sm" variant="outline" onClick={() => handleStartDiscovery(true)}>Express Update</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })()}

            {/* Profile Completeness */}
            <Card padding="md" className="border-2 border-ink/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-ink text-sm">Profil Kelengkapan</h3>
                <span className="text-xs text-ink/40">Fitur baru</span>
              </div>
              <p className="text-xs text-ink/60 mb-3">Semakin lengkap profilmu, semakin akurat rekomendasi karir.</p>
              <div className="space-y-2">
                {[
                  { label: "Riwayat Discovery", done: history.length > 0 },
                  { label: "Data Tahap Hidup", done: latestResult?.stage || history.length > 0 },
                  { label: "Eksperimen Aktif", done: experiments.filter(e => e.status !== "completed").length > 0 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${item.done ? "bg-emerald-500 text-white" : "bg-ink/10 text-ink/30"}`}>
                      {item.done ? "✓" : "○"}
                    </span>
                    <span className={`text-xs ${item.done ? "text-ink/70" : "text-ink/40"}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card padding="lg">
              <h3 className="font-bold text-ink text-lg mb-2">Mulai Discovery Baru</h3>
              <p className="text-ink/60 mb-6">
                Penilaian 9 dimensi dengan feasibility gate, gap analysis, dan rekomendasi tiered.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => handleStartDiscovery(false)} size="lg" className="flex-1">
                  Discovery Lengkap (~15 menit)
                </Button>
                <Button onClick={() => handleStartDiscovery(true)} variant="outline" size="lg" className="flex-1">
                  Express Mode (~8 menit)
                </Button>
              </div>
              {expressMode && (
                <p className="text-xs text-amber-600 mt-3 font-medium">
                  Express Mode — Confidence: Medium. Hasil dengan confidence band lebih lebar.
                </p>
              )}
            </Card>

            {history.length > 0 && (
              <div>
                <h3 className="font-bold text-ink text-lg mb-4">Riwayat Discovery</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {history.slice(0, 4).map((item) => (
                    <Card key={item.match_id} padding="sm" hover>
                      <p className="font-semibold text-ink text-sm">{item.top_result || "Hasil Discovery"}</p>
                      <p className="text-xs text-ink/50 mt-1">{item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }) : ""}</p>
                      <a href={`/result?id=${item.match_id}`}>
                        <Button size="sm" variant="ghost" className="mt-2 !text-ink/60 hover:!text-ink">Lihat →</Button>
                      </a>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {experiments.filter(e => e.status !== "completed").length > 0 && (
              <div>
                <h3 className="font-bold text-ink text-lg mb-4">Eksperimen Aktif</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {experiments.filter(e => e.status !== "completed").slice(0, 2).map((plan) => (
                    <Card key={plan.id} padding="sm" hover>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-ink text-sm">{plan.career_title}</p>
                        <span className="text-xs font-bold text-ink/60">{plan.completion_rate || 0}%</span>
                      </div>
                      <div className="h-2 bg-ink/10 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-ink rounded-full transition-all" style={{ width: `${plan.completion_rate || 0}%` }} />
                      </div>
                      <p className="text-xs text-ink/50">{(plan.tasks || []).filter((_, i) => (plan.task_status || []).find(t => t.index === i)?.done).length}/{(plan.tasks || []).length} selesai</p>
                      <a href="/experiments"><Button size="sm" variant="ghost" className="mt-2 !text-ink/60 hover:!text-ink">Lanjutkan →</Button></a>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </>
    );
  }

  // ========== LOADING ==========
  if (loading) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-14 h-14 border-4 border-ink/20 border-t-ink rounded-full animate-spin mx-auto mb-6" />
          <p className="text-lg font-bold text-ink mb-2">3-Pass Scoring Engine</p>
          <p className="text-sm text-ink/60">{loadingText}</p>
        </div>
      </div>
    );
  }

  // ========== ERROR ==========
  if (error) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center">
        <ErrorState message={error} onRetry={handleRestart} />
      </div>
    );
  }

  // ========== RESULT (step === flatQuestions.length) ==========
  if (step === flatQuestions.length) {
    return (
      <PageShell title="Hasil Discovery" showBack backHref="/dashboard">
        <Head><title>Hasil Discovery — Life Compass v2</title></Head>
        <div className="space-y-6">
          {result && (
            <>
              <Card padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-ink">Direction Snapshot</h2>
                  <Badge variant="ink">{result.assessment_version === "v2" ? "v2 ⚡" : "Hasil"}</Badge>
                </div>
                <p className="text-ink/70 mb-6 leading-relaxed">{result.summary}</p>

                {result.exploration_mode ? (
                  <div className="bg-purple-50 border-2 border-purple-400 rounded-xl p-5 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🔭</span>
                      <h3 className="font-bold text-lg text-purple-800">Mode Eksplorasi</h3>
                    </div>
                    <p className="text-sm text-purple-700 mb-4">Kamu belum yakin dengan pilihan karir — itu wajar. Coba 3 eksperimen singkat ini untuk mulai menemukan arah:</p>
                    <div className="space-y-3">
                      {(result.micro_experiments || []).map((exp, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 border border-purple-200">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="purple">{exp.experiment_name}</Badge>
                            <span className="text-sm font-bold text-purple-600">3 Jam</span>
                          </div>
                          <p className="text-sm text-ink/70 mt-2">{exp.action_steps}</p>
                          {exp.what_to_observe && <p className="text-xs text-ink/50 mt-1">Amati: {exp.what_to_observe}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-5 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="emerald">{result.top_recommendation?.label}</Badge>
                      <span className="text-2xl font-bold text-emerald-700">{result.top_recommendation?.score}%</span>
                    </div>
                    <h3 className="text-xl font-bold text-ink mb-1">{result.top_recommendation?.career_title}</h3>
                    <p className="text-ink/60 text-sm">{result.top_recommendation?.reason}</p>
                    {result.tier1?.[0]?.dimensions && (
                      <div className="mt-4 pt-4 border-t border-emerald-200 space-y-1.5">
                        {Object.keys(result.tier1[0].dimensions).map((k) => (
                          <DimensionBar key={k} dimKey={k} value={result.tier1[0].dimensions[k]?.raw ?? 50} maxScore={100} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <a href={`/result?id=${result.match_id}`}><Button>Lihat Detail Lengkap</Button></a>
                  <Button variant="outline" onClick={handleRestart}>Discovery Baru</Button>
                </div>
              </Card>

              {(result.experiment_plan || []).length > 0 && (
                <Card padding="lg">
                  <h3 className="font-bold text-lg text-ink mb-3">Rencana Eksperimen 7 Hari</h3>
                  <div className="space-y-2">
                    {result.experiment_plan.map((task, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm bg-warm rounded-xl p-3 border border-ink/10">
                        <span className="bg-ink text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</span>
                        <span className="text-ink pt-0.5">{task}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </PageShell>
    );
  }

  // ========== DISCOVERY FORM ==========
  const currentFlatIdx = step;
  const { phaseIdx, question } = flatQuestions[currentFlatIdx];
  const currentPhase = phases[phaseIdx];
  const isFirstInPhase = currentFlatIdx === 0 || flatQuestions[currentFlatIdx - 1].phaseIdx !== phaseIdx;
  const isLastInPhase = currentFlatIdx === flatQuestions.length - 1 || flatQuestions[currentFlatIdx + 1]?.phaseIdx !== phaseIdx;

  // Determine what to show
  const showChapterOpen = isFirstInPhase && !phaseIntroDone[phaseIdx];
  const showInsightDrop = showingInsight === phaseIdx;
  const showQuestion = !showChapterOpen && !showInsightDrop;

  const isMultiSelect = question?.type === "multi";
  const isSingleSelect = question?.type === "single" || question?.type === "scenario" || question?.type === "tradeoff";
  const selected = (answers[question?.id || ""] as string[]) || [];
  const isSkillVerify = question?.id === "skills_demonstrated";

  // Advance to next step: handle phase transitions
  const advance = () => {
    if (showInsightDrop) {
      setShowingInsight(null);
      // Go to next phase chapter open (or submit if last phase)
      if (phaseIdx === totalPhases - 1) {
        submitDiscovery();
      } else {
        const nextStep = flatQuestions.findIndex((fq) => fq.phaseIdx === phaseIdx + 1);
        if (nextStep >= 0) setStep(nextStep);
        else setStep(currentFlatIdx + 1);
      }
      return;
    }
    if (isLastInPhase) {
      // Last question of phase → show insight drop
      setShowingInsight(phaseIdx);
      if (!insightTexts[phaseIdx]) {
        fetchInsight(phaseIdx);
      }
      return;
    }
    setStep(currentFlatIdx + 1);
  };

  const fetchInsight = async (pi: number) => {
    setInsightLoading(pi);
    const phaseAnswers: Record<string, unknown> = {};
    phases[pi].questions.forEach((q) => {
      if (answers[q.id] !== undefined) phaseAnswers[q.id] = answers[q.id];
    });
    const res = await safeFetch<{ insight: string }>("/api/discovery/insight", {
      method: "POST", data: { phase_id: phases[pi].id, answers: phaseAnswers },
      token: user?.token, baseUrl: api,
    });
    if (res.ok && res.data?.insight) {
      setInsightTexts((prev) => ({ ...prev, [pi]: res.data.insight }));
    } else {
      // Fallback insight
      const fallbacks: Record<string, string> = {
        foundation: "Kamu berani memulai perjalanan ini — itu sudah setengah dari perjuangan.",
        skills: "Mengenali kemampuan diri adalah fondasi karir yang kokoh.",
        interests: "Minat adalah kompas alami dalam perjalanan karir.",
        values: "Mengetahui apa yang benar-benar penting bagimu adalah kekuatan super.",
        scenarios: "Pola pilihanmu mengungkapkan banyak tentang lingkungan kerja ideal.",
        barriers: "Mengenali hambatan adalah peta jalan menuju solusi.",
        environment: "Sekarang kamu punya gambaran lebih jelas tentang tempatmu bisa berkembang.",
      };
      setInsightTexts((prev) => ({ ...prev, [pi]: fallbacks[phases[pi].id] || "Teruslah berefleksi!" }));
    }
    setInsightLoading(null);
  };

  const startPhase = (pi: number) => {
    setPhaseIntroDone((prev) => ({ ...prev, [pi]: true }));
    setShowingInsight(null);
  };

  const handleSelect = (value: string) => {
    if (!question) return;
    if (isSingleSelect) {
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
    } else if (isMultiSelect) {
      setAnswers((prev) => ({
        ...prev,
        [question.id]: selected.includes(value)
          ? selected.filter((s) => s !== value)
          : [...selected, value],
      }));
    }
  };

  return (
    <div className="min-h-screen bg-warm">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <ProgressSteps
          current={flatQuestions.findIndex((fq) => fq.phaseIdx === phaseIdx)}
          total={flatQuestions.length}
        />

        {/* ===== CHAPTER OPENING SCREEN ===== */}
        {showChapterOpen && (
          <Card padding="lg">
            <div className="text-center py-4">
              <span className="text-5xl block mb-4">{currentPhase.icon}</span>
              <h2 className="text-2xl font-bold text-ink mb-2">{currentPhase.title}</h2>
              <p className="text-ink/60 mb-2">{currentPhase.desc}</p>
              <p className="text-xs text-ink/40 mb-6">{currentPhase.questions.length} pertanyaan</p>
              <Button onClick={() => startPhase(phaseIdx)} className="w-full">
                Mulai →
              </Button>
            </div>
          </Card>
        )}

        {/* ===== INSIGHT DROP ===== */}
        {showInsightDrop && (
          <Card padding="lg" className="bg-amber-50 border-amber-300 border-2">
            <div className="text-center py-2">
              <span className="text-3xl block mb-3">✨</span>
              <h3 className="font-bold text-ink text-lg mb-3">Insight untukmu</h3>
              {insightLoading === phaseIdx ? (
                <div className="flex items-center justify-center gap-2 text-ink/50 text-sm">
                  <div className="w-4 h-4 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
                  Merenungkan jawabanmu...
                </div>
              ) : (
                <p className="text-ink/80 leading-relaxed italic">
                  "{insightTexts[phaseIdx] || 'Teruslah berefleksi!'}"
                </p>
              )}
              <div className="mt-6">
                <Button onClick={advance} className="w-full">
                  {phaseIdx === totalPhases - 1 ? "Lihat Hasil ✨" : "Lanjut →"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ===== QUESTION ===== */}
        {showQuestion && (
          <Card padding="lg">
            <div className="flex items-center justify-between text-xs font-medium mb-3">
              <span className="bg-ink/5 text-ink/50 px-2.5 py-1 rounded-full">
                {currentPhase.title} — {currentFlatIdx + 1} dari {flatQuestions.length}
              </span>
              <span className="text-ink/30">{currentPhase.icon || "📝"}</span>
            </div>
            <h2 className="text-xl font-bold text-ink mb-1">{question.question}</h2>
            {question.hint && <p className="text-xs text-ink/40 mb-6">{question.hint}</p>}

            {/* Type: textarea */}
            {question.type === "textarea" && (
              <div>
                <textarea
                  value={String(answers[question.id] || "")}
                  onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                  placeholder={question.placeholder}
                  className="w-full border-2 border-ink/20 rounded-xl px-4 py-3 h-32 focus:outline-none focus:border-ink text-sm bg-warm"
                  maxLength={question.maxLength || 2000}
                />
                <p className="text-xs text-ink/40 mt-1 text-right">{String(answers[question.id] || "").length}/{question.maxLength || 2000}</p>
              </div>
            )}

            {/* Type: text */}
            {question.type === "text" && (
              <input
                type="text"
                value={String(answers[question.id] || "")}
                onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                placeholder={question.placeholder}
                className="w-full border-2 border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:border-ink text-sm bg-warm"
                maxLength={question.maxLength || 200}
              />
            )}

            {/* Type: number */}
            {question.type === "number" && (
              <input
                type="number"
                value={String(answers[question.id] ?? "")}
                onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value ? Number(e.target.value) : "" })}
                placeholder={question.placeholder}
                min={question.min}
                max={question.max}
                className="w-full border-2 border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:border-ink text-sm bg-warm"
              />
            )}

            {/* Type: multi select */}
            {isMultiSelect && !isSkillVerify && question.options && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-ink/40">Pilih satu atau lebih</p>
                  {selected.length > 0 && (
                    <span className="text-xs font-semibold text-ink/60 bg-ink/5 px-2.5 py-1 rounded-full">{selected.length} dipilih</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {question.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(opt.value)}
                      className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                        selected.includes(opt.value)
                          ? "bg-ink text-white border-ink"
                          : "bg-warm text-ink/70 border-ink/20 hover:border-ink/50"
                      }`}
                    >
                      {opt.icon && <span className="mr-2">{opt.icon}</span>}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Type: single / scenario / tradeoff */}
            {isSingleSelect && question.options && (
              <div className="grid grid-cols-1 gap-3">
                {question.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                      String(answers[question.id] || "") === opt.value
                        ? "bg-ink text-white border-ink"
                        : "bg-warm text-ink/70 border-ink/20 hover:border-ink/50"
                    }`}
                  >
                    {opt.icon && <span className="mr-2">{opt.icon}</span>}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Skill verification: multi-select from already-selected skills */}
            {isSkillVerify && (
              <div>
                <p className="text-xs text-ink/40 mb-3">Centang skill yang sudah pernah kamu gunakan di dunia nyata</p>
                <div className="grid grid-cols-2 gap-3">
                  {((answers.skills as string[]) || []).length === 0 ? (
                    <p className="text-xs text-ink/50 col-span-2">Pilih skill dulu di langkah sebelumnya.</p>
                  ) : (
                    ((answers.skills as string[]) || []).map((sk) => (
                      <button
                        key={sk}
                        onClick={() => handleSelect(sk)}
                        className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                          selected.includes(sk)
                            ? "bg-ink text-white border-ink"
                            : "bg-warm text-ink/70 border-ink/20 hover:border-ink/50"
                        }`}
                      >
                        {sk}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              {currentFlatIdx > 0 && (
                <Button variant="outline" onClick={() => setStep(currentFlatIdx - 1)}>Kembali</Button>
              )}
              <Button
                onClick={advance}
                disabled={
                  question.type === "textarea" || question.type === "text" || question.type === "number"
                    ? false
                    : isMultiSelect
                    ? selected.length === 0
                    : !answers[question.id]
                }
                className="flex-1"
              >
                {isLastInPhase ? "Selesai Fase Ini" : "Lanjut"}
              </Button>
            </div>
          </Card>
        )}

        <div className="mt-4 text-center">
          <button onClick={handleRestart} className="text-ink/40 text-sm hover:text-ink font-medium">
            Batalkan
          </button>
        </div>
      </div>
    </div>
  );
}
