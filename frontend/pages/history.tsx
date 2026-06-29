import { useEffect, useState } from "react";
import Head from "next/head";
import LockModal from "../components/LockModal";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import LoadingState from "../components/ui/LoadingState";
import EmptyState from "../components/ui/EmptyState";
import PageShell from "../components/ui/PageShell";

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
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <LockModal show={showLock} />;

  return (
    <PageShell title="Riwayat" showBack backHref="/dashboard">
      <Head><title>Riwayat — Life Compass</title></Head>
      <h2 className="text-2xl font-bold text-ink mb-6">Riwayat Discovery</h2>
      {loading ? (
        <LoadingState skeleton="card" count={3} />
      ) : history.length === 0 ? (
        <EmptyState icon="📭" title="Belum ada hasil discovery" description="Mulai discovery untuk melihat riwayat hasil karirmu di sini." action={{ label: "Mulai Discovery", href: "/dashboard" }} />
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <Card key={item.match_id} padding="md" hover>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-ink">{item.top_result || "Hasil Discovery"}</h3>
                  <p className="text-xs text-ink/50 mt-1">{item.created_at}</p>
                </div>
                <a href={`/result?id=${item.match_id}`}>
                  <Button size="sm" variant="outline">Lihat</Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
