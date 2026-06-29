import { useEffect, useState } from "react";
import Head from "next/head";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const FEATURES = [
  { icon: "📋", title: "Discovery Terstruktur", desc: "7 bagian pertanyaan untuk memahami minat, skill, dan situasimu secara mendalam." },
  { icon: "🎯", title: "Career Match", desc: "AI mencocokkan jawabanmu dengan 80+ jalur karir Indonesia." },
  { icon: "🗺️", title: "Direction Map", desc: "Dapatkan peta arah karir yang jelas dengan rekomendasi personal." },
  { icon: "🚀", title: "Eksperimen 7 Hari", desc: "Rencana aksi konkret untuk menguji karir pilihanmu." },
  { icon: "📈", title: "Riwayat Progress", desc: "Pantau perjalanan karirmu dan lihat perkembangan dari waktu ke waktu." },
  { icon: "💬", title: "Asisten Karir", desc: "Tanya soal karir, skill, atau jurusan kapan saja." },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Jawab Discovery", desc: "Isi 7 bagian pertanyaan tentang minat, skill, dan situasimu. Hanya 8-12 menit." },
  { step: "2", title: "Dapatkan Hasil", desc: "AI mencocokkan jawabanmu dengan database 80+ karir Indonesia." },
  { step: "3", title: "Eksplorasi Laporan", desc: "Lihat rekomendasi karir utama, alternatif, dan rencana eksperimen." },
  { step: "4", title: "Action 7 Hari", desc: "Ikuti rencana eksperimen untuk menguji karir pilihanmu." },
];

const TRUST_ITEMS = [
  "Gratis, tanpa biaya tersembunyi",
  "Berbasis data karir Indonesia",
  "Rencana aksi 7 hari",
  "Cocok untuk pelajar, mahasiswa, fresh graduate, dan career switcher",
  "100% online, bisa dari HP",
];

const FAQS = [
  { q: "Apa itu Life Compass?", a: "Alat bantu keputusan karir yang membantumu menemukan arah karir melalui discovery terstruktur, rekomendasi personal, dan rencana eksperimen 7 hari." },
  { q: "Apakah gratis?", a: "Ya! Life Compass 100% gratis. Semua fitur bisa diakses tanpa biaya." },
  { q: "Berapa lama prosesnya?", a: "Discovery Journey hanya butuh 8-12 menit. Setelah itu kamu langsung dapat hasilnya." },
  { q: "Data saya aman?", a: "Data kamu dienkripsi, tidak dijual ke pihak ketiga, dan AI tidak dilatih dari data kamu. Kamu bisa hapus akun kapan saja." },
  { q: "Apa bedanya dengan ChatGPT?", a: "Life Compass menggunakan discovery terstruktur 7 bagian + database 80+ karir Indonesia. Hasilnya lebih akurat dan relevan untuk pasar Indonesia." },
];

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
        <title>Life Compass — Temukan Arah Kariermu dengan Lebih Jelas</title>
        <meta name="description" content="Bingung mau jadi apa? Dapatkan Direction Map gratis hanya dalam 10 menit. Berbasis data karir Indonesia, bukan tebakan." />
        <meta property="og:title" content="Life Compass — Temukan Arah Kariermu" />
        <meta property="og:description" content="Bingung mau jadi apa? Dapatkan Direction Map gratis hanya dalam 10 menit." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            Life Compass
          </h1>
          <div className="flex items-center gap-3">
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-700 hidden sm:block">
              Cara Kerja
            </a>
            <a href="#faq" className="text-sm text-gray-500 hover:text-gray-700 hidden sm:block">
              FAQ
            </a>
            <a
              href="/login"
              className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm"
            >
              Mulai Gratis
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-sm text-blue-700 mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            100% Gratis — Untuk Pelajar & Pencari Karir
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            Temukan Arah Kariermu<br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              dengan Lebih Jelas
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Bingung mau jadi apa? Life Compass membantumu memahami minat, skill, situasi, dan langkah kecil
            yang bisa kamu mulai <strong className="text-gray-900">minggu ini</strong>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/login">
              <Button size="lg" className="text-base px-10 py-4 shadow-lg shadow-blue-200">
                Mulai Gratis
              </Button>
            </a>
            <a href="#how-it-works">
              <Button variant="secondary" size="lg" className="text-base px-10 py-4">
                Lihat Cara Kerja
              </Button>
            </a>
          </div>

          {/* Trust strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-16 max-w-4xl mx-auto">
            {TRUST_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Pernah merasa seperti ini?
          </h3>
          <p className="text-gray-600 mb-10 max-w-xl mx-auto">
            Kamu tidak sendiri. Ribuan orang Indonesia mengalami kebingungan yang sama setiap tahun.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {[
              { emoji: "😕", title: "Bingung", desc: "Memilih jurusan atau karir yang tepat" },
              { emoji: "😰", title: "Takut", desc: "Salah arah dan buang waktu bertahun-tahun" },
              { emoji: "🫨", title: "Overwhelmed", desc: "Terlalu banyak pilihan, tidak tahu mulai dari mana" },
              { emoji: "🤷", title: "Buntu", desc: "Tidak tahu langkah konkret yang harus diambil" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border text-center">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution / Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Life Compass Membantumu
            </h3>
            <p className="text-gray-600 max-w-lg mx-auto">
              Bukan sekadar tes biasa. Dapatkan arah yang jelas dengan pendekatan terstruktur.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Card key={i} hover>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-2">{f.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Cara Kerjanya
            </h3>
            <p className="text-gray-600">Hanya 4 langkah sederhana</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white font-bold text-lg shadow-lg shadow-blue-200">
                  {item.step}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute">
                    <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample result preview */}
      {sample && !showSample && (
        <section className="text-center py-12">
          <button
            onClick={() => setShowSample(true)}
            className="text-blue-600 hover:text-blue-800 font-medium underline underline-offset-4"
          >
            Lihat contoh hasil →
          </button>
        </section>
      )}

      {showSample && sample && (
        <section className="max-w-2xl mx-auto px-6 pb-20">
          <Card padding="lg" className="shadow-lg border-0 ring-1 ring-gray-100">
            <h3 className="font-bold text-lg mb-4">Contoh Hasil Direction Snapshot</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">{sample.summary}</p>
            <div className="bg-emerald-50 rounded-xl p-4 mb-3 border border-emerald-100">
              <span className="inline-block bg-emerald-500 text-white text-xs px-3 py-1 rounded-full mb-2 font-medium">
                {sample.top_recommendation.label}
              </span>
              <h4 className="font-semibold text-gray-900">{sample.top_recommendation.career_title}</h4>
              <p className="text-sm text-gray-600 mt-1">{sample.top_recommendation.reason}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 mb-3 border border-amber-100">
              <span className="inline-block bg-amber-500 text-white text-xs px-3 py-1 rounded-full mb-2 font-medium">
                {sample.exploration.label}
              </span>
              <h4 className="font-semibold text-gray-900">{sample.exploration.career_title}</h4>
              <p className="text-sm text-gray-600 mt-1">{sample.exploration.reason}</p>
            </div>
            <a href="/login" className="block text-center bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium mt-4">
              Mulai Sekarang
            </a>
          </Card>
        </section>
      )}

      {/* Locked feature preview */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Fitur Lengkap Setelah Masuk
            </h3>
            <p className="text-gray-600">Semua gratis, semua bisa diakses</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "📊", title: "Full Report", desc: "Laporan lengkap hasil discovery dengan analisis mendalam" },
              { icon: "📁", title: "Riwayat Hasil", desc: "Akses semua hasil discovery sebelumnya" },
              { icon: "🧪", title: "Eksperimen", desc: "Lacak progress rencana 7 hari" },
              { icon: "📥", title: "Export Data", desc: "Download hasil untuk referensi offline" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-dashed border-gray-300 p-6 text-center hover:shadow-sm transition">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-500 mb-3">{item.desc}</p>
                <a href="/login" className="text-blue-600 text-sm font-medium hover:underline">
                  Masuk untuk membuka
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Pertanyaan Umum
            </h3>
            <p className="text-gray-600">Cari jawaban seputar Life Compass</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 font-medium text-gray-900 flex justify-between items-center hover:bg-gray-50 transition gap-4"
                >
                  <span>{f.q}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed text-sm">{f.a}</div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a href="/faq" className="text-blue-600 hover:underline font-medium text-sm">
              Lihat semua FAQ →
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Siap Menemukan Arah Kariermu?
          </h3>
          <p className="text-blue-100 text-lg mb-8 max-w-lg mx-auto">
            Ribuan pengguna sudah memulai. Gratis, 10 menit, tanpa risiko.
          </p>
          <a
            href="/login"
            className="inline-block bg-white text-blue-700 px-10 py-4 rounded-xl text-lg font-medium hover:bg-blue-50 transition shadow-xl"
          >
            Mulai Gratis Sekarang
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-12 text-gray-400 text-sm border-t">
        <p className="font-medium text-gray-500 mb-2">Life Compass — Alat bantu keputusan karir. Bukan konseling profesional.</p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a href="/faq" className="hover:text-gray-600 transition">FAQ</a>
          <span className="text-gray-300">|</span>
          <a href="/privacy" className="hover:text-gray-600 transition">Kebijakan Privasi</a>
          <span className="text-gray-300">|</span>
          <a href="/terms" className="hover:text-gray-600 transition">Syarat Ketentuan</a>
          <span className="text-gray-300">|</span>
          <a href="/disclaimer" className="hover:text-gray-600 transition">Disclaimer</a>
        </div>
      </footer>
      </div>
    </>
  );
}
