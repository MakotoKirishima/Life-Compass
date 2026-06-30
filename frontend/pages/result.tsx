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
import { safeFetch } from "../lib/fetch";

const FEASIBILITY_COLORS: Record<string, "emerald" | "blue" | "amber" | "coral" | "gray"> = {
  "REACHABLE_NOW": "emerald",
  "REACHABLE_NEAR": "blue",
  "REACHABLE_LONG": "amber",
  "CONDITIONAL": "coral",
  "ASPIRATIONAL": "gray",
};

const DIMENSION_KEYS = ["skills_alignment", "interest_resonance", "values_alignment",
  "cognitive_fit", "education_alignment", "constraint_impact",
  "environment_fit", "market_timing", "trajectory_alignment"];

function getFeasibilityVariant(flag: string): "emerald" | "blue" | "amber" | "coral" | "gray" {
  return FEASIBILITY_COLORS[flag] || "gray";
}

export default function ResultDetail({ user, api }) {
  const router = useRouter();
  const { id } = router.query;
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLock, setShowLock] = useState(false);
  const [challengeMode, setChallengeMode] = useState<string | null>(null);
  const [challengeText, setChallengeText] = useState("");
  const [challengeReplied, setChallengeReplied] = useState(false);
  const [challengeResult, setChallengeResult] = useState<any>(null);
  const [challengeLoading, setChallengeLoading] = useState(false);

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

  const submitChallenge = async (careerTitle: string, score: number, dimensions?: any) => {
    if (!challengeText.trim()) return;
    setChallengeLoading(true);
    const res = await safeFetch("/api/discovery/challenge", {
      method: "POST",
      data: { career_title: careerTitle, user_argument: challengeText, original_score: score, dimensions },
      token: user?.token,
      baseUrl: api,
    });
    if (res.ok) {
      setChallengeResult(res.data);
      setChallengeReplied(true);
    }
    setChallengeLoading(false);
  };

  if (!user) return <LockModal show={showLock} />;

  return (
    <PageShell title="Hasil Discovery" showBack backHref="/dashboard">
      <Head><title>Hasil Discovery — Life Compass v2</title><meta name="robots" content="noindex" /></Head>
      {loading ? (
        <LoadingState skeleton="card" count={2} />
      ) : !result ? (
        <Card className="text-center py-12 border-2 border-ink/10">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-ink mb-2">Hasil tidak ditemukan</h3>
          <p className="text-ink/60 mb-6">Mungkin hasil ini sudah dihapus atau tautan tidak valid.</p>
          <a href="/dashboard"><Button>Kembali ke Dashboard</Button></a>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Direction Snapshot */}
          <Card padding="lg" className="border-2 border-ink/10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-ink">Direction Snapshot</h2>
              <Badge variant="ink">{result.assessment_version === "v2" ? "v2 ⚡" : "Hasil"}</Badge>
            </div>
            <p className="text-ink/60 mb-6 leading-relaxed">{result.summary}</p>

            {/* Tier 1 — Top career */}
            {(result.tier1 || []).length > 0 && (
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-5 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="emerald">Tier 1 — {result.tier1[0].label}</Badge>
                    <Badge variant={getFeasibilityVariant(result.tier1[0].feasibility_flag)}>
                      {result.tier1[0].feasibility_flag?.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <span className="text-2xl font-bold text-emerald-700">{result.tier1[0].final_adjusted_score}%</span>
                </div>
                <h3 className="text-xl font-bold text-ink mb-1">{result.tier1[0].title}</h3>
                <p className="text-ink/60 text-sm">{result.tier1[0].headline || result.tier1[0].reasoning?.[0]}</p>
                {result.tier1[0].confidence_band && (
                  <p className="text-xs text-ink/40 mt-2">
                    Confidence band: {result.tier1[0].confidence_band[0]}% – {result.tier1[0].confidence_band[1]}%
                  </p>
                )}
                {result.tier1[0].dimensions && (
                  <div className="mt-4 pt-4 border-t border-emerald-200 space-y-1.5">
                    {DIMENSION_KEYS.map((k) => {
                      const d = result.tier1[0].dimensions[k];
                      return d !== undefined ? (
                        <div key={k} className="flex items-center gap-2">
                          <DimensionBar dimKey={k} value={d.raw ?? 50} maxScore={100} />
                          <span className="text-[10px] text-ink/40 w-16 shrink-0">
                            conf:{Math.round((d.confidence || 0) * 100)}%
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Challenge Mode */}
                {!challengeReplied && (
                  <div className="mt-4 pt-4 border-t border-emerald-200">
                    {!challengeMode ? (
                      <button
                        onClick={() => setChallengeMode(result.tier1[0].title)}
                        className="text-xs text-ink/50 hover:text-ink font-medium underline underline-offset-2"
                      >
                        Tidak setuju? Tekan di sini untuk Challenge Mode →
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-ink/70">Kenapa kamu merasa tidak cocok?</p>
                        <textarea
                          value={challengeText}
                          onChange={(e) => setChallengeText(e.target.value)}
                          placeholder="Contoh: Aku rasa karir ini terlalu banyak coding, dan aku nggak suka coding..."
                          className="w-full border-2 border-ink/20 rounded-xl px-4 py-3 h-20 focus:outline-none focus:border-ink text-sm bg-warm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => submitChallenge(
                            result.tier1[0].title,
                            result.tier1[0].final_adjusted_score,
                            Object.fromEntries(
                              DIMENSION_KEYS.map(k => [k, result.tier1[0].dimensions?.[k]?.raw])
                            )
                          )} disabled={challengeLoading || !challengeText.trim()}>
                            {challengeLoading ? "Mengevaluasi..." : "Kirim Challenge"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setChallengeMode(null)}>
                            Batal
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {challengeReplied && challengeResult && (
                  <div className={`mt-3 p-3 rounded-xl text-sm border-2 ${
                    challengeResult.mode === "Reconsidering"
                      ? "bg-amber-50 border-amber-300"
                      : challengeResult.mode === "Contextualizing"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-emerald-50 border-emerald-200"
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={
                        challengeResult.mode === "Reconsidering" ? "amber" :
                        challengeResult.mode === "Contextualizing" ? "blue" : "emerald"
                      }>
                        {challengeResult.mode}
                      </Badge>
                      {challengeResult.adjusted_score && (
                        <span className="text-xs font-bold text-ink/60">
                          Skor baru: {Math.round(challengeResult.adjusted_score)}%
                        </span>
                      )}
                    </div>
                    <p className="text-ink/80 text-xs mt-1">{challengeResult.message}</p>
                    <p className="text-ink/50 text-xs mt-1 italic">"{challengeResult.explanation}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Tier 1 remaining */}
            {(result.tier1 || []).slice(1).length > 0 && (
              <div className="space-y-3 mb-4">
                <h4 className="font-bold text-sm text-ink/70">Tier 1 — Rekomendasi Utama Lainnya</h4>
                {result.tier1.slice(1).map((c, i) => (
                  <div key={i} className="bg-emerald-50/50 border border-emerald-300 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="emerald">#{i + 2}</Badge>
                        <Badge variant={getFeasibilityVariant(c.feasibility_flag)}>
                          {c.feasibility_flag?.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <span className="text-lg font-bold text-emerald-700">{c.final_adjusted_score}%</span>
                    </div>
                    <h4 className="font-bold text-ink">{c.title}</h4>
                    <p className="text-xs text-ink/60 mt-1">{c.label}</p>
                    <p className="text-xs text-ink/50 mt-1">{c.headline}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tier 2 */}
            {(result.tier2 || []).length > 0 && (
              <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-5 mb-6">
                <h4 className="font-bold text-sm text-ink/70 mb-3">Tier 2 — Alternatif Kuat</h4>
                <div className="space-y-3">
                  {result.tier2.slice(0, 4).map((c, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-amber-200 pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-ink text-sm">{c.title}</p>
                        <p className="text-xs text-ink/50">{c.label}</p>
                      </div>
                      <span className="font-bold text-amber-700">{c.final_adjusted_score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <a href={`/full-report?id=${id}`}><Button>Lihat Laporan Lengkap</Button></a>
              <a href="/dashboard"><Button variant="outline">Dashboard</Button></a>
            </div>
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

          {/* Gap Analysis for Tier 1 */}
          {result.tier1?.[0]?.gap_analysis && (
            <Card padding="lg" className="border-2 border-ink/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-ink">Gap Analysis — {result.tier1[0].title}</h3>
                <Badge variant="ink">Honest</Badge>
              </div>

              {/* Skills Gaps */}
              {result.tier1[0].gap_analysis.skills?.critical_gaps?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-bold text-sm text-red-700 mb-2">Critical Gaps ⛔</h4>
                  <div className="space-y-2">
                    {result.tier1[0].gap_analysis.skills.critical_gaps.map((g, i) => (
                      <div key={i} className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm">
                        <p className="font-semibold text-red-800">{g.skill}</p>
                        <p className="text-xs text-red-600 mt-1">{g.close_pathway} — {g.estimated_time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Gap */}
              {result.tier1[0].gap_analysis.education && (
                <div className="mb-4">
                  <h4 className="font-bold text-sm text-amber-700 mb-2">Pendidikan 🎓</h4>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
                    <p className="text-ink/70">Levelmu: <strong>{result.tier1[0].gap_analysis.education.user_level}</strong></p>
                    <p className="text-ink/70 mt-1">Rekomendasi: <strong>{result.tier1[0].gap_analysis.education.recommendation}</strong></p>
                    <p className="text-xs text-ink/50 mt-1">Estimasi: {result.tier1[0].gap_analysis.education.estimated_time}</p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              {result.tier1[0].gap_analysis.timeline && (
                <div>
                  <h4 className="font-bold text-sm text-ink/70 mb-2">Timeline 📅</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm">
                    <p className="font-bold text-blue-800">Estimasi total: {result.tier1[0].gap_analysis.timeline.total_months} bulan</p>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Survival Strategy (Runway vs Timeline) */}
          {result.survival_strategy && result.survival_strategy.bridge_jobs && (
            <Card padding="lg" className="border-2 border-red-200 bg-red-50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">⚠️</span>
                <h3 className="font-bold text-lg text-red-800">Peringatan Finansial</h3>
              </div>
              <p className="text-sm text-red-700 mb-4">{result.survival_strategy.strategy}</p>
              <div className="bg-white rounded-xl p-4 border border-red-100 space-y-3">
                <p className="font-bold text-sm text-red-800">Strategi Bertahan:</p>
                <div className="flex flex-wrap gap-2">
                  {(result.survival_strategy.bridge_jobs || []).map((job, i) => (
                    <Badge key={i} variant="coral">{job}</Badge>
                  ))}
                </div>
                {result.survival_strategy.weekly_schedule && (
                  <p className="text-xs text-red-600 mt-2">Jadwal: {result.survival_strategy.weekly_schedule}</p>
                )}
              </div>
            </Card>
          )}

          {/* Transferable Skills */}
          {result.transferable_skills && result.transferable_skills.length > 0 && (
            <Card padding="lg" className="border-2 border-ink/10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🔄</span>
                <h3 className="font-bold text-lg text-ink">Transferable Skills</h3>
              </div>
              <p className="text-sm text-ink/60 mb-4">Anda mungkin merasa harus mulai dari nol, tapi banyak skill Anda sudah <strong>transferable</strong>:</p>
              <div className="space-y-3">
                {result.transferable_skills.map((item, i) => (
                  <div key={i} className="bg-warm border border-ink/10 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="gray">{item.old_skill}</Badge>
                      <span className="text-ink/40">→</span>
                      <Badge variant="emerald">{item.new_skill}</Badge>
                    </div>
                    <p className="text-xs text-ink/60">{item.explanation}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Career Pivot Map */}
          {result.pivot_map && Object.keys(result.pivot_map).length > 0 && (
            <Card padding="lg" className="border-2 border-ink/10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🗺️</span>
                <h3 className="font-bold text-lg text-ink">Career Pivot Map</h3>
              </div>
              <p className="text-sm text-ink/60 mb-4">Karir bukan jalan lurus. Berikut peta perpindahan karir yang mungkin:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(result.pivot_map).map(([career, relations]) => (
                  <div key={career} className="bg-warm border border-ink/10 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-ink" />
                      <p className="font-bold text-ink text-sm">{career}</p>
                    </div>
                    {Array.isArray(relations) && relations.length > 0 && (
                      <div className="ml-5 space-y-2">
                        {relations.map((rel, i) => {
                          const label = typeof rel === 'string' ? rel : rel.career || rel.title || JSON.stringify(rel);
                          const note = typeof rel === 'string' ? '' : rel.relation || rel.why || '';
                          return (
                            <div key={i} className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-ink/20 mt-1.5 shrink-0" />
                              <div>
                                <span className="text-xs font-semibold text-ink/70">{label}</span>
                                {note && <p className="text-[10px] text-ink/40">{note}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* All scores with dimensions */}
          {(result.results || []).length > 2 && (
            <Card padding="lg" className="border-2 border-ink/10">
              <h3 className="font-bold text-lg text-ink mb-4">Semua Skor Kecocokan ({result.results.length} karir)</h3>
              <div className="space-y-4">
                {result.results.slice(0, 10).map((c, i) => (
                  <div key={i} className="border-b-2 border-ink/10 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant={i === 0 ? "emerald" : i === 1 ? "amber" : i === 2 ? "blue" : "gray"}>#{i + 1}</Badge>
                        <h4 className="font-semibold text-ink text-sm">{c.title}</h4>
                        <Badge variant={c.feasibility_flag === "REACHABLE_NOW" ? "emerald" : "gray"}>{c.feasibility_flag?.replace(/_/g, " ")}</Badge>
                      </div>
                      <span className="text-xs font-bold text-ink/60">{c.score || c.final_adjusted_score}%</span>
                    </div>
                    <ScoreBar score={c.score || c.final_adjusted_score} label={c.label} />
                    {c.reason && <p className="text-xs text-ink/50 mt-1">{c.reason}</p>}
                    {c.dimensions && i < 3 && (
                      <div className="mt-2 pt-2 border-t border-ink/10 space-y-1">
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
          )}

          {/* Experiment Plan */}
          {(result.experiment_plan || []).length > 0 && (
            <Card padding="lg" className="border-2 border-ink/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg text-ink">Rencana Eksperimen 7 Hari</h3>
                <Badge variant="ink">Action</Badge>
              </div>
              <p className="text-sm text-ink/60 mb-4">Coba langkah kecil ini untuk menguji karir pilihanmu:</p>
              <div className="space-y-2">
                {result.experiment_plan.slice(0, 4).map((task, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm bg-warm rounded-xl p-3 border border-ink/10">
                    <span className="bg-ink text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</span>
                    <span className="text-ink pt-0.5">{task}</span>
                  </div>
                ))}
              </div>
              <a href="/experiments">
                <Button className="mt-4 w-full">Lihat & Centang Semua Eksperimen</Button>
              </a>
            </Card>
          )}
        </div>
      )}
    </PageShell>
  );
}
