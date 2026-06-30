import { useEffect, useState } from "react";
import Head from "next/head";
import LockModal from "../components/LockModal";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import LoadingState from "../components/ui/LoadingState";
import EmptyState from "../components/ui/EmptyState";
import PageShell from "../components/ui/PageShell";
import { safeFetch } from "../lib/fetch";

export default function Admin({ user, api }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [careers, setCareers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLock, setShowLock] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    if (!user) { setShowLock(true); setLoading(false); return; }
    const token = user.token;
    Promise.all([
      safeFetch("/api/admin/stats", { token, baseUrl: api }),
      safeFetch("/api/admin/users", { token, baseUrl: api }),
      safeFetch("/api/admin/careers", { token, baseUrl: api }),
      safeFetch("/api/admin/settings", { token, baseUrl: api }),
    ])
      .then(([s, u, c, se]) => {
        if (!s.ok) { setAccessDenied(true); return; }
        setStats(s.data);
        setUsers(Array.isArray(u.data) ? u.data : []);
        setCareers(Array.isArray(c.data) ? c.data : []);
        setSettings(se.data);
        setLoading(false);
      })
      .catch(() => { setAccessDenied(true); setLoading(false); });
  }, [user]);

  if (!user) return <LockModal show={showLock} />;
  if (accessDenied) {
    return (
      <PageShell title="Admin">
        <Card className="text-center py-12 border-2 border-ink/10">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-bold text-ink mb-2">Akses Ditolak</h3>
          <p className="text-ink/60 mb-6">Halaman ini hanya untuk admin.</p>
          <a href="/dashboard"><Button>Kembali ke Dashboard</Button></a>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell title="Admin" showBack backHref="/dashboard">
      <Head><title>Admin — Life Compass</title><meta name="robots" content="noindex" /></Head>
      <h2 className="text-2xl font-bold text-ink mb-6">Panel Admin</h2>

      {/* Tab navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["dashboard", "careers", "users", "settings"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? "bg-ink text-white" : "bg-ink/5 text-ink/60 hover:bg-ink/10"}`}>
            {t === "dashboard" ? "Dashboard" : t === "careers" ? "Karir" : t === "users" ? "Pengguna" : "Pengaturan"}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState skeleton="card" count={2} />
      ) : (
        <>
          {/* Dashboard Tab */}
          {tab === "dashboard" && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card padding="md" className="text-center border-2 border-ink/10">
                  <div className="text-3xl font-bold text-ink">{stats.total_users || 0}</div>
                  <div className="text-sm text-ink/60">Total Pengguna</div>
                </Card>
                <Card padding="md" className="text-center border-2 border-ink/10">
                  <div className="text-3xl font-bold text-ink">{stats.completed_discovery || 0}</div>
                  <div className="text-sm text-ink/60">Discovery Selesai</div>
                </Card>
              </div>
              {settings && (
                <Card padding="md" className="border-2 border-ink/10">
                  <h3 className="font-bold text-ink mb-2">Sistem</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-ink/50">AI Provider:</span> <span className="font-semibold">{settings.ai_provider || "none"}</span></div>
                    <div><span className="text-ink/50">AI Available:</span> <span className={`font-semibold ${settings.ai_available ? "text-emerald-600" : "text-red-500"}`}>{settings.ai_available ? "Ya" : "Tidak"}</span></div>
                    <div><span className="text-ink/50">Data Version:</span> <span className="font-semibold">{settings.career_data_version}</span></div>
                    <div><span className="text-ink/50">R2 Backup:</span> <span className={`font-semibold ${settings.r2_backup_enabled ? "text-emerald-600" : "text-ink/40"}`}>{settings.r2_backup_enabled ? "Aktif" : "Nonaktif"}</span></div>
                  </div>
                  {settings.announcement && (
                    <div className="mt-3 text-sm bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                      <span className="font-semibold text-amber-800">Pengumuman:</span> {settings.announcement}
                    </div>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* Careers Tab */}
          {tab === "careers" && (
            <div className="space-y-4">
              {careers.length === 0 ? (
                <EmptyState icon="💼" title="Belum ada data karir" description="Karir akan muncul setelah di-seed atau ditambahkan via API." />
              ) : (
                careers.map((c) => (
                  <Card key={c.id} padding="sm" className="border-2 border-ink/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-ink">{c.title}</h4>
                          <Badge variant={c.status === "published" ? "emerald" : "gray"}>{c.status}</Badge>
                        </div>
                        <p className="text-xs text-ink/50 mt-0.5">{c.category}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-ink/40">
                        <span>{c.market_prospect}</span>
                        <span>{c.ai_risk}</span>
                      </div>
                    </div>
                    <p className="text-xs text-ink/60 mt-2">{c.description}</p>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Users Tab */}
          {tab === "users" && (
            <Card padding="lg" className="border-2 border-ink/10">
              <h3 className="font-bold text-lg text-ink mb-4">Pengguna</h3>
              {users.length === 0 ? (
                <EmptyState icon="👤" title="Belum ada pengguna" />
              ) : (
                <div className="space-y-3">
                  {users.slice(0, 20).map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-2 border-b-2 border-ink/10 last:border-0">
                      <div>
                        <p className="font-semibold text-ink text-sm">{u.display_name || u.email}</p>
                        <p className="text-xs text-ink/50">{u.email}</p>
                      </div>
                      <span className="text-xs text-ink/50">{u.created_at ? new Date(u.created_at).toLocaleDateString("id-ID") : ""}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Settings Tab */}
          {tab === "settings" && settings && (
            <Card padding="lg" className="border-2 border-ink/10">
              <h3 className="font-bold text-lg text-ink mb-4">Pengaturan Sistem</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-ink/10">
                  <span className="text-ink/60">AI Provider Aktif</span>
                  <span className="font-semibold">{settings.ai_provider || "Tidak ada"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-ink/10">
                  <span className="text-ink/60">Gemini API Key</span>
                  <span className={`font-semibold ${settings.gemini_key_set ? "text-emerald-600" : "text-ink/40"}`}>{settings.gemini_key_set ? "✓ Terpasang" : "—"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-ink/10">
                  <span className="text-ink/60">Versi Data Karir</span>
                  <span className="font-semibold">{settings.career_data_version}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-ink/60">R2 Backup</span>
                  <span className={`font-semibold ${settings.r2_backup_enabled ? "text-emerald-600" : "text-ink/40"}`}>{settings.r2_backup_enabled ? "Aktif" : "Nonaktif"}</span>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </PageShell>
  );
}
