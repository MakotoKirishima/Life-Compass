import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import LockModal from "../components/LockModal";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import LoadingState from "../components/ui/LoadingState";
import PageShell from "../components/ui/PageShell";
import ScoreBar from "../components/ui/ScoreBar";

export default function ResultDetail({ user, api }) {
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
      .then((data) => { setResult(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, id]);

  if (!user) return <LockModal show={showLock} />;

  return (
    <PageShell title="Hasil Discovery" showBack backHref="/dashboard">
      <Head><title>Hasil Discovery — Life Compass</title><meta name="robots" content="noindex" /></Head>
      {loading ? (
        <LoadingState skeleton="card" count={2} />
      ) : !result ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-ink mb-2">Hasil tidak ditemukan</h3>
          <p className="text-ink/60 mb-6">Mungkin hasil ini sudah dihapus atau tautan tidak valid.</p>
          <a href="/dashboard"><Button>Kembali ke Dashboard</Button></a>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-ink">Direction Snapshot</h2>
              <Badge variant="ink">Hasil</Badge>
            </div>
            <p className="text-ink/60 mb-6 leading-relaxed">{result.summary}</p>

            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-5 mb-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="emerald">{result.top_recommendation.label}</Badge>
                <span className="text-2xl font-bold text-emerald-700">{result.top_recommendation.score}%</span>
              </div>
              <h3 className="text-xl font-bold text-ink mb-1">{result.top_recommendation.career_title}</h3>
              <p className="text-ink/60 text-sm">{result.top_recommendation.reason}</p>
            </div>

            <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="amber">{result.exploration.label}</Badge>
                <span className="text-2xl font-bold text-amber-700">{result.exploration.score}%</span>
              </div>
              <h3 className="text-xl font-bold text-ink mb-1">{result.exploration.career_title}</h3>
              <p className="text-ink/60 text-sm">{result.exploration.reason}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a href={`/full-report?id=${id}`}><Button>Lihat Laporan Lengkap</Button></a>
              <a href="/dashboard"><Button variant="outline">Dashboard</Button></a>
            </div>
          </Card>

          {(result.results || []).length > 2 && (
            <Card padding="lg">
              <h3 className="font-bold text-lg text-ink mb-4">Semua Skor Kecocokan</h3>
              <div className="space-y-4">
                {result.results.slice(0, 6).map((c, i) => (
                  <div key={i} className="border-b-2 border-ink/10 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <h4 className="font-semibold text-ink text-sm">{c.title}</h4>
                      <span className={`text-xs font-bold ${c.label === "Cocok Tinggi" ? "text-emerald-700" : c.label === "Cocok Sedang" ? "text-blue-700" : c.label === "Coba Dulu" ? "text-amber-700" : "text-red-700"}`}>{c.label}</span>
                    </div>
                    <ScoreBar score={c.score} label={c.label} />
                    {c.reason && <p className="text-xs text-ink/50 mt-1">{c.reason}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(result.experiment_plan || []).length > 0 && (
            <Card padding="lg">
              <h3 className="font-bold text-lg text-ink mb-3">Rencana Eksperimen 7 Hari</h3>
              <p className="text-sm text-ink/60 mb-4">Coba langkah kecil ini untuk menguji karir pilihanmu:</p>
              <div className="space-y-2">
                {result.experiment_plan.map((task, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm bg-warm rounded-xl p-3 border border-ink/10">
                    <span className="bg-ink text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</span>
                    <span className="text-ink pt-0.5">{task}</span>
                  </div>
                ))}
              </div>
              <a href={`/full-report?id=${id}`}>
                <Button variant="outline" className="mt-4 w-full">Lihat Semua Eksperimen</Button>
              </a>
            </Card>
          )}
        </div>
      )}
    </PageShell>
  );
}
