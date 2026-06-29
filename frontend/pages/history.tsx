import { useEffect, useState } from "react";
import LockModal from "../components/LockModal";
import PageShell from "../components/ui/PageShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingState from "../components/ui/LoadingState";
import EmptyState from "../components/ui/EmptyState";

export default function History({ user, api }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLock, setShowLock] = useState(false);

  useEffect(() => {
    if (!user) { setShowLock(true); setLoading(false); return; }
    fetch(`${api}/api/discovery/history`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((data) => { setHistory(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  if (!user) return <LockModal show={showLock} />;

  return (
    <PageShell title="Riwayat">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Hasil Discovery</h1>

      {loading ? (
        <LoadingState skeleton="list" count={4} />
      ) : history.length === 0 ? (
        <Card>
          <EmptyState
            icon="📭"
            title="Belum ada hasil discovery"
            description="Mulai discovery untuk melihat riwayat hasil karirmu."
            actionLabel="Mulai Discovery"
            actionHref="/dashboard"
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((h) => (
            <a
              key={h.match_id}
              href={`/result?id=${h.match_id}`}
              className="flex items-center justify-between bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition group"
            >
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{h.top_result}</p>
                <p className="text-sm text-gray-400 mt-0.5">{h.created_at?.substring(0, 10)}</p>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </PageShell>
  );
}
