import { useEffect, useState } from "react";
import LockModal from "../components/LockModal";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import LoadingState from "../components/ui/LoadingState";

export default function Admin({ user, api }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("stats");
  const [landing, setLanding] = useState<any>({});
  const [careers, setCareers] = useState([]);
  const [aiHelp, setAiHelp] = useState("");
  const [showLock, setShowLock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!user) { setShowLock(true); setLoading(false); return; }
    Promise.all([
      fetch(`${api}/api/admin/stats`, { headers: { Authorization: `Bearer ${user.token}` } }).then(async (r) => {
        if (r.status === 403) { setAccessDenied(true); return null; }
        return r.json();
      }).catch(() => null),
      fetch(`${api}/api/admin/users`, { headers: { Authorization: `Bearer ${user.token}` } }).then(async (r) => {
        if (r.status === 403) return [];
        return r.json();
      }).catch(() => []),
      fetch(`${api}/api/admin/landing-page`).then((r) => r.json()).catch(() => ({})),
      fetch(`${api}/api/careers/`).then((r) => r.json()).catch(() => []),
    ]).then(([s, u, l, c]) => {
      setStats(s);
      setUsers(Array.isArray(u) ? u : []);
      setLanding(l || {});
      setCareers(Array.isArray(c) ? c : []);
      setLoading(false);
    });
  }, [user]);

  if (!user) return <LockModal show={showLock} />;

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-500 mb-6">Halaman ini hanya untuk admin.</p>
          <a href="/dashboard" className="text-blue-600 hover:underline font-medium">← Kembali ke Dashboard</a>
        </div>
      </div>
    );
  }

  const updateLanding = async () => {
    await fetch(`${api}/api/admin/landing-page`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
      body: JSON.stringify(landing),
    });
    alert("Landing page updated!");
  };

  const tabs = [
    { id: "stats", label: "Statistik" },
    { id: "users", label: "User" },
    { id: "careers", label: "Karir" },
    { id: "landing", label: "Landing Page" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Admin</h1>
          <Badge variant="amber">Admin</Badge>
        </div>
        <a href="/" className="text-sm text-gray-500 hover:text-gray-700 font-medium">← ke Beranda</a>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                tab === t.id ? "bg-blue-600 text-white shadow-sm" : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingState skeleton="card" count={3} />
        ) : (
          <>
            {tab === "stats" && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <p className="text-gray-500 text-sm">Total User</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_users || 0}</p>
                </Card>
                <Card>
                  <p className="text-gray-500 text-sm">Selesai Discovery</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completed_discovery || 0}</p>
                </Card>
              </div>
            )}

            {tab === "users" && (
              <Card className="overflow-hidden !p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {["ID", "Email", "Nama", "Tanggal"].map((h) => (
                          <th key={h} className="text-left p-4 font-semibold text-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
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
              </Card>
            )}

            {tab === "careers" && (
              <div>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <input
                    value={aiHelp}
                    onChange={(e) => setAiHelp(e.target.value)}
                    placeholder="Nama karir baru..."
                    className="flex-1 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                  <Button
                    onClick={async () => {
                      if (!aiHelp) return;
                      await fetch(`${api}/api/admin/careers/generate`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
                        body: JSON.stringify({ title: aiHelp, category: "Umum", keywords: aiHelp }),
                      });
                      await fetch(`${api}/api/admin/careers`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
                        body: JSON.stringify({ title: aiHelp, category: "Umum" }),
                      });
                      alert(`Karir "${aiHelp}" berhasil ditambahkan!`);
                      setAiHelp("");
                      window.location.reload();
                    }}
                  >
                    + Tambah (Bantu AI)
                  </Button>
                </div>
                <Card className="overflow-hidden !p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {["ID", "Nama", "Kategori", "Prospek", "Risiko AI"].map((h) => (
                            <th key={h} className="text-left p-4 font-semibold text-gray-600">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {careers.map((c) => (
                          <tr key={c.id} className="border-t hover:bg-gray-50 transition">
                            <td className="p-4 text-gray-500">{c.id}</td>
                            <td className="p-4 font-medium text-gray-900">{c.title}</td>
                            <td className="p-4 text-gray-600">{c.category}</td>
                            <td className="p-4">
                              {c.market_prospect && (
                                <Badge
                                  variant={
                                    c.market_prospect === "Tinggi" ? "emerald" :
                                    c.market_prospect === "Sedang" ? "amber" : "red"
                                  }
                                >
                                  {c.market_prospect}
                                </Badge>
                              )}
                            </td>
                            <td className="p-4">
                              {c.ai_risk && (
                                <Badge
                                  variant={
                                    c.ai_risk === "Rendah" ? "emerald" :
                                    c.ai_risk === "Sedang" ? "amber" : "red"
                                  }
                                >
                                  {c.ai_risk}
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {tab === "landing" && (
              <Card padding="lg">
                <h2 className="font-bold text-xl text-gray-900 mb-6">Atur Landing Page</h2>
                {["hero_title", "hero_subtitle", "cta_text"].map((f) => (
                  <div key={f} className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f}</label>
                    <input
                      value={landing[f] || ""}
                      onChange={(e) => setLanding({ ...landing, [f]: e.target.value })}
                      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                  </div>
                ))}
                <Button onClick={updateLanding}>Simpan</Button>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
