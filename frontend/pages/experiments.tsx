import { useEffect, useState } from "react";
import LockModal from "../components/LockModal";
import PageShell from "../components/ui/PageShell";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import LoadingState from "../components/ui/LoadingState";
import EmptyState from "../components/ui/EmptyState";

export default function Experiments({ user, api }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLock, setShowLock] = useState(false);

  useEffect(() => {
    if (!user) { setShowLock(true); setLoading(false); return; }
    fetch(`${api}/api/discovery/experiments`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((data) => { setPlans(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const toggleTask = async (planId, taskIndex, done) => {
    try {
      await fetch(`${api}/api/discovery/experiments/${planId}/tasks/${taskIndex}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ done: !done }),
      });
      setPlans((prev) =>
        prev.map((p) => {
          if (p.id !== planId) return p;
          const ts = [...(p.task_status || [])];
          const idx = ts.findIndex((t) => t.index === taskIndex);
          if (idx >= 0) ts[idx] = { ...ts[idx], done: !done };
          else ts.push({ index: taskIndex, task: "", done: !done });
          return { ...p, task_status: ts };
        })
      );
    } catch {}
  };

  if (!user) return <LockModal show={showLock} />;

  return (
    <PageShell title="Eksperimen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Rencana Eksperimen</h1>

      {loading ? (
        <LoadingState skeleton="card" count={2} />
      ) : plans.length === 0 ? (
        <Card>
          <EmptyState
            icon="🧪"
            title="Belum ada rencana eksperimen"
            description="Setelah menyelesaikan discovery, kamu akan mendapat rencana eksperimen 7 hari."
            actionLabel="Mulai Discovery"
            actionHref="/dashboard"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const total = (plan.tasks || []).length;
            const done = (plan.task_status || []).filter((t) => t.done).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <Card key={plan.id}>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-lg text-gray-900">{plan.career_title}</h3>
                  <Badge variant={pct === 100 ? "emerald" : pct > 0 ? "blue" : "gray"}>
                    {pct}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mb-4">Dibuat: {plan.created_at?.substring(0, 10)}</p>

                {total > 0 && (
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                    <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                )}

                <div className="space-y-3">
                  {(plan.tasks || []).map((task, i) => {
                    const ts = plan.task_status?.find((t) => t.index === i);
                    const d = ts?.done || false;
                    return (
                      <label key={i} className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={d}
                          onChange={() => toggleTask(plan.id, i, d)}
                          className="mt-0.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm ${d ? "line-through text-gray-400" : "text-gray-700"}`}>
                          {task}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
