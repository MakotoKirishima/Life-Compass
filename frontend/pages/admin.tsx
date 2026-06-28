import { useEffect, useState } from "react";
import LockModal from "../components/LockModal";

export default function Admin({ user, api }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("stats");
  const [landing, setLanding] = useState<any>({});
  const [careers, setCareers] = useState([]);
  const [aiHelp, setAiHelp] = useState("");
  const [showLock, setShowLock] = useState(false);

  useEffect(() => {
    if (!user) { setShowLock(true); return; }
    fetch(`${api}/api/admin/stats`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${api}/api/admin/users`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => r.json()).then(setUsers).catch(() => {});
    fetch(`${api}/api/admin/landing-page`)
      .then(r => r.json()).then(setLanding).catch(() => {});
    fetch(`${api}/api/careers/`)
      .then(r => r.json()).then(setCareers).catch(() => {});
  }, [user]);

  if (!user) return <LockModal show={showLock} />;

  const updateLanding = async () => {
    await fetch(`${api}/api/admin/landing-page`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
      body: JSON.stringify(landing),
    });
    alert("Landing page updated!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Admin — Life Compass</h1>
          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">Admin</span>
        </div>
        <a href="/" className="text-sm text-gray-500 hover:text-gray-700 font-medium">← ke Beranda</a>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {["stats", "users", "careers", "landing"].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              tab === t ? "bg-blue-600 text-white shadow-sm" : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}>
              {t === "stats" ? "Statistik" : t === "users" ? "User" : t === "careers" ? "Karir" : "Landing Page"}
            </button>
          ))}
        </div>

        {tab === "stats" && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Total User", value: stats.total_users },
              { label: "Selesai Discovery", value: stats.completed_discovery },
            ].map(s => (
              <div key={s.label} className="bg-white p-6 rounded-2xl shadow-sm border">
                <p className="text-gray-500 text-sm">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["ID", "Email", "Nama", "Tanggal"].map(h => (
                      <th key={h} className="text-left p-4 font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-t hover:bg-gray-50 transition">
                      <td className="p-4 text-gray-500">{u.id}</td>
                      <td className="p-4">{u.email || "-"}</td>
                      <td className="p-4">{u.display_name || "-"}</td>
                      <td className="p-4 text-gray-400">{u.created_at?.substring(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "careers" && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                value={aiHelp} onChange={e => setAiHelp(e.target.value)}
                placeholder="Nama karir baru..."
                className="flex-1 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
              }} className="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm whitespace-nowrap">+ Tambah (Bantu AI)</button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["ID", "Nama", "Kategori", "Prospek", "Risiko AI"].map(h => (
                        <th key={h} className="text-left p-4 font-semibold text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {careers.map(c => (
                      <tr key={c.id} className="border-t hover:bg-gray-50 transition">
                        <td className="p-4 text-gray-500">{c.id}</td>
                        <td className="p-4 font-medium text-gray-900">{c.title}</td>
                        <td className="p-4 text-gray-600">{c.category}</td>
                        <td className="p-4">{c.market_prospect && (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            c.market_prospect === "Tinggi" ? "bg-emerald-100 text-emerald-700" :
                            c.market_prospect === "Sedang" ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          }`}>{c.market_prospect}</span>
                        )}</td>
                        <td className="p-4">{c.ai_risk && (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            c.ai_risk === "Rendah" ? "bg-emerald-100 text-emerald-700" :
                            c.ai_risk === "Sedang" ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          }`}>{c.ai_risk}</span>
                        )}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "landing" && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
            <h2 className="font-bold text-xl text-gray-900 mb-6">Atur Landing Page</h2>
            {["hero_title", "hero_subtitle", "cta_text"].map(f => (
              <div key={f} className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f}</label>
                <input value={landing[f] || ""} onChange={e => setLanding({...landing, [f]: e.target.value})}
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
            ))}
            <button onClick={updateLanding} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-sm">Simpan</button>
          </div>
        )}
      </div>
    </div>
  );
}
