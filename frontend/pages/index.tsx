import { useEffect, useState } from "react";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-4">Life Compass</h1>
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="max-w-5xl mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">Life Compass</h1>
        <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Masuk
        </a>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {content?.hero_title || "Temukan Arah Karirmu"}
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {content?.hero_subtitle || "Bingung mau jadi apa? Dapatkan Direction Map gratis dalam 10 menit. Berbasis data karir Indonesia."}
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-semibold mb-2">Discovery Terstruktur</h3>
            <p className="text-gray-600 text-sm">7 bagian pertanyaan yang dirancang khusus untuk memahami minat, skill, dan situasimu.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-3xl mb-3">🇮🇩</div>
            <h3 className="font-semibold mb-2">Data Karir Indonesia</h3>
            <p className="text-gray-600 text-sm">80+ jalur karir dengan data gaji, prospek, dan jalur masuk yang relevan untuk Indonesia.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-semibold mb-2">Langsung Action</h3>
            <p className="text-gray-600 text-sm">Dapat rencana eksperimen 7 hari konkret, bukan cuma saran teks biasa.</p>
          </div>
        </div>

        {sample && !showSample && (
          <div className="mb-8">
            <button onClick={() => setShowSample(true)} className="text-blue-600 underline hover:text-blue-800">
              Lihat contoh hasil →
            </button>
          </div>
        )}

        {showSample && sample && (
          <div className="bg-white rounded-xl shadow-lg border p-6 mb-8 text-left max-w-2xl mx-auto">
            <h3 className="font-bold text-lg mb-4">Contoh Hasil Direction Snapshot</h3>
            <p className="text-gray-700 mb-4">{sample.summary}</p>
            <div className="bg-blue-50 p-4 rounded-lg mb-3">
              <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full mb-2">{sample.top_recommendation.label}</span>
              <h4 className="font-semibold">{sample.top_recommendation.career_title}</h4>
              <p className="text-sm text-gray-600">{sample.top_recommendation.reason}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mb-3">
              <span className="inline-block bg-yellow-500 text-white text-xs px-2 py-1 rounded-full mb-2">{sample.exploration.label}</span>
              <h4 className="font-semibold">{sample.exploration.career_title}</h4>
              <p className="text-sm text-gray-600">{sample.exploration.reason}</p>
            </div>
            <a href="/login" className="block text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium mt-4">
              Mulai Sekarang — Gratis
            </a>
          </div>
        )}

        {!showSample && (
          <a href="/login" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition font-medium shadow-lg">
            Mulai Sekarang — Gratis
          </a>
        )}
      </main>

      <footer className="text-center py-8 text-gray-400 text-sm">
        <p>Life Compass — Alat bantu keputusan karir. Bukan konseling profesional.</p>
        <div className="mt-2 space-x-4">
          <a href="/faq" className="hover:text-gray-600">FAQ</a>
          <span>·</span>
          <span>Kebijakan Privasi</span>
          <span>·</span>
          <span>Syarat Ketentuan</span>
        </div>
      </footer>

      {user && (
        <div className="fixed bottom-4 right-4">
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">Logout</button>
        </div>
      )}
    </div>
  );
}
