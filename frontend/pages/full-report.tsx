import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function FullReport({ user, api }) {
  const router = useRouter();
  const { id } = router.query;
  const [result, setResult] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { window.location.href = "/login"; return; }
    if (!id) return;
    Promise.all([
      fetch(`${api}/api/discovery/result/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }).then(r => r.json()),
      fetch(`${api}/api/payment/status`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }).then(r => r.json()),
    ])
      .then(([res, pay]) => { setResult(res); setPaymentStatus(pay); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, id]);

  if (!user) return null;
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!result) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Laporan tidak ditemukan.</p></div>;

  if (!paymentStatus?.has_access) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Akses Terkunci</h2>
          <p className="text-gray-500 mb-6">Kamu perlu melakukan pembayaran untuk mengakses laporan lengkap.</p>
          <a href="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg">Kembali ke Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <a href="/dashboard" className="text-xl font-bold text-blue-700">Life Compass</a>
        <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</a>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-2">Full Compass Report 🔓</h2>
          <p className="text-gray-500 mb-6">Laporan lengkap hasil discovery karirmu</p>
          <p className="text-gray-700 mb-6">{result.summary}</p>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">3 Rekomendasi Karir Teratas</h3>
            {result.results?.slice(0, 3).map((c, i) => (
              <div key={i} className="border rounded-xl p-4">
                <span className={`inline-block text-xs px-2 py-1 rounded-full mb-2 text-white ${i === 0 ? "bg-green-500" : i === 1 ? "bg-yellow-500" : "bg-blue-500"}`}>
                  {c.label}
                </span>
                <h4 className="font-semibold text-lg">{c.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{c.reason}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="font-bold text-lg">Skill Gap Analysis</h3>
            <div className="bg-gray-50 rounded-xl p-6 border">
              <p className="text-gray-500">Fitur Skill Gap Analysis akan segera hadir. Kami akan menampilkan perbandingan skill yang kamu miliki dengan skill yang dibutuhkan untuk karir rekomendasi.</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="font-bold text-lg">30-Day Roadmap</h3>
            <div className="bg-gray-50 rounded-xl p-6 border">
              <p className="text-gray-500">Fitur 30-Day Roadmap akan segera hadir. Kami akan menyusun rencana belajar langkah demi langkah selama 30 hari untuk membantumu mencapai karir impian.</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="font-bold text-lg">Family Discussion Script</h3>
            <div className="bg-gray-50 rounded-xl p-6 border">
              <p className="text-gray-500">Fitur Family Discussion Script akan segera hadir. Kami akan menyediakan panduan dan skrip diskusi untuk membantu kamu berkomunikasi dengan orang tua atau keluarga tentang pilihan karirmu.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
