import { useEffect, useState } from "react";
import LockModal from "../components/LockModal";

export default function History({ user, api }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLock, setShowLock] = useState(false);

  useEffect(() => {
    if (!user) { setShowLock(true); setLoading(false); return; }
    fetch(`${api}/api/discovery/history`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(r => r.json())
      .then(data => { setHistory(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  if (!user) return <LockModal show={showLock} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <a href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Life Compass</a>
        <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 font-medium inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Dashboard
        </a>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Hasil Discovery</h1>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center bg-white rounded-2xl shadow-sm border p-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </div>
            <p className="text-gray-500 mb-2">Belum ada hasil discovery</p>
            <a href="/dashboard" className="text-blue-600 hover:underline font-medium text-sm">Mulai sekarang →</a>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(h => (
              <a key={h.match_id} href={`/result?id=${h.match_id}`} className="flex items-center justify-between bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition">
                <div>
                  <p className="font-semibold text-gray-900">{h.top_result}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{h.created_at?.substring(0, 10)}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
