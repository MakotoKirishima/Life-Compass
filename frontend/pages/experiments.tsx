import { useEffect, useState } from "react";

export default function Experiments({ user, api }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { window.location.href = "/login"; return; }
    fetch(`${api}/api/discovery/experiments`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(r => r.json())
      .then(data => { setPlans(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const toggleTask = async (planId, taskIndex, done) => {
    await fetch(`${api}/api/discovery/experiments/${planId}/tasks/${taskIndex}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({ done: !done }),
    });
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      const ts = [...(p.task_status || [])];
      const idx = ts.findIndex(t => t.index === taskIndex);
      if (idx >= 0) ts[idx] = { ...ts[idx], done: !done };
      else ts.push({ index: taskIndex, task: "", done: !done });
      return { ...p, task_status: ts };
    }));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <a href="/dashboard" className="text-xl font-bold text-blue-700">Life Compass</a>
        <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</a>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Rencana Eksperimen</h1>
        {loading ? (
          <div className="text-center py-8"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : plans.length === 0 ? (
          <p className="text-gray-500">Belum ada rencana eksperimen. <a href="/dashboard" className="text-blue-600 hover:underline">Mulai discovery</a></p>
        ) : (
          <div className="space-y-4">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white rounded-xl border p-5">
                <h3 className="font-bold text-lg mb-1">{plan.career_title}</h3>
                <p className="text-sm text-gray-400 mb-4">Dibuat: {plan.created_at?.substring(0, 10)}</p>
                <div className="space-y-2">
                  {(plan.tasks || []).map((task, i) => {
                    const ts = plan.task_status?.find(t => t.index === i);
                    const done = ts?.done || false;
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <input
                          type="checkbox" checked={done}
                          onChange={() => toggleTask(plan.id, i, done)}
                          className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm ${done ? "line-through text-gray-400" : "text-gray-700"}`}>{task}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
