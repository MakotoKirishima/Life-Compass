import { useState } from "react";

const FAQS = [
  { q: "Apa itu Life Compass?", a: "Life Compass adalah alat bantu keputusan karir yang membantu kamu menemukan arah karir melalui discovery terstruktur, rekomendasi personal, dan rencana eksperimen 7 hari." },
  { q: "Apakah gratis?", a: "Ya! Life Compass 100% gratis. Semua fitur bisa diakses tanpa biaya." },
  { q: "Berapa lama prosesnya?", a: "Discovery Journey hanya butuh 8-12 menit. Setelah itu kamu langsung dapat hasilnya." },
  { q: "Data saya aman?", a: "Data kamu dienkripsi, tidak dijual ke pihak ketiga, dan AI tidak dilatih dari data kamu. Kamu bisa hapus akun kapan saja." },
  { q: "Apa bedanya dengan ChatGPT?", a: "Life Compass menggunakan discovery terstruktur 7 bagian + database 80+ karir Indonesia. Hasilnya lebih akurat dan relevan untuk pasar Indonesia." },
  { q: "Bisa dipakai di HP?", a: "Bisa! Life Compass mobile-friendly dan bisa diakses dari browser HP mana pun." },
  { q: "Karirnya karir apa aja?", a: "80+ karir dari 10 kategori: Teknologi, Kesehatan, Pendidikan, Pemerintahan, Kreatif, Bisnis, Teknik, Keuangan, Pariwisata, dan Pertanian." },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = FAQS.filter(f => f.q.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4">
        <a href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Life Compass</a>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pertanyaan Umum (FAQ)</h1>
          <p className="text-gray-500">Cari jawaban seputar Life Compass</p>
        </div>

        <div className="relative mb-8">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pertanyaan..."
            className="w-full border rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm"
          />
        </div>

        <div className="space-y-3">
          {filtered.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-6 py-4 font-medium text-gray-900 flex justify-between items-center hover:bg-gray-50 transition gap-4"
              >
                <span>{f.q}</span>
                <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-gray-600 leading-relaxed">{f.a}</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a href="/" className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            Kembali ke Beranda
          </a>
        </div>
      </main>
    </div>
  );
}
