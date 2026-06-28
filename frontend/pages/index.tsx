import { useEffect, useState } from "react";

const FEATURES = [
  { icon: "📋", title: "Discovery Terstruktur", desc: "7 bagian pertanyaan untuk memahami minat, skill, dan situasimu secara mendalam." },
  { icon: "🗺️", title: "Direction Map", desc: "Dapatkan peta arah karir yang jelas dengan rekomendasi personal." },
  { icon: "🎯", title: "Career Match", desc: "AI mencocokkan jawabanmu dengan 80+ jalur karir Indonesia." },
  { icon: "🚀", title: "Eksperimen 7 Hari", desc: "Rencana aksi konkret, bukan cuma saran teks biasa." },
  { icon: "📈", title: "Riwayat dan Progress", desc: "Pantau perjalanan karirmu dan lihat perkembangan dari waktu ke waktu." },
];

const TRUST = [
  { icon: "✅", text: "Gratis, tanpa biaya tersembunyi" },
  { icon: "✅", text: "Berbasis data karir Indonesia" },
  { icon: "✅", text: "Rencana aksi 7 hari" },
  { icon: "✅", text: "100% online, bisa dari HP" },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Jawab Discovery", desc: "Isi 7 bagian pertanyaan tentang minat, skill, dan situasimu. Hanya 8-12 menit." },
  { step: "2", title: "Dapatkan Hasil", desc: "AI mencocokkan jawabanmu dengan database 80+ karir Indonesia." },
  { step: "3", title: "Eksplorasi Laporan", desc: "Lihat rekomendasi karir utama, alternatif, dan rencana eksperimen." },
  { step: "4", title: "Action 7 Hari", desc: "Ikuti rencana eksperimen untuk menguji karir pilihanmu." },
];

export default function Landing({ user, logout, api }) {
  const [content, setContent] = useState(null);
  const [showSample, setShowSample] = useState(false);
  const [sample, setSample] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetch(`${api}/api/admin/landing-page`)
      .then((r) => r.json())
      .then(setContent)
      .catch(() => {});
    fetch(`${api}/api/sample-report`)
      .then((r) => r.json())
      .then(setSample)
      .catch(() => {});
  }, []);

  useEffect(() => { setMounted(true); }, []);

  if (user && mounted) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
    return null;
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-4">Life Compass</h1>
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Life Compass</h1>
        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={logout} className="text-red-500 text-sm">Logout</button>
          ) : (
            <a href="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition shadow-sm">
              Masuk
            </a>
          )}
        </div>
      </header>

      <main>
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Temukan Arah Kariermu<br />dengan Lebih Jelas
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Bingung mau jadi apa? Dapatkan Direction Map gratis hanya dalam 10 menit. Berbasis data karir Indonesia, bukan tebakan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/login" className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-blue-700 transition shadow-lg">
              Mulai Gratis
            </a>
            <a href="#how-it-works" className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-50 transition">
              Lihat Cara Kerja
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
            {TRUST.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-16">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">Fitur Life Compass</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-2">{f.title}</h4>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {sample && !showSample && (
          <section className="text-center pb-8">
            <button onClick={() => setShowSample(true)} className="text-blue-600 underline hover:text-blue-800 font-medium">
              Lihat contoh hasil →
            </button>
          </section>
        )}

        {showSample && sample && (
          <section className="max-w-2xl mx-auto px-6 pb-16">
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <h3 className="font-bold text-lg mb-4">Contoh Hasil Direction Snapshot</h3>
              <p className="text-gray-700 mb-4">{sample.summary}</p>
              <div className="bg-blue-50 rounded-xl p-4 mb-3">
                <span className="inline-block bg-emerald-500 text-white text-xs px-3 py-1 rounded-full mb-2 font-medium">{sample.top_recommendation.label}</span>
                <h4 className="font-semibold">{sample.top_recommendation.career_title}</h4>
                <p className="text-sm text-gray-600">{sample.top_recommendation.reason}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 mb-3">
                <span className="inline-block bg-amber-500 text-white text-xs px-3 py-1 rounded-full mb-2 font-medium">{sample.exploration.label}</span>
                <h4 className="font-semibold">{sample.exploration.career_title}</h4>
                <p className="text-sm text-gray-600">{sample.exploration.reason}</p>
              </div>
              <a href="/login" className="block text-center bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium mt-4">
                Mulai Sekarang
              </a>
            </div>
          </section>
        )}

        <section id="how-it-works" className="max-w-4xl mx-auto px-6 py-16">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">Cara Kerja</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">{item.step}</div>
                <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="text-center py-12 text-gray-400 text-sm border-t bg-white">
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
  );
}
