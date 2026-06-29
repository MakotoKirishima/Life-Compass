import { useEffect, useState } from "react";
import Head from "next/head";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const FEATURES = [
  { icon: "📋", title: "Discovery Terstruktur", desc: "7 bagian pertanyaan untuk memahami minat, skill, dan situasimu secara mendalam.", badge: "Gratis" },
  { icon: "🎯", title: "Career Match", desc: "AI mencocokkan jawabanmu dengan puluhan jalur karir Indonesia.", badge: "Akurat" },
  { icon: "🗺️", title: "Direction Map", desc: "Dapatkan peta arah karir yang jelas dengan rekomendasi personal.", badge: "Personal" },
  { icon: "🚀", title: "Eksperimen 7 Hari", desc: "Rencana aksi konkret untuk menguji karir pilihanmu.", badge: "Rencana 7 hari" },
  { icon: "📈", title: "Riwayat Progress", desc: "Pantau perjalanan karirmu dan lihat perkembangan dari waktu ke waktu.", badge: "Butuh login" },
  { icon: "💬", title: "Asisten Karir", desc: "Tanya soal karir, skill, atau jurusan kapan saja.", badge: "AI" },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Jawab Discovery", desc: "Isi 7 bagian pertanyaan tentang minat, skill, dan situasimu. Hanya 8–12 menit." },
  { step: "2", title: "Dapatkan Hasil", desc: "AI mencocokkan jawabanmu dengan database karir Indonesia." },
  { step: "3", title: "Eksperimen 7 Hari", desc: "Pilih eksperimen kecil dan mulai action minggu ini." },
  { step: "4", title: "Evaluasi & Lanjut", desc: "Simpan progress, ulangi discovery, dan evaluasi langkah berikutnya." },
];

const FAQS = [
  { q: "Apakah Life Compass gratis?", a: "Ya! 100% gratis. Semua fitur bisa diakses tanpa biaya, tanpa kartu kredit." },
  { q: "Apakah hasilnya menentukan masa depan saya?", a: "Hasilnya adalah bahan refleksi dan rencana awal, bukan vonis. Gunakan sebagai panduan, bukan penentu mutlak." },
  { q: "Apakah saya harus login?", a: "Kamu bisa lihat contoh hasil tanpa login. Tapi untuk menyimpan progress dan mengakses semua fitur, kamu perlu daftar gratis." },
  { q: "Apakah cocok untuk pelajar/mahasiswa/fresh graduate?", a: "Sangat cocok! Life Compass dirancang untuk siapa pun yang baru memulai atau sedang mempertimbangkan arah karir." },
  { q: "Apakah data saya disimpan?", a: "Data kamu dienkripsi, tidak dijual ke pihak ketiga, dan AI tidak dilatih dari data kamu. Kamu bisa hapus akun kapan saja." },
];

const SITE_URL = "https://lifecompass.arishia.cyou";

export default function Landing({ user, logout, api }) {
  const [sample, setSample] = useState(null);
  const [showSample, setShowSample] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

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
        <title>Life Compass — Temukan Arah Kariermu</title>
        <meta name="description" content="Life Compass membantu kamu memahami minat, skill, dan langkah kecil untuk menentukan arah karier secara lebih jelas." />
        <meta property="og:title" content="Life Compass — Temukan Arah Kariermu" />
        <meta property="og:description" content="Alat bantu keputusan karir gratis untuk pelajar dan pencari kerja Indonesia." />
        <meta property="og:url" content={SITE_URL} />
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
      </Head>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-card border-b-2 border-ink">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-ink">Life Compass</span>
          <div className="flex items-center gap-6">
            <a href="#cara-kerja" className="text-sm text-ink/60 hover:text-ink hidden sm:block font-medium">Cara Kerja</a>
            <a href="#fitur" className="text-sm text-ink/60 hover:text-ink hidden sm:block font-medium">Fitur</a>
            <a href="#faq" className="text-sm text-ink/60 hover:text-ink hidden sm:block font-medium">FAQ</a>
            <a href="/login" className="text-sm text-ink/60 hover:text-ink font-medium">Masuk</a>
            <a href="/login">
              <Button size="sm">Mulai Gratis</Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="ink" className="mb-6">100% Gratis — Untuk Pelajar & Pencari Karir</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-ink mb-6 leading-tight tracking-tight">
            Temukan Arah Kariermu<br />dengan Lebih Jelas
          </h1>
          <p className="text-lg md:text-xl text-ink/60 mb-10 leading-relaxed max-w-2xl mx-auto">
            Life Compass membantumu memahami minat, skill, situasi, dan langkah kecil
            yang bisa kamu mulai <strong className="text-ink">minggu ini</strong>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/login">
              <Button size="lg" className="text-base px-10 py-4 shadow-lg">
                Mulai Gratis
              </Button>
            </a>
            <a href="#cara-kerja">
              <Button variant="outline" size="lg" className="text-base px-10 py-4">
                Lihat Cara Kerja
              </Button>
            </a>
          </div>

          {/* Hero preview cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-16 max-w-4xl mx-auto text-left">
            <Card padding="sm" className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-lg font-bold text-ink">85%</div>
              <div className="text-xs text-ink/60">Skor Kecocokan</div>
            </Card>
            <Card padding="sm" className="text-center">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-lg font-bold text-ink">7 Hari</div>
              <div className="text-xs text-ink/60">Rencana Eksperimen</div>
            </Card>
            <Card padding="sm" className="text-center">
              <div className="text-2xl mb-2">🗺️</div>
              <div className="text-lg font-bold text-ink">27</div>
              <div className="text-xs text-ink/60">Data Karir Indonesia</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-ink text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Gratis
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Tanpa biaya tersembunyi
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Berbasis data karier Indonesia
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Rencana aksi 7 hari
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Untuk pelajar, mahasiswa, fresh graduate & career switcher
            </span>
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Badge variant="coral" className="mb-4">Yang Sering Dirasakan</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">Pernah merasa seperti ini?</h2>
          <p className="text-ink/60 mb-12 max-w-xl mx-auto">
            Kamu tidak sendiri. Ribuan orang Indonesia mengalami kebingungan yang sama setiap tahun.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {[
              { emoji: "😕", title: "Bingung", desc: "Memilih jurusan atau karir yang tepat" },
              { emoji: "😰", title: "Takut", desc: "Salah arah dan buang waktu bertahun-tahun" },
              { emoji: "🫨", title: "Overwhelmed", desc: "Terlalu banyak pilihan, tidak tahu mulai dari mana" },
              { emoji: "🤷", title: "Buntu", desc: "Tidak tahu langkah konkret yang harus diambil" },
            ].map((item, i) => (
              <Card key={i} padding="md" className="text-center">
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
              Bukan sekadar tes biasa. Dapatkan arah yang jelas dengan pendekatan terstruktur.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Card key={i} padding="md" className="!bg-white/10 !border-white/20 text-white hover:!bg-white/15 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{f.icon}</div>
                  <Badge variant={f.badge === "Butuh login" ? "amber" : "ink"}>{f.badge}</Badge>
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
            <p className="text-ink/60">Hanya 4 langkah sederhana</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-ink rounded-2xl flex items-center justify-center mx-auto mb-5 text-white font-bold text-xl shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-bold text-ink text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-ink/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product preview */}
      {sample && (
        <section className="bg-warm border-y-2 border-ink py-20">
          <div className="max-w-2xl mx-auto px-6">
            <div className="text-center mb-10">
              <Badge variant="coral" className="mb-4">Contoh Hasil</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-ink mb-3">Lihat Seperti Apa Hasilnya</h2>
            </div>
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-ink">Direction Snapshot</h3>
                <Badge variant="ink">Contoh</Badge>
              </div>
              <p className="text-ink/70 mb-6 leading-relaxed">{sample.summary}</p>

              <div className="flex items-center justify-between mb-2">
                <Badge variant="emerald">{sample.top_recommendation.label}</Badge>
                <span className="text-2xl font-bold text-emerald-600">{sample.top_recommendation.score}%</span>
              </div>
              <h4 className="font-bold text-ink text-lg mb-1">{sample.top_recommendation.career_title}</h4>
              <p className="text-sm text-ink/60 mb-4">{sample.top_recommendation.reason}</p>

              <div className="flex items-center justify-between mb-2">
                <Badge variant="amber">{sample.exploration.label}</Badge>
                <span className="text-2xl font-bold text-amber-600">{sample.exploration.score}%</span>
              </div>
              <h4 className="font-bold text-ink text-lg mb-1">{sample.exploration.career_title}</h4>
              <p className="text-sm text-ink/60 mb-6">{sample.exploration.reason}</p>

              <a href="/login">
                <Button className="w-full" size="lg">Mulai Sekarang — Gratis</Button>
              </a>
            </Card>
          </div>
        </section>
      )}

      {/* Locked feature preview */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <Badge variant="amber" className="mb-4">Butuh Login</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-3">Fitur Lengkap Setelah Masuk</h2>
            <p className="text-ink/60">Semua gratis, semua bisa diakses</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "📊", title: "Full Report", desc: "Laporan lengkap hasil discovery dengan analisis mendalam" },
              { icon: "📁", title: "Riwayat Hasil", desc: "Akses semua hasil discovery sebelumnya" },
              { icon: "🧪", title: "Eksperimen", desc: "Lacak progress rencana 7 hari" },
              { icon: "📥", title: "Export Data", desc: "Download hasil untuk referensi offline" },
            ].map((item, i) => (
              <Card key={i} className="text-center border-2 border-ink/20 border-dashed" padding="md">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="w-10 h-10 bg-ink/10 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-ink/20">
                  <svg className="w-5 h-5 text-ink/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-bold text-ink mb-1">{item.title}</h3>
                <p className="text-sm text-ink/60 mb-4">{item.desc}</p>
                <a href="/login" className="text-ink/60 text-sm font-semibold hover:text-ink underline">
                  Masuk untuk membuka
                </a>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Motivation section */}
      <section className="bg-ink text-white py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="text-4xl mb-6">💡</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Tidak perlu langsung tahu semuanya.
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-lg mx-auto">
            Mulai dari langkah kecil. Setiap eksperimen, setiap discovery, membantumu mendekati arah yang lebih jelas.
          </p>
          <a href="/login">
            <Button variant="secondary" size="lg" className="text-base px-10 py-4">
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
              <Card key={i} padding="sm" className="!p-0 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Siap menemukan langkah pertama yang lebih jelas?
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-lg mx-auto">
            Gratis, 10 menit, tanpa risiko.
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
          <div className="font-bold text-ink text-lg mb-2">Life Compass</div>
          <p className="text-ink/50 text-sm mb-4">
            Alat bantu keputusan karir. Bukan konseling profesional.
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
            <a href="/faq" className="text-ink/60 hover:text-ink font-medium">FAQ</a>
            <a href="/privacy" className="text-ink/60 hover:text-ink font-medium">Kebijakan Privasi</a>
            <a href="/terms" className="text-ink/60 hover:text-ink font-medium">Syarat Ketentuan</a>
            <a href="/disclaimer" className="text-ink/60 hover:text-ink font-medium">Disclaimer</a>
            <a href="/login" className="text-ink/60 hover:text-ink font-medium">Login</a>
          </div>
          <p className="text-ink/40 text-xs mt-6">
            Life Compass bukan pengganti konseling profesional. Gunakan hasilnya sebagai bahan refleksi dan rencana awal.
          </p>
        </div>
      </footer>
    </>
  );
}
