import { useEffect, useState } from "react";
import Head from "next/head";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import DimensionBar from "../components/ui/DimensionBar";

const DIM_KEYS = ["skill", "interest", "value", "education", "constraints", "preference"];

const FEATURES = [
  { icon: "📋", title: "Discovery 7 Fase", desc: "9 dimensi pertanyaan: skill, minat, nilai, kognitif, pendidikan, kendala, lingkungan, pasar, dan lintasan karir.", badge: "Gratis" },
  { icon: "🎯", title: "3-Pass Scoring Engine", desc: "Feasibility gate → 9 dimensi → synthesis. Skor dengan confidence band yang transparan.", badge: "Akurat" },
  { icon: "🗺️", title: "Career Intelligence Report", desc: "Tier 1 (full analysis + gap analysis), Tier 2 (alternatif kuat), dan Tier 3 (inspirasi masa depan).", badge: "Personal" },
  { icon: "🚀", title: "Eksperimen 7 Hari", desc: "Rencana aksi konkret untuk menguji karir pilihanmu sebelum berkomitmen penuh.", badge: "Rencana" },
  { icon: "💬", title: "Asisten Karir AI", desc: "Tanya soal karir, jurusan, atau skill kapan saja. Ditenagai oleh Google Gemini.", badge: "AI" },
  { icon: "📈", title: "Riwayat & Progress", desc: "Pantau perjalanan karirmu dari waktu ke waktu.", badge: "Gratis" },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Jawab Discovery", desc: "Isi 7 fase pertanyaan (9 dimensi). Hanya 8–15 menit." },
  { step: "2", title: "Dapatkan Skor", desc: "Sistem mencocokkan jawabanmu dengan 27+ profil karir Indonesia." },
  { step: "3", title: "Eksplorasi Hasil", desc: "Lihat skor kecocokan, penjelasan, dan rekomendasi personal." },
  { step: "4", title: "Coba Eksperimen", desc: "Pilih eksperimen 7 hari dan mulai action minggu ini." },
  { step: "5", title: "Evaluasi & Ulang", desc: "Simpan progress, ulangi discovery, dan evaluasi langkahmu." },
];

const FAQS = [
  { q: "Apakah Life Compass gratis?", a: "Ya! 100% gratis. Semua fitur bisa diakses tanpa biaya, tanpa kartu kredit, tanpa langganan." },
  { q: "Apakah hasilnya menentukan masa depan saya?", a: "Hasilnya adalah indikasi kecocokan awal, bukan vonis. Gunakan sebagai bahan refleksi dan langkah pertama untuk divalidasi dengan eksperimen kecil." },
  { q: "Apakah saya harus login?", a: "Kamu bisa lihat contoh hasil tanpa login. Tapi untuk menyimpan progress dan mengakses semua fitur, daftar gratis." },
  { q: "Untuk siapa Life Compass?", a: "Siswa bingung jurusan, fresh graduate, pekerja mau pindah karir, atau siapa pun yang merasa stuck." },
  { q: "Apakah data saya aman?", a: "Data dienkripsi, tidak dijual ke pihak ketiga. AI tidak dilatih dari data kamu. Kamu bisa hapus akun kapan saja." },
];

const SITE_URL = "https://lifecompass.arishia.cyou";

export default function Landing({ user, logout, api }) {
  const [sample, setSample] = useState(null);
  const [showSample, setShowSample] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openDim, setOpenDim] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) {
      fetch(`${api}/api/sample-report`)
        .then((r) => r.json())
        .then(setSample)
        .catch(() => {});
    }
  }, []);

  if (user && mounted) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
    return null;
  }

  return (
    <>
      <Head>
        <title>Life Compass — Konsultan Karir Online Gratis untuk Pelajar & Pencari Kerja Indonesia</title>
          <meta name="description" content="Bingung pilih karir, jurusan, atau langkah selanjutnya? Life Compass alat bantu karir gratis dengan discovery 9 dimensi, 3-pass scoring engine, gap analysis, dan rencana aksi 7 hari. Untuk siswa SMA, fresh graduate, dan career switcher." />
        <meta property="og:title" content="Life Compass — Konsultan Karir Online Gratis untuk Pelajar & Pencari Kerja" />
        <meta property="og:description" content="Bingung pilih karir? Life Compass bantu kamu dengan 9 dimensi kecocokan, gap analysis, dan rencana aksi 7 hari. Gratis." />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Life Compass — Konsultan Karir Online Gratis" />
        <meta name="twitter:description" content="Bingung pilih karir? Gratis, 10 menit, dapatkan arah yang lebih jelas." />
        <link rel="canonical" href={SITE_URL} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Life Compass",
          "url": SITE_URL,
          "description": "Alat bantu keputusan karir gratis untuk pelajar dan pencari kerja Indonesia.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${SITE_URL}/faq?search={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": FAQS.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a }
          }))
        }) }} />
      </Head>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-card border-b-2 border-ink">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-ink tracking-tight">Life Compass</span>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#cara-kerja" className="text-sm text-ink/60 hover:text-ink font-medium">Cara Kerja</a>
            <a href="#fitur" className="text-sm text-ink/60 hover:text-ink font-medium">Fitur</a>
            <a href="/careers" className="text-sm text-ink/60 hover:text-ink font-medium">Karir</a>
            <a href="#hasil" className="text-sm text-ink/60 hover:text-ink font-medium">Contoh Hasil</a>
            <a href="#faq" className="text-sm text-ink/60 hover:text-ink font-medium">FAQ</a>
            <a href="/login" className="text-sm text-ink/60 hover:text-ink font-medium">Masuk</a>
            <a href="/login"><Button size="sm">Mulai Gratis</Button></a>
          </div>

          {/* Mobile Hamburger */}
          <button onClick={() => setNavOpen(!navOpen)} className="md:hidden p-2 text-ink" aria-label="Menu navigasi">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {navOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav Menu */}
        {navOpen && (
          <div className="md:hidden bg-card border-t-2 border-ink/10 px-6 py-4 space-y-3">
            <a href="#cara-kerja" onClick={() => setNavOpen(false)} className="block text-ink/70 hover:text-ink font-medium">Cara Kerja</a>
            <a href="#fitur" onClick={() => setNavOpen(false)} className="block text-ink/70 hover:text-ink font-medium">Fitur</a>
            <a href="/careers" onClick={() => setNavOpen(false)} className="block text-ink/70 hover:text-ink font-medium">Database Karir</a>
            <a href="#hasil" onClick={() => setNavOpen(false)} className="block text-ink/70 hover:text-ink font-medium">Contoh Hasil</a>
            <a href="#faq" onClick={() => setNavOpen(false)} className="block text-ink/70 hover:text-ink font-medium">FAQ</a>
            <a href="/login" onClick={() => setNavOpen(false)} className="block text-ink/70 hover:text-ink font-medium">Masuk</a>
            <a href="/login" onClick={() => setNavOpen(false)}><Button className="w-full">Mulai Gratis</Button></a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-16 md:pt-28 md:pb-24">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="ink" className="mb-6">Konsultan Karir Online — Gratis</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-ink mb-6 leading-tight tracking-tight font-display">
            Seperti Konsultan Karir,<br />
            <span className="text-primary-500">Tapi Gratis.</span>
          </h1>
          <p className="text-lg md:text-xl text-ink/60 mb-10 leading-relaxed max-w-2xl mx-auto">
            Bingung pilih karir, jurusan, atau langkah selanjutnya? <strong className="text-ink">Tidak sendiri.</strong>
            Life Compass membantumu memahami minat, skill, dan nilai, membandingkan 27+ profil karir Indonesia secara objektif,
            lalu memberi <strong className="text-ink">langkah kecil minggu ini</strong>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/login">
              <Button size="lg" className="text-base px-10 py-4 shadow-lg shadow-ink/10">
                Mulai Gratis — 10 Menit
              </Button>
            </a>
            <a href="#cara-kerja">
              <Button variant="outline" size="lg" className="text-base px-10 py-4">
                Lihat Cara Kerja
              </Button>
            </a>
          </div>

          {/* Hero preview cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto text-left">
            <Card padding="sm" className="text-center border-2 border-ink/10">
              <div className="text-3xl mb-1">⚡</div>
              <div className="text-2xl font-bold text-ink">9 Dimensi</div>
              <div className="text-xs text-ink/60">Penilaian menyeluruh</div>
            </Card>
            <Card padding="sm" className="text-center border-2 border-ink/10">
              <div className="text-3xl mb-1">📊</div>
              <div className="text-2xl font-bold text-ink">27+</div>
              <div className="text-xs text-ink/60">Profil Karir Indonesia</div>
            </Card>
            <Card padding="sm" className="text-center border-2 border-ink/10">
              <div className="text-3xl mb-1">✅</div>
              <div className="text-2xl font-bold text-ink">7 Hari</div>
              <div className="text-xs text-ink/60">Rencana Eksperimen</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-ink text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              100% Gratis
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Berbasis Data Karir Indonesia
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Skor Objektif & Explainable
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Rencana Aksi 7 Hari
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Untuk Pelajar, Fresh Graduate & Career Switcher
            </span>
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <Badge variant="coral" className="mb-4">Masalah</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">Pernah merasa seperti ini?</h2>
          <p className="text-ink/60 mb-12 max-w-xl mx-auto">
            Ribuan orang Indonesia mengalami kebingungan karir yang sama setiap tahun.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {[
              { emoji: "😕", title: "Bingung", desc: "Memilih jurusan atau karir yang tepat" },
              { emoji: "😰", title: "Takut", desc: "Salah arah dan buang waktu bertahun-tahun" },
              { emoji: "🫨", title: "Overwhelmed", desc: "Terlalu banyak pilihan, tidak tahu mulai dari mana" },
              { emoji: "🤷", title: "Buntu", desc: "Tidak tahu langkah konkret yang harus diambil" },
            ].map((item, i) => (
              <Card key={i} padding="md" className="text-center border-2 border-ink/10">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-bold text-ink mb-1">{item.title}</h3>
                <p className="text-sm text-ink/60">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions / Features */}
      <section id="fitur" className="bg-ink text-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge variant="emerald" className="mb-4">Solusi</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Life Compass Membantumu</h2>
            <p className="text-white/60 max-w-lg mx-auto">
              Bukan sekadar tes biasa. 3-pass scoring engine dengan feasibility gate dan 9 dimensi kecocokan.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Card key={i} padding="md" className="!bg-white/10 !border-white/20 text-white hover:!bg-white/15 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{f.icon}</div>
                  <Badge variant="ink">{f.badge}</Badge>
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="cara-kerja" className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge variant="blue" className="mb-4">Cara Kerja</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-3">Bagaimana Life Compass Bekerja</h2>
            <p className="text-ink/60">Hanya 5 langkah, selesai dalam 10–15 menit</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-ink rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-bold text-ink text-base mb-2">{item.title}</h3>
                <p className="text-xs text-ink/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-ink text-white py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <Badge variant="emerald" className="mb-4">Testimonial</Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Apa Kata Pengguna?</h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              { name: "Dinda, 19", text: "Baru lulus SMA bingung milih jurusan. Setelah coba Life Compass, aku jadi lebih tau arah yang cocok." },
              { name: "Rizky, 24", text: "Udah 2 tahun kerja tapi ngerasa salah jurusan. Discovery 9 dimensinya bener-bener bikin aku refleksi." },
              { name: "Sari, 28", text: "Mau pindah karir ke IT tapi takut. Eksperimen 7 hari-nya bantu aku coba dulu tanpa resiko." },
            ].map((t, i) => (
              <div key={i} className="bg-white/10 border border-white/20 rounded-xl p-5">
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-3">"{t.text}"</p>
                <p className="text-white/50 text-xs font-semibold">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9 Dimensions explanation - interactive */}
      <section className="bg-warm border-y-2 border-ink/10 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge variant="coral" className="mb-4">9 Dimensi Penilaian</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-3">Kami Menilai dari Berbagai Sisi</h2>
            <p className="text-ink/60">Klik setiap dimensi untuk penjelasan lebih dalam.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "🛠️", title: "Skill Alignment", desc: "Skill yang kamu miliki vs skill yang dibutuhkan karir. Dibedakan: claimed, demonstrated, dan in-progress.", detail: "Sistem membandingkan skill-mu dengan required_skills (wajib) dan optional_skills (nilai tambah) setiap karir. Skill 'demonstrated' (pernah dipakai di dunia nyata) mendapat bobot lebih tinggi daripada 'claimed' (pernah belajar) atau 'in-progress' (sedang dipelajari). Anti-skill akan menjadi penalty." },
              { icon: "🎯", title: "Interest Resonance", desc: "Domain, aktivitas, dan tipe masalah yang kamu sukai. Ditambah kode Holland RIASEC.", detail: "Tiga sumbu pemetaan: Domain (teknologi, kesehatan, dll), Aktivitas (menulis, coding, presentasi), dan Tipe Masalah (analitis, kreatif, manusia). Ditambah kode Holland (RIASEC) yang di-infer dari jawaban Phase 4. Semakin cocok dengan tipikal karir, semakin tinggi skor." },
              { icon: "💎", title: "Values Alignment", desc: "Nilai kerja berdasarkan hirarki prioritas — diungkap lewat trade-off scenario.", detail: "Trade-off scenario di Phase 5 mengungkap prioritas sesungguhnya: gaji vs meaning, expert vs generalist, stabilitas vs otonomi. Nilai-nilai ini dibandingkan dengan culture profile karir (bureaucracy_level, autonomy_level, work_life_balance, dll)." },
              { icon: "🧠", title: "Cognitive Fit", desc: "Kecocokan gaya berpikir, toleransi risiko, dan cara kerja dengan lingkungan karir.", detail: "Dari scenario-based questions Phase 2, sistem mengukur: ambiguity_tolerance, collaboration_mode, risk_tolerance, feedback_sensitivity, dan resilience. Karir yang cocok dengan profil kognitifmu akan lebih memuaskan dalam jangka panjang." },
              { icon: "🎓", title: "Education Alignment", desc: "Latar belakang pendidikan vs jalur masuk karir, termasuk jalur alternatif.", detail: "Membandingkan pendidikan terakhirmu dengan education_paths dan alternative_paths karir. Bobot disesuaikan berdasarkan time_to_first_job dan credential_weight karir. Jika tidak punya gelar formal, bobot education alignment turun." },
              { icon: "🚧", title: "Constraint Impact", desc: "Kendala sebagai penalty, modifier, atau advantage — tergantung konteks karir.", detail: "Constraints-mu (biaya, lokasi, waktu, dukungan keluarga) menjadi filter. Kendala permanen mendapat penalty lebih besar daripada yang bisa diatasi dalam <6 bulan. Tapi kendala juga bisa menjadi advantage — misal lokasi tertentu punya akses ke industri spesifik." },
              { icon: "🏢", title: "Environment Fit", desc: "Preferensi lingkungan kerja: remote/kantor, startup/korporat, kecepatan tim.", detail: "Dari jawaban Phase 7 tentang environment: team_size_pref, pace_pref, remote_availability. Karir dengan budaya yang cocok akan mengurangi risiko burnout dan meningkatkan retensi jangka panjang." },
              { icon: "📈", title: "Market Timing", desc: "Prospek pasar, pertumbuhan 5 tahun, risiko AI, dan tingkat kejenuhan.", detail: "Dinamis berdasarkan kondisi pasar karir: growth_rate_5yr, saturation_risk, ai_displacement_score/timeline, dan remote_availability. Bobot dimensi ini naik drastis jika user memiliki high_financial_urgency." },
              { icon: "🧭", title: "Trajectory Alignment", desc: "Apakah karir ini mengarah ke tujuan jangka panjangmu? Jalur manajemen, IC, atau wirausaha.", detail: "Membandingkan aspirasi jangka panjang user (dari Phase 1) dengan career_ladder, management_track, ic_track, dan entrepreneurial_exit karir. Karir yang alignment tinggi akan terasa seperti 'jalan yang benar' bukan sekadar pekerjaan." },
            ].map((item, i) => (
              <Card key={i} padding="md" className="border-2 border-ink/10 transition-all hover:border-ink/40 hover:shadow-md"
                onClick={() => setOpenDim(openDim === i ? null : i)}
              >
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-ink mb-1">{item.title}</h3>
                <p className="text-sm text-ink/60 leading-relaxed">{item.desc}</p>
                {openDim === i && (
                  <div className="mt-3 pt-3 border-t border-ink/10 text-sm text-ink/70 leading-relaxed animate-in slide-in-from-top-2 duration-200">
                    {item.detail}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Product preview */}
      {sample && (
        <section id="hasil" className="py-20 md:py-28">
          <div className="max-w-2xl mx-auto px-6">
            <div className="text-center mb-10">
              <Badge variant="amber" className="mb-4">Contoh Hasil</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-ink mb-3">Seperti Apa Hasilnya?</h2>
              <p className="text-ink/60">Lihat contoh hasil discovery sebelum kamu daftar.</p>
            </div>
            <Card padding="lg" className="border-2 border-ink/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-ink">Direction Snapshot</h3>
                <Badge variant="ink">Contoh</Badge>
              </div>
              <p className="text-ink/70 mb-6 leading-relaxed">{sample.summary}</p>

              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-5 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="emerald">{sample.top_recommendation.label}</Badge>
                  <span className="text-2xl font-bold text-emerald-700">{sample.top_recommendation.score}%</span>
                </div>
                <h4 className="text-xl font-bold text-ink mb-1">{sample.top_recommendation.career_title}</h4>
                <p className="text-sm text-ink/60 mb-4">{sample.top_recommendation.reason}</p>
                <div className="pt-3 border-t border-emerald-200 space-y-1.5">
                  {DIM_KEYS.map((k) => {
                    const v = sample.results?.[0]?.dimensions?.[k];
                    return v !== undefined ? <DimensionBar key={k} dimKey={k} value={v} /> : null;
                  })}
                </div>
              </div>

              <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="amber">{sample.exploration.label}</Badge>
                  <span className="text-2xl font-bold text-amber-700">{sample.exploration.score}%</span>
                </div>
                <h4 className="text-xl font-bold text-ink mb-1">{sample.exploration.career_title}</h4>
                <p className="text-sm text-ink/60">{sample.exploration.reason}</p>
                <div className="pt-3 border-t border-amber-200 space-y-1.5">
                  {DIM_KEYS.map((k) => {
                    const v = sample.results?.[1]?.dimensions?.[k];
                    return v !== undefined ? <DimensionBar key={k} dimKey={k} value={v} /> : null;
                  })}
                </div>
              </div>

              {(sample.experiment_plan || []).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-sm text-ink mb-3">Rencana Eksperimen 7 Hari</h4>
                  <div className="space-y-1.5">
                    {sample.experiment_plan.slice(0, 4).map((task, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs bg-warm rounded-lg p-2.5 border border-ink/10">
                        <span className="bg-ink text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-[10px] font-bold">{i + 1}</span>
                        <span className="text-ink pt-px">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <a href="/login">
                <Button className="w-full" size="lg">Mulai Sekarang — Gratis</Button>
              </a>
            </Card>
          </div>
        </section>
      )}

      {/* Experiment preview */}
      <section className="bg-ink text-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <Badge variant="emerald" className="mb-4">Rencana Aksi</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Bukan Cuma Hasil, Tapi Rencana</h2>
            <p className="text-white/60 max-w-lg mx-auto">
              Setiap rekomendasi karir dilengkapi eksperimen 7 hari. Coba dulu sebelum memutuskan.
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 max-w-lg mx-auto">
            <p className="text-white/80 text-sm font-semibold mb-4">Contoh Eksperimen untuk UI/UX Designer:</p>
            <div className="space-y-2">
              {["Cari 3 lowongan dan catat skill yang diminta", "Tonton 1 video tentang keseharian profesi ini", "Coba redesign 1 aplikasi sederhana", "Hubungi 1 orang yang bekerja di bidang ini"].map((t, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="bg-white/20 text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</span>
                  <span className="text-white/80 pt-0.5">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Chatbot preview */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge variant="blue" className="mb-4">Asisten Karir AI</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4 leading-tight">
                Tanya Apa Saja Soal Karir
              </h2>
              <p className="text-ink/60 mb-6 leading-relaxed">
                Butuh saran cepat? Tanya asisten karir Life Compass kapan saja.
                Mulai dari jurusan kuliah, skill yang harus dipelajari, sampai cara nego gaji.
              </p>
              <div className="bg-warm border-2 border-ink/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-ink text-white text-xs rounded-xl px-3 py-2 max-w-[80%]">Aku bingung antara desain dan teknologi, cocoknya ke mana?</div>
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-ink/10 text-ink text-xs rounded-xl px-3 py-2 max-w-[80%]">
                    Kombinasi desain dan teknologi cocok untuk peran UI/UX Designer, Frontend Developer, atau Creative Technologist. Mau coba eksplorasi salah satunya?
                  </div>
                </div>
              </div>
              <p className="text-xs text-ink/40 mt-3">Ditenagai oleh Google Gemini.</p>
            </div>
            <div className="hidden md:block">
              <Card padding="lg" className="border-2 border-ink/10">
                <div className="font-bold text-ink mb-3">Tanyakan ini:</div>
                <div className="space-y-2">
                  {[
                    "Skill apa yang harus kupelajari untuk data analyst?",
                    "Aku fresh graduate, karir apa yang cocok?",
                    "Gimana cara pindah karir dari marketing ke IT?",
                    "Buatkan eksperimen 7 hari untuk UI/UX"
                  ].map((s, i) => (
                    <div key={i} className="text-sm bg-warm border border-ink/10 rounded-xl px-4 py-2.5 text-ink/70">{s}</div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Motivation section */}
      <section className="bg-ink text-white py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="text-4xl mb-6">💡</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight font-display">
            Tidak perlu langsung tahu semuanya.
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-lg mx-auto">
            Mulai dari langkah kecil. Setiap eksperimen, setiap discovery, membantumu mendekati arah yang lebih jelas.
          </p>
          <a href="/login">
            <Button variant="secondary" size="lg" className="text-base px-10 py-4 shadow-xl">
              Mulai Gratis
            </Button>
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <Badge variant="blue" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-3">Pertanyaan Umum</h2>
            <p className="text-ink/60">Cari jawaban seputar Life Compass</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <Card key={i} padding="sm" className="!p-0 overflow-hidden border-2 border-ink/10">
                <button
                onClick={() => setOpenDim(openDim === i ? null : i)}
                  className="w-full text-left px-6 py-4 font-semibold text-ink flex justify-between items-center hover:bg-warm transition gap-4"
                >
                  <span>{f.q}</span>
                  <svg
                    className={`w-4 h-4 text-ink/40 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-ink/70 leading-relaxed text-sm">{f.a}</div>
                )}
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <a href="/faq" className="text-ink/60 hover:text-ink font-semibold text-sm underline underline-offset-4">
              Lihat semua FAQ →
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-ink text-white py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight font-display">
            Siap menemukan langkah pertama yang lebih jelas?
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-lg mx-auto">
            Gratis, 10–15 menit, tanpa risiko. Mulai sekarang.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/login">
              <Button variant="secondary" size="lg" className="text-base px-10 py-4 shadow-xl">
                Mulai Gratis
              </Button>
            </a>
            <a href="#faq">
              <Button variant="outline" size="lg" className="text-base px-10 py-4 !border-white/30 !text-white hover:!bg-white/10">
                Baca FAQ
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t-2 border-ink py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="font-bold text-ink text-lg mb-2 tracking-tight">Life Compass</div>
          <p className="text-ink/50 text-sm mb-4">
            Konsultan karir online gratis. Bukan konseling profesional — gunakan hasil sebagai bahan refleksi awal.
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
            <a href="/faq" className="text-ink/60 hover:text-ink font-medium">FAQ</a>
            <a href="/privacy" className="text-ink/60 hover:text-ink font-medium">Kebijakan Privasi</a>
            <a href="/terms" className="text-ink/60 hover:text-ink font-medium">Syarat &amp; Ketentuan</a>
            <a href="/disclaimer" className="text-ink/60 hover:text-ink font-medium">Disclaimer</a>
            <a href="/login" className="text-ink/60 hover:text-ink font-medium">Login</a>
          </div>
          <p className="text-ink/40 text-xs mt-6">
            Life Compass bukan pengganti konseling profesional. Hasil bersifat indikasi kecocokan awal,
            bukan vonis karir. Selalu validasi dengan eksperimen dan riset lanjutan.
          </p>
        </div>
      </footer>
    </>
  );
}
