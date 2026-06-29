import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import LockModal from "../components/LockModal";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import LoadingState from "../components/ui/LoadingState";
import PageShell from "../components/ui/PageShell";

const SCORE_COLORS = {
  "Cocok Tinggi": { bar: "bg-emerald-500" },
  "Cocok Sedang": { bar: "bg-blue-500" },
  "Coba Dulu": { bar: "bg-amber-500" },
  "Kurang Cocok": { bar: "bg-red-400" },
};

function ScoreBar({ score, label }: { score: number; label: string }) {
  const colors = SCORE_COLORS[label] || { bar: "bg-gray-400" };
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 bg-ink/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${colors.bar}`} style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
      <span className="text-xs font-bold text-ink/60 w-12 text-right">{score}%</span>
    </div>
  );
}

export default function FullReport({ user, api }) {
  const router = useRouter();
  const { id } = router.query;
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLock, setShowLock] = useState(false);

  useEffect(() => {
    if (!user) { setShowLock(true); setLoading(false); return; }
    if (!id) return;
    setLoading(true);
    fetch(`${api}/api/discovery/result/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((res) => { setResult(res); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, id]);

  if (!user) return <LockModal show={showLock} />;

  return (
    <PageShell title="Full Report" showBack backHref={`/result?id=${id}`}>
      <Head><title>Full Report — Life Compass</title></Head>
      {loading ? (
        <LoadingState skeleton="card" count={2} />
      ) : !result ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-bold text-ink mb-2">Laporan tidak ditemukan</h3>
          <p className="text-ink/60 mb-6">Mungkin tautan ini sudah tidak valid.</p>
          <a href="/dashboard"><Button>Kembali ke Dashboard</Button></a>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card padding="lg">
            <h2 className="text-2xl font-bold text-ink mb-2">Laporan Lengkap</h2>
            <p className="text-ink/50 mb-6">Analisis mendalam hasil discovery karirmu</p>
            <p className="text-ink/70 leading-relaxed">{result.summary}</p>
          </Card>

          <Card padding="lg">
            <h3 className="font-bold text-xl text-ink mb-4">Semua Skor Kecocokan</h3>
            <div className="space-y-4">
              {(result.results || []).map((c, i) => {
                const colors = SCORE_COLORS[c.label] || { text: "text-gray-800" };
                return (
                  <div key={i} className="border-b-2 border-ink/10 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant={i === 0 ? "emerald" : i === 1 ? "amber" : i === 2 ? "blue" : "gray"}>#{i + 1}</Badge>
                        <h4 className="font-semibold text-ink">{c.title}</h4>
                      </div>
                      <span className={`text-xs font-bold ${c.label === "Cocok Tinggi" ? "text-emerald-700" : c.label === "Cocok Sedang" ? "text-blue-700" : c.label === "Coba Dulu" ? "text-amber-700" : "text-red-700"}`}>{c.label}</span>
                    </div>
                    <ScoreBar score={c.score} label={c.label} />
                    {c.reason && <p className="text-xs text-ink/50 mt-1.5">{c.reason}</p>}
                  </div>
                );
              })}
            </div>
          </Card>

          {(result.experiment_plan || []).length > 0 && (
            <Card padding="lg">
              <h3 className="font-bold text-lg text-ink mb-3">Rencana Eksperimen 7 Hari</h3>
              <p className="text-sm text-ink/60 mb-4">Langkah konkret untuk menguji karir pilihanmu:</p>
              <div className="space-y-2">
                {result.experiment_plan.map((task, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm bg-warm rounded-xl p-3 border border-ink/10">
                    <span className="bg-ink text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</span>
                    <span className="text-ink pt-0.5">{task}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="flex flex-wrap gap-3">
            <a href={`/result?id=${id}`}><Button variant="outline">Kembali ke Hasil</Button></a>
            <a href="/dashboard"><Button variant="outline">Dashboard</Button></a>
          </div>
        </div>
      )}
    </PageShell>
  );
}
