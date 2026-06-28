import { useEffect, useState } from "react";

export default function History({ user, api }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { window.location.href = "/login"; return; }
    fetch(`${api}/api/discovery/history`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(r => r.json())
      .then(data => { setHistory(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <a href="/dashboard" className="text-xl font-bold text-blue-700">Life Compass</a>
        <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</a>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Riwayat Hasil Discovery</h1>
        {loading ? (
          <div className="text-center py-8"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : history.length === 0 ? (
          <p className="text-gray-500">Belum ada hasil discovery. <a href="/dashboard" className="text-blue-600 hover:underline">Mulai sekarang</a></p>
        ) : (
          <div className="space-y-3">
            {history.map(h => (
              <a key={h.match_id} href={`/result?id=${h.match_id}`} className="block bg-white rounded-xl border p-4 hover:shadow-md transition">
                <p className="font-medium">{h.top_result}</p>
                <p className="text-sm text-gray-400">{h.created_at?.substring(0, 10)}</p>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
