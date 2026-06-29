import { useState } from "react";
import Head from "next/head";
import PageShell from "../components/ui/PageShell";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const FAQS = [
  { q: "Apa itu Life Compass?", a: "Life Compass adalah alat bantu keputusan karir yang membantu kamu menemukan arah karir melalui discovery terstruktur, rekomendasi personal, dan rencana eksperimen 7 hari." },
  { q: "Apakah gratis?", a: "Ya! Life Compass 100% gratis. Semua fitur bisa diakses tanpa biaya." },
  { q: "Berapa lama prosesnya?", a: "Discovery Journey hanya butuh 8–12 menit. Setelah itu kamu langsung dapat hasilnya." },
  { q: "Data saya aman?", a: "Data kamu dienkripsi, tidak dijual ke pihak ketiga, dan AI tidak dilatih dari data kamu. Kamu bisa hapus akun kapan saja." },
  { q: "Apa bedanya dengan ChatGPT?", a: "Life Compass menggunakan discovery terstruktur 7 bagian + database karir Indonesia yang terus diperbarui. Hasilnya lebih akurat dan relevan untuk pasar Indonesia." },
  { q: "Bisa dipakai di HP?", a: "Bisa! Life Compass mobile-friendly dan bisa diakses dari browser HP mana pun." },
  { q: "Karirnya karir apa aja?", a: "27 karir dari 10 kategori: Teknologi, Kesehatan, Pendidikan, Pemerintahan, Kreatif, Bisnis, Teknik, Keuangan, Pariwisata, dan Pertanian." },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = FAQS.filter((f) => f.q.toLowerCase().includes(search.toLowerCase()));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: filtered.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <PageShell title="FAQ" showBack backHref="/" metaDescription="Pertanyaan umum seputar Life Compass — alat bantu keputusan karir gratis untuk pelajar dan pencari kerja Indonesia.">
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>
      <div className="text-center mb-10">
        <Badge variant="blue" className="mb-4">FAQ</Badge>
        <h1 className="text-3xl font-bold text-ink mb-2">Pertanyaan Umum</h1>
        <p className="text-ink/60">Cari jawaban seputar Life Compass</p>
      </div>

      <div className="relative mb-8">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari pertanyaan..."
          className="w-full border-2 border-ink/20 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-ink bg-warm text-sm"
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="text-center py-8 text-ink/60">
            Tidak ada pertanyaan yang cocok dengan pencarianmu.
          </Card>
        ) : (
          filtered.map((f, i) => (
            <Card key={i} padding="sm" className="!p-0 overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-6 py-4 font-semibold text-ink flex justify-between items-center hover:bg-warm transition gap-4"
              >
                <span>{f.q}</span>
                <svg
                  className={`w-4 h-4 text-ink/40 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-ink/70 leading-relaxed text-sm">{f.a}</div>
              )}
            </Card>
          ))
        )}
      </div>
    </PageShell>
  );
}
