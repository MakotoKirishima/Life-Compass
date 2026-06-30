import { useEffect, useState } from "react";
import Head from "next/head";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const CATEGORIES = [
  "Teknologi", "Kesehatan", "Pendidikan", "Pemerintahan",
  "Kreatif", "Bisnis", "Teknik", "Keuangan", "Pariwisata", "Pertanian",
];
const AI_RISK_LEVELS = ["Rendah", "Sedang", "Tinggi"];
const REMOTE_LEVELS = ["Rendah", "Sedang", "Tinggi"];

const RISK_COLORS: Record<string, "emerald" | "amber" | "coral" | "gray"> = {
  Rendah: "emerald", Sedang: "amber", Tinggi: "coral",
};
const REMOTE_COLORS: Record<string, "emerald" | "amber" | "coral" | "gray"> = {
  Rendah: "coral", Sedang: "amber", Tinggi: "emerald",
};

export default function CareersPage() {
  const [careers, setCareers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [aiRisk, setAiRisk] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    const qs = params.toString();
    fetch(`${API}/api/careers/${qs ? `?${qs}` : ""}`)
      .then((r) => r.json())
      .then((data) => { setCareers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category, search]);

  return (
    <>
      <Head>
        <title>Database Karir — Life Compass</title>
        <meta name="description" content="Jelajahi 27+ profil karir Indonesia dengan analisis AI displacement, prospek pasar, persyaratan pendidikan, dan gaji." />
      </Head>
      <div className="min-h-screen bg-warm">
        <nav className="bg-card border-b-2 border-ink px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <a href="/" className="text-xl font-bold text-ink">Life Compass</a>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-primary-500 text-sm font-semibold">Masuk</a>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-ink">Database Karir</h1>
            <p className="text-ink/60 mt-1">Jelajahi 27+ profil karir Indonesia. Data dikurasi dan diperbarui berkala.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari karir..."
              className="border-2 border-ink/20 rounded-xl px-4 py-2.5 text-sm bg-card focus:outline-none focus:border-ink w-48"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border-2 border-ink/20 rounded-xl px-4 py-2.5 text-sm bg-card focus:outline-none focus:border-ink"
            >
              <option value="">Semua Kategori</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map((i) => (
                <Card key={i} padding="md" className="animate-pulse">
                  <div className="h-4 bg-ink/10 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-ink/10 rounded w-full mb-2" />
                  <div className="h-3 bg-ink/10 rounded w-2/3" />
                </Card>
              ))}
            </div>
          ) : careers.length === 0 ? (
            <Card padding="lg" className="text-center py-12 border-2 border-ink/10">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-ink mb-2">Karir tidak ditemukan</h3>
              <p className="text-ink/60">Coba ubah filter atau kata kunci pencarian.</p>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {careers.map((c) => (
                <Card key={c.id} padding="md" className="border-2 border-ink/10 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-ink">{c.title}</h3>
                    <Badge variant={c.ai_risk === "Tinggi" ? "coral" : c.ai_risk === "Sedang" ? "amber" : "emerald"}>
                      AI: {c.ai_risk}
                    </Badge>
                  </div>
                  <p className="text-xs text-ink/50 mb-1">{c.category}{c.subcategories?.length ? ` · ${c.subcategories.slice(0, 2).join(", ")}` : ""}</p>
                  <p className="text-xs text-ink/60 leading-relaxed mb-3">{c.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="gray">{c.market_prospect}</Badge>
                    <Badge variant={REMOTE_COLORS[c.remote_availability] || "gray"}>Remote: {c.remote_availability}</Badge>
                    {c.ai_displacement_score != null && (
                      <Badge variant="gray">AI Score: {c.ai_displacement_score}/10</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink/50 border-t border-ink/10 pt-2">
                    <span>{c.education_paths?.slice(0, 2).join(" / ") || "—"}</span>
                    {c.salary_mid && <span>{c.salary_mid?.currency || "IDR"} {c.salary_mid?.min || "—"}-{c.salary_mid?.max || "—"}jt</span>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}