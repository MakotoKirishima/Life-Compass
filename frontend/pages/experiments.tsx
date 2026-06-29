import { useEffect, useState } from "react";
import Head from "next/head";
import LockModal from "../components/LockModal";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import LoadingState from "../components/ui/LoadingState";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import PageShell from "../components/ui/PageShell";

export default function Experiments({ user, api }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLock, setShowLock] = useState(false);

  useEffect(() => {
    if (!user) { setShowLock(true); setLoading(false); return; }
    fetch(`${api}/api/discovery/experiments`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((data) => { setPlans(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError("Gagal memuat data eksperimen."); setLoading(false); });
  }, [user]);

  const toggleTask = async (planId, taskIndex, done) => {
    try {
      await fetch(`${api}/api/discovery/experiments/${planId}/tasks/${taskIndex}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ done }),
      });
      setPlans((prev) => prev.map((p) => {
        if (p.id !== planId) return p;
        const ts = (p.task_status || []).map((t) =>
          t.index === taskIndex ? { ...t, done } : t
        );
        const completed = ts.filter((t) => t.done).length;
        return { ...p, task_status: ts, completion_rate: Math.round((completed / (p.tasks || []).length) * 100) || 0 };
      }));
    } catch {}
  };

  if (!user) return <LockModal show={showLock} />;

  return (
    <PageShell title="Eksperimen" showBack backHref="/dashboard">
      <Head><title>Eksperimen — Life Compass</title></Head>
      <h2 className="text-2xl font-bold text-ink mb-6">Eksperimen 7 Hari</h2>
      {loading ? (
        <LoadingState skeleton="card" count={2} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : plans.length === 0 ? (
        <EmptyState icon="🧪" title="Belum ada rencana eksperimen" description="Selesaikan discovery untuk mendapatkan rencana eksperimen 7 hari yang dipersonalisasi." action={{ label: "Ke Dashboard", href: "/dashboard" }} />
      ) : (
        <div className="space-y-6">
          {plans.map((plan) => (
            <Card key={plan.id} padding="lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-ink">{plan.career_title}</h3>
                  <p className="text-xs text-ink/50 mt-1">{plan.created_at}</p>
                </div>
                <Badge variant={plan.status === "completed" ? "emerald" : "blue"}>
                  {plan.status === "completed" ? "Selesai" : "Berjalan"}
                </Badge>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-3 bg-ink/10 rounded-full overflow-hidden">
                  <div className="h-full bg-ink rounded-full transition-all duration-500" style={{ width: `${plan.completion_rate || 0}%` }} />
                </div>
                <span className="text-xs font-bold text-ink/60">{plan.completion_rate || 0}%</span>
              </div>

              <div className="space-y-2">
                {(plan.tasks || []).map((task, i) => {
                  const status = (plan.task_status || []).find((t) => t.index === i);
                  return (
                    <label key={i} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all text-sm ${status?.done ? "bg-emerald-50 line-through text-ink/40" : "bg-warm hover:bg-ink/5 border border-ink/10"}`}>
                      <input
                        type="checkbox"
                        checked={status?.done || false}
                        onChange={(e) => toggleTask(plan.id, i, e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-ink/30 text-ink focus:ring-ink"
                      />
                      <span className="pt-0.5">{task}</span>
                    </label>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
