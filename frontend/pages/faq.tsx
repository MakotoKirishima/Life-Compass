import { useState } from "react";

const FAQS = [
  { q: "Apa itu Life Compass?", a: "Life Compass adalah alat bantu keputusan karir yang membantu kamu menemukan arah karir melalui discovery terstruktur, rekomendasi personal, dan rencana eksperimen 7 hari." },
  { q: "Apakah gratis?", a: "Ya! Direction Snapshot (rekomendasi awal + rencana 7 hari) GRATIS. Kamu bisa upgrade ke Full Compass Report dengan Rp25.000 sekali bayar." },
  { q: "Berapa lama prosesnya?", a: "Discovery Journey hanya butuh 8-12 menit. Setelah itu kamu langsung dapat hasilnya." },
  { q: "Bagaimana cara bayar?", a: "Pembayaran melalui Mayar.id. Kamu bisa bayar pakai QRIS, Virtual Account, atau Transfer Bank. Rp25.000 sekali bayar, akses seumur hidup." },
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
        <a href="/" className="text-blue-600 font-bold text-xl">Life Compass</a>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Pertanyaan Umum (FAQ)</h1>
        <p className="text-gray-500 mb-8">Cari jawaban seputar Life Compass</p>

        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari pertanyaan..."
          className="w-full border rounded-xl px-4 py-3 mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <div className="space-y-3">
          {filtered.map((f, i) => (
            <div key={i} className="bg-white rounded-xl border overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-6 py-4 font-medium flex justify-between items-center hover:bg-gray-50"
              >
                {f.q}
                <span className={`transform transition ${open === i ? "rotate-180" : ""}`}>▼</span>
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-gray-600">{f.a}</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-blue-600 hover:underline">← Kembali ke Beranda</a>
        </div>
      </main>
    </div>
  );
}
