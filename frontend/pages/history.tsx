import { useEffect, useState } from "react";
import Head from "next/head";
import LockModal from "../components/LockModal";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import LoadingState from "../components/ui/LoadingState";
import EmptyState from "../components/ui/EmptyState";
import PageShell from "../components/ui/PageShell";

const LABEL_COLORS = {
  "Cocok Tinggi": "text-emerald-700 bg-emerald-50",
  "Cocok Sedang": "text-blue-700 bg-blue-50",
  "Coba Dulu": "text-amber-700 bg-amber-50",
  "Kurang Cocok": "text-red-700 bg-red-50",
  "Strong Match — Start Now": "text-emerald-700 bg-emerald-50",
  "Strong Match — Short Gap": "text-blue-700 bg-blue-50",
  "Good Match — Invest to Get There": "text-amber-700 bg-amber-50",
  "Conditional Match": "text-orange-700 bg-orange-50",
  "Moderate Match": "text-purple-700 bg-purple-50",
  "Aspirational — Map the Path": "text-gray-500 bg-gray-100",
  "Bridge Career": "text-cyan-700 bg-cyan-50",
};

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
      <Head><title>Riwayat — Life Compass v2</title><meta name="robots" content="noindex" /></Head>
      <h2 className="text-2xl font-bold text-ink mb-6">Riwayat Discovery</h2>
      {loading ? (
        <LoadingState skeleton="card" count={3} />
      ) : history.length === 0 ? (
        <EmptyState icon="📭" title="Belum ada hasil discovery" description="Mulai discovery v2 untuk melihat rekomendasi karir 9 dimensi di sini." action={{ label: "Mulai Discovery", href: "/dashboard" }} />
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <Card key={item.match_id} padding="md" hover>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-bold text-ink truncate">{item.top_result || "Hasil Discovery"}</h3>
                  <p className="text-xs text-ink/50 mt-1">{item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</p>
                  <Badge variant="ink" className="mt-1 text-[10px]">{item.assessment_version === "v2" ? "v2 ⚡" : "v1"}</Badge>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {item.score ? <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${LABEL_COLORS[item.label] || "bg-ink/5 text-ink/50"}`}>{item.score}%</span> : null}
                  <a href={`/result?id=${item.match_id}`}>
                    <Button size="sm" variant="outline">Lihat</Button>
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
