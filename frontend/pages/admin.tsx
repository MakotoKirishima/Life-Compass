import { useEffect, useState } from "react";

export default function Admin({ user, api }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("stats");
  const [landing, setLanding] = useState<any>({});
  const [careers, setCareers] = useState([]);
  const [aiHelp, setAiHelp] = useState("");

  useEffect(() => {
    if (!user) { window.location.href = "/login"; return; }
    fetch(`${api}/api/admin/stats`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${api}/api/admin/users`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => r.json()).then(setUsers).catch(() => {});
    fetch(`${api}/api/admin/landing-page`)
      .then(r => r.json()).then(setLanding).catch(() => {});
    fetch(`${api}/api/careers/`)
      .then(r => r.json()).then(setCareers).catch(() => {});
  }, [user]);

  if (!user) return null;

  const updateLanding = async () => {
    await fetch(`${api}/api/admin/landing-page`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
      body: JSON.stringify(landing),
    });
    alert("Landing page updated!");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">Admin — Life Compass</h1>
        <a href="/" className="text-sm text-gray-500 hover:text-gray-700">← ke Beranda</a>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {["stats", "users", "careers", "landing"].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${tab === t ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
              {t === "stats" ? "Statistik" : t === "users" ? "User" : t === "careers" ? "Karir" : "Landing Page"}
            </button>
          ))}
        </div>

        {tab === "stats" && stats && (
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            {[
              { label: "Total User", value: stats.total_users },
              { label: "Selesai Discovery", value: stats.completed_discovery },
            ].map(s => (
              <div key={s.label} className="bg-white p-6 rounded-xl shadow-sm border">
                <p className="text-gray-500 text-sm">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>{["ID", "Email", "Nama", "Tanggal"].map(h => <th key={h} className="text-left p-3 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3">{u.id}</td>
                    <td className="p-3">{u.email || "-"}</td>
                    <td className="p-3">{u.display_name || "-"}</td>
                    <td className="p-3">{u.created_at?.substring(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "careers" && (
          <div>
            <div className="flex gap-2 mb-4">
              <input
                value={aiHelp} onChange={e => setAiHelp(e.target.value)}
                placeholder="Nama karir baru..."
                className="flex-1 border rounded-lg px-4 py-2"
              />
              <button onClick={async () => {
                if (!aiHelp) return;
                const res = await fetch(`${api}/api/admin/careers/generate`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
                  body: JSON.stringify({ title: aiHelp, category: "Umum", keywords: aiHelp }),
                });
                const data = await res.json();
                const createRes = await fetch(`${api}/api/admin/careers`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
                  body: JSON.stringify({ title: aiHelp, category: "Umum", ...data }),
                });
                const created = await createRes.json();
                alert(`Karir "${aiHelp}" berhasil ditambahkan!`);
                setAiHelp("");
                window.location.reload();
              }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">+ Tambah (Bantu AI)</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>{["ID", "Nama", "Kategori", "Prospek", "Risiko AI"].map(h => <th key={h} className="text-left p-3 font-medium">{h}</th>)}</tr></thead>
                <tbody>
                  {careers.map(c => (
                    <tr key={c.id} className="border-t">
                      <td className="p-3">{c.id}</td>
                      <td className="p-3 font-medium">{c.title}</td>
                      <td className="p-3">{c.category}</td>
                      <td className="p-3">{c.market_prospect}</td>
                      <td className="p-3">{c.ai_risk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "landing" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-bold text-lg mb-4">Atur Landing Page</h2>
            {["hero_title", "hero_subtitle", "cta_text"].map(f => (
              <div key={f} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{f}</label>
                <input value={landing[f] || ""} onChange={e => setLanding({...landing, [f]: e.target.value})} className="w-full border rounded-lg px-4 py-2" />
              </div>
            ))}
            <button onClick={updateLanding} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Simpan</button>
          </div>
        )}
      </div>
    </div>
  );
}
