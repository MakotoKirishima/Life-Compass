import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ResultDetail({ user, api }) {
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
      .then(data => { setResult(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, id]);

  if (!user) return null;
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!result) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Hasil tidak ditemukan.</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <a href="/dashboard" className="text-xl font-bold text-blue-700">Life Compass</a>
        <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</a>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <h2 className="text-2xl font-bold mb-4">Hasil Direction Snapshot</h2>
          <p className="text-gray-700 mb-6">{result.summary}</p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-4">
            <span className="inline-block bg-green-500 text-white text-xs px-3 py-1 rounded-full mb-2 font-medium">{result.top_recommendation.label}</span>
            <h3 className="text-xl font-bold mb-1">{result.top_recommendation.career_title}</h3>
            <p className="text-gray-600">{result.top_recommendation.reason}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-4">
            <span className="inline-block bg-yellow-500 text-white text-xs px-3 py-1 rounded-full mb-2 font-medium">{result.exploration.label}</span>
            <h3 className="text-xl font-bold mb-1">{result.exploration.career_title}</h3>
            <p className="text-gray-600">{result.exploration.reason}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
