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
import DimensionBar from "../components/ui/DimensionBar";

const DIMENSION_KEYS = ["skills_alignment", "interest_resonance", "values_alignment",
  "cognitive_fit", "education_alignment", "constraint_impact",
  "environment_fit", "market_timing", "trajectory_alignment"];

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
    <PageShell title="Full Report" showBack backHref={id ? `/result?id=${id}` : "/dashboard"}>
      <Head><title>Full Report — Life Compass v2</title><meta name="robots" content="noindex" /></Head>
      {loading ? (
        <LoadingState skeleton="card" count={2} />
      ) : !result ? (
        <Card className="text-center py-12 border-2 border-ink/10">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-bold text-ink mb-2">Laporan tidak ditemukan</h3>
          <p className="text-ink/60 mb-6">Mungkin tautan ini sudah tidak valid.</p>
          <a href="/dashboard"><Button>Kembali ke Dashboard</Button></a>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Report Header */}
          <Card padding="lg" className="border-2 border-ink/10">
            <h2 className="text-2xl font-bold text-ink mb-2">Laporan Lengkap — Career Intelligence Report</h2>
            <Badge variant="ink">{result.assessment_version === "v2" ? "v2 — 9 Dimensi" : "v1"}</Badge>
            <p className="text-ink/50 mt-4 mb-4">Analisis mendalam hasil discovery karirmu dengan 3-pass scoring engine.</p>
            <p className="text-ink/70 leading-relaxed">{result.summary}</p>
          </Card>

          {/* Risk Note */}
          {result.risk_note && result.risk_note !== "Tidak ada risiko signifikan yang terdeteksi." && (
            <Card padding="md" className="bg-amber-50 border-2 border-amber-500">
              <div className="flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-bold text-ink text-sm">Perhatian</p>
                  <p className="text-sm text-ink/70 mt-1">{result.risk_note}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Tier 1 — Full Deep Dive */}
          {(result.tier1 || []).length > 0 && (
            <Card padding="lg" className="border-2 border-ink/10">
              <h3 className="font-bold text-xl text-ink mb-4">Tier 1 — Career Compass (Full Analysis)</h3>
              {result.tier1.map((c, ci) => (
                <div key={ci} className={`${ci > 0 ? "border-t-2 border-ink/10 pt-6 mt-6" : ""}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="emerald">#{ci + 1}</Badge>
                      <h4 className="text-lg font-bold text-ink">{c.title}</h4>
                      <Badge variant={c.feasibility_flag === "REACHABLE_NOW" ? "emerald" : "blue"}>
                        {c.feasibility_flag?.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-emerald-700">{c.final_adjusted_score}%</span>
                      {c.confidence_band && (
                        <p className="text-[10px] text-ink/40">{c.confidence_band[0]}–{c.confidence_band[1]}% band</p>
                      )}
                    </div>
                  </div>

                  <Badge variant="emerald">{c.label}</Badge>
                  <p className="text-sm text-ink/70 mt-2 mb-4">{c.headline}</p>

                  {/* 9 Dimensions */}
                  {c.dimensions && (
                    <div className="mb-4">
                      <h5 className="font-bold text-sm text-ink/70 mb-2">9 Dimensi Kecocokan</h5>
                      <div className="space-y-1.5">
                        {DIMENSION_KEYS.map((k) => {
                          const d = c.dimensions[k];
                          if (!d) return null;
                          return (
                            <div key={k} className="flex items-center gap-2">
                              <DimensionBar dimKey={k} value={d.raw ?? 50} maxScore={100} />
                              <span className="text-[10px] text-ink/40 w-24 shrink-0">
                                conf: {Math.round((d.confidence || 0) * 100)}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Reasoning */}
                  {c.reasoning && c.reasoning.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-bold text-sm text-ink/70 mb-2">Alasan & Analisis</h5>
                      <ul className="space-y-1">
                        {c.reasoning.map((r, i) => (
                          <li key={i} className="text-xs text-ink/60 bg-warm rounded-xl px-3 py-2 border border-ink/10">{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Gap Analysis */}
                  {c.gap_analysis && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                      <h5 className="font-bold text-sm text-red-800 mb-3">Honest Gap Analysis</h5>

                      {c.gap_analysis.skills?.critical_gaps?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-bold text-red-700 mb-1">Critical Gaps (block entry):</p>
                          <div className="space-y-1.5">
                            {c.gap_analysis.skills.critical_gaps.map((g, i) => (
                              <div key={i} className="text-xs bg-white rounded-lg p-2 border border-red-100">
                                <span className="font-bold text-red-800">{g.skill}</span>
                                <p className="text-red-600">{g.close_pathway}</p>
                                <p className="text-red-400">{g.estimated_time}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {c.gap_analysis.education && (
                        <div className="mb-3">
                          <p className="text-xs font-bold text-amber-700 mb-1">Education Gap:</p>
                          <div className="text-xs bg-white rounded-lg p-2 border border-amber-100">
                            <p>Rekomendasi: {c.gap_analysis.education.recommendation}</p>
                            <p className="text-amber-600">Estimasi: {c.gap_analysis.education.estimated_time}</p>
                          </div>
                        </div>
                      )}

                      {c.gap_analysis.timeline && (
                        <div>
                          <p className="text-xs font-bold text-blue-700 mb-1">Timeline:</p>
                          <div className="text-xs bg-white rounded-lg p-2 border border-blue-100">
                            <span className="font-bold text-blue-800">{c.gap_analysis.timeline.total_months} bulan</span> total estimasi sampai hiring-ready
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </Card>
          )}

          {/* Tier 2 */}
          {(result.tier2 || []).length > 0 && (
            <Card padding="lg" className="border-2 border-ink/10">
              <h3 className="font-bold text-xl text-ink mb-4">Tier 2 — Strong Alternatives</h3>
              <div className="space-y-4">
                {result.tier2.map((c, i) => (
                  <div key={i} className="border-b-2 border-ink/10 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="amber">#{i + 1}</Badge>
                        <h4 className="font-semibold text-ink">{c.title}</h4>
                      </div>
                      <span className="text-lg font-bold text-amber-700">{c.final_adjusted_score}%</span>
                    </div>
                    <p className="text-xs text-ink/60">{c.headline}</p>
                    <Badge variant="gray" className="mt-1">{c.label}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Full Flat Results */}
          <Card padding="lg" className="border-2 border-ink/10">
            <h3 className="font-bold text-xl text-ink mb-4">Semua Skor Kecocokan ({result.results?.length || 0} karir)</h3>
            <div className="space-y-4">
              {(result.results || []).map((c, i) => (
                <div key={i} className="border-b-2 border-ink/10 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant={i === 0 ? "emerald" : i === 1 ? "amber" : i === 2 ? "blue" : "gray"}>#{i + 1}</Badge>
                      <h4 className="font-semibold text-ink">{c.title}</h4>
                    </div>
                    <span className={`text-xs font-bold ${c.label?.includes("Strong") ? "text-emerald-700" : c.label?.includes("Good") ? "text-blue-700" : c.label?.includes("Conditional") ? "text-amber-700" : "text-gray-500"}`}>{c.label}</span>
                  </div>
                  <ScoreBar score={c.score || c.final_adjusted_score} label={c.label} />
                  {c.reason && <p className="text-xs text-ink/50 mt-1">{c.reason}</p>}
                  {c.dimensions && (
                    <div className="mt-3 pt-2 border-t border-ink/10 space-y-1">
                      {DIMENSION_KEYS.map((k) => {
                        const d = c.dimensions[k];
                        const val = typeof d === 'object' ? d.raw ?? 50 : d;
                        return val !== undefined ? <DimensionBar key={k} dimKey={k} value={val} maxScore={100} /> : null;
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Experiment Plan */}
          {(result.experiment_plan || []).length > 0 && (
            <Card padding="lg" className="border-2 border-ink/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg text-ink">Rencana Eksperimen 7 Hari</h3>
                <Badge variant="ink">Action</Badge>
              </div>
              <p className="text-sm text-ink/60 mb-4">Langkah konkret untuk menguji karir pilihanmu:</p>
              <div className="space-y-2">
                {result.experiment_plan.map((task, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm bg-warm rounded-xl p-3 border border-ink/10">
                    <span className="bg-ink text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</span>
                    <span className="text-ink pt-0.5">{task}</span>
                  </div>
                ))}
              </div>
              <a href="/experiments">
                <Button className="mt-4 w-full">Centang Progress Eksperimen</Button>
              </a>
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
