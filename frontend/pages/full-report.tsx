import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function FullReport({ user, api }) {
  const router = useRouter();
  const { id } = router.query;
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { window.location.href = "/login"; return; }
    if (!id) return;
    fetch(`${api}/api/discovery/result/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(r => r.json())
      .then(res => { setResult(res); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, id]);

  if (!user) return null;
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!result) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Laporan tidak ditemukan.</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <a href="/dashboard" className="text-xl font-bold text-blue-700">Life Compass</a>
        <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</a>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-2">Full Report</h2>
          <p className="text-gray-500 mb-6">Laporan lengkap hasil discovery karirmu</p>
          <p className="text-gray-700 mb-6">{result.summary}</p>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">3 Rekomendasi Karir Teratas</h3>
            {(result.results || []).slice(0, 3).map((c, i) => (
              <div key={i} className="border rounded-xl p-4">
                <span className={`inline-block text-xs px-2 py-1 rounded-full mb-2 text-white ${i === 0 ? "bg-green-500" : i === 1 ? "bg-yellow-500" : "bg-blue-500"}`}>
                  {c.label}
                </span>
                <h4 className="font-semibold text-lg">{c.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{c.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
