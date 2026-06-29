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
  "Cocok Tinggi": { bg: "bg-emerald-100", bar: "bg-emerald-500", text: "text-emerald-800" },
  "Cocok Sedang": { bg: "bg-blue-100", bar: "bg-blue-500", text: "text-blue-800" },
  "Coba Dulu": { bg: "bg-amber-100", bar: "bg-amber-500", text: "text-amber-800" },
  "Kurang Cocok": { bg: "bg-red-100", bar: "bg-red-400", text: "text-red-800" },
};

function ScoreBar({ score, label }: { score: number; label: string }) {
  const colors = SCORE_COLORS[label] || { bg: "bg-gray-100", bar: "bg-gray-400", text: "text-gray-800" };
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${colors.bar}`} style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
      <span className={`text-xs font-semibold w-16 text-right ${colors.text}`}>{score}%</span>
    </div>
  );
}

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
      <Head>
        <title>Hasil Discovery — Life Compass</title>
      </Head>
      {loading ? (
        <LoadingState skeleton="card" count={2} />
      ) : !result ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Hasil tidak ditemukan</h3>
          <p className="text-gray-500 mb-6">Mungkin hasil ini sudah dihapus atau tautan tidak valid.</p>
          <a href="/dashboard">
            <Button>Kembali ke Dashboard</Button>
          </a>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card padding="lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Direction Snapshot</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">{result.summary}</p>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="emerald">{result.top_recommendation.label}</Badge>
                <span className="text-2xl font-bold text-emerald-700">{result.top_recommendation.score}%</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{result.top_recommendation.career_title}</h3>
              <p className="text-gray-600 text-sm">{result.top_recommendation.reason}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="amber">{result.exploration.label}</Badge>
                <span className="text-2xl font-bold text-amber-700">{result.exploration.score}%</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{result.exploration.career_title}</h3>
              <p className="text-gray-600 text-sm">{result.exploration.reason}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a href={`/full-report?id=${id}`}>
                <Button>Lihat Laporan Lengkap</Button>
              </a>
              <a href="/dashboard">
                <Button variant="secondary">Dashboard</Button>
              </a>
            </div>
          </Card>

          {(result.results || []).length > 2 && (
            <Card padding="lg">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Semua Skor Kecocokan</h3>
              <div className="space-y-4">
                {result.results.slice(0, 6).map((c, i) => {
                  const colors = SCORE_COLORS[c.label] || { text: "text-gray-800" };
                  return (
                    <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center mb-1.5">
                        <h4 className="font-medium text-gray-900 text-sm">{c.title}</h4>
                        <span className={`text-xs font-semibold ${colors.text}`}>{c.label}</span>
                      </div>
                      <ScoreBar score={c.score} label={c.label} />
                      {c.reason && <p className="text-xs text-gray-500 mt-1">{c.reason}</p>}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {(result.experiment_plan || []).length > 0 && (
            <Card padding="lg">
              <h3 className="font-bold text-lg text-gray-900 mb-3">Rencana Eksperimen 7 Hari</h3>
              <p className="text-sm text-gray-500 mb-4">Coba langkah kecil ini untuk menguji karir pilihanmu:</p>
              <div className="space-y-2">
                {result.experiment_plan.slice(0, 5).map((task, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm bg-gray-50 rounded-xl p-3">
                    <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-medium">{i + 1}</span>
                    <span className="text-gray-700 pt-0.5">{task}</span>
                  </div>
                ))}
              </div>
              <a href={`/full-report?id=${id}`}>
                <Button variant="secondary" className="mt-4 w-full">Lihat Semua Eksperimen</Button>
              </a>
            </Card>
          )}
        </div>
      )}
    </PageShell>
  );
}
