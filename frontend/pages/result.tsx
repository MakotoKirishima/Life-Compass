import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LockModal from "../components/LockModal";

export default function ResultDetail({ user, api }) {
  const router = useRouter();
  const { id } = router.query;
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLock, setShowLock] = useState(false);

  useEffect(() => {
    if (!user) { setShowLock(true); setLoading(false); return; }
    if (!id) return;
    fetch(`${api}/api/discovery/result/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(r => r.json())
      .then(data => { setResult(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, id]);

  if (!user) return <LockModal show={showLock} />;
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!result) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center bg-white rounded-2xl shadow-sm border p-8 max-w-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <p className="text-gray-500">Hasil tidak ditemukan.</p>
        <a href="/dashboard" className="text-blue-600 hover:underline text-sm mt-3 inline-block font-medium">← Kembali ke Dashboard</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <a href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Life Compass</a>
        <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 font-medium inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Dashboard
        </a>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hasil Direction Snapshot</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{result.summary}</p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-4">
            <span className="inline-block bg-emerald-500 text-white text-xs px-3 py-1 rounded-full mb-2 font-medium">{result.top_recommendation.label}</span>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{result.top_recommendation.career_title}</h3>
            <p className="text-gray-600">{result.top_recommendation.reason}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4">
            <span className="inline-block bg-amber-500 text-white text-xs px-3 py-1 rounded-full mb-2 font-medium">{result.exploration.label}</span>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{result.exploration.career_title}</h3>
            <p className="text-gray-600">{result.exploration.reason}</p>
          </div>
          <div className="flex gap-3 mt-6">
            <a href={`/full-report?id=${id}`} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm">Lihat Laporan Lengkap</a>
            <a href="/dashboard" className="border-2 border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Dashboard</a>
          </div>
        </div>
      </main>
    </div>
  );
}
