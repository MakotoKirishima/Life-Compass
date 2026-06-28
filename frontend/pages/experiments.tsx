import { useEffect, useState } from "react";
import LockModal from "../components/LockModal";

export default function Experiments({ user, api }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLock, setShowLock] = useState(false);

  useEffect(() => {
    if (!user) { setShowLock(true); setLoading(false); return; }
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

  if (!user) return <LockModal show={showLock} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <a href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Life Compass</a>
        <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 font-medium inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Dashboard
        </a>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Rencana Eksperimen</h1>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center bg-white rounded-2xl shadow-sm border p-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
            </div>
            <p className="text-gray-500 mb-2">Belum ada rencana eksperimen</p>
            <a href="/dashboard" className="text-blue-600 hover:underline font-medium text-sm">Mulai discovery →</a>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-lg text-gray-900">{plan.career_title}</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">Dibuat: {plan.created_at?.substring(0, 10)}</p>
                <div className="space-y-3">
                  {(plan.tasks || []).map((task, i) => {
                    const ts = plan.task_status?.find(t => t.index === i);
                    const done = ts?.done || false;
                    return (
                      <label key={i} className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox" checked={done}
                          onChange={() => toggleTask(plan.id, i, done)}
                          className="mt-0.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm ${done ? "line-through text-gray-400" : "text-gray-700"}`}>{task}</span>
                      </label>
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
