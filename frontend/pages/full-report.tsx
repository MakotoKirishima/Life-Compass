import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LockModal from "../components/LockModal";

export default function FullReport({ user, api }) {
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
      .then(res => { setResult(res); setLoading(false); })
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
        <p className="text-gray-500">Laporan tidak ditemukan.</p>
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
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Full Report</h2>
          <p className="text-gray-500 mb-6">Laporan lengkap hasil discovery karirmu</p>
          <p className="text-gray-600 mb-8 leading-relaxed">{result.summary}</p>

          <div className="space-y-4">
            <h3 className="font-bold text-xl text-gray-900 mb-4">3 Rekomendasi Karir Teratas</h3>
            {(result.results || []).slice(0, 3).map((c, i) => (
              <div key={i} className="border rounded-xl p-5 hover:shadow-sm transition">
                <span className={`inline-block text-xs px-3 py-1 rounded-full mb-2 text-white font-medium ${i === 0 ? "bg-emerald-500" : i === 1 ? "bg-amber-500" : "bg-blue-500"}`}>
                  {c.label}
                </span>
                <h4 className="font-semibold text-lg text-gray-900">{c.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{c.reason}</p>
              </div>
            ))}
          </div>

          {result.experiment_plan && result.experiment_plan.length > 0 && (
            <div className="mt-8 bg-gray-50 rounded-xl p-5">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">Rencana Eksperimen 7 Hari</h3>
              <div className="space-y-2">
                {result.experiment_plan.map((task, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-medium">{i + 1}</span>
                    <span className="text-gray-700">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
