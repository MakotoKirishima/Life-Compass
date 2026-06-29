import { useEffect, useState } from "react";
import Head from "next/head";
import LockModal from "../components/LockModal";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import LoadingState from "../components/ui/LoadingState";
import PageShell from "../components/ui/PageShell";

export default function Admin({ user, api }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLock, setShowLock] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!user) { setShowLock(true); setLoading(false); return; }
    const token = user.token;
    Promise.all([
      fetch(`${api}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => {
        if (r.status === 403) throw new Error("forbidden");
        return r.json();
      }),
      fetch(`${api}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => {
        if (r.status === 403) throw new Error("forbidden");
        return r.json();
      }),
      fetch(`${api}/api/admin/settings`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => {
        if (r.status === 403) throw new Error("forbidden");
        return r.json();
      }),
    ])
      .then(([s, u, _]) => { setStats(s); setUsers(Array.isArray(u) ? u : []); setLoading(false); })
      .catch((err) => {
        if (err.message === "forbidden") setAccessDenied(true);
        setLoading(false);
      });
  }, [user]);

  if (!user) return <LockModal show={showLock} />;
  if (accessDenied) {
    return (
      <PageShell title="Admin">
        <Card className="text-center py-12">
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
      {loading ? (
        <LoadingState skeleton="card" count={2} />
      ) : (
        <div className="space-y-6">
          {stats && (
            <div className="grid grid-cols-2 gap-4">
              <Card padding="md" className="text-center">
                <div className="text-3xl font-bold text-ink">{stats.total_users || 0}</div>
                <div className="text-sm text-ink/60">Total Pengguna</div>
              </Card>
              <Card padding="md" className="text-center">
                <div className="text-3xl font-bold text-ink">{stats.completed_discovery || 0}</div>
                <div className="text-sm text-ink/60">Discovery Selesai</div>
              </Card>
            </div>
          )}

          <Card padding="lg">
            <h3 className="font-bold text-lg text-ink mb-4">Pengguna</h3>
            <div className="space-y-3">
              {users.slice(0, 10).map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b-2 border-ink/10 last:border-0">
                  <div>
                    <p className="font-semibold text-ink text-sm">{u.display_name || u.email}</p>
                    <p className="text-xs text-ink/50">{u.email}</p>
                  </div>
                  <span className="text-xs text-ink/50">{u.created_at}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
