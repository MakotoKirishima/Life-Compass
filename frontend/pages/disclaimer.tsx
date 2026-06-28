export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4"><a href="/" className="text-blue-600 font-bold text-xl">Life Compass</a></nav>
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Disclaimer</h1>
        <div className="prose text-gray-700 space-y-4">
          <p><strong>Alat Bantu, Bukan Konseling</strong><br/>Life Compass adalah alat bantu eksplorasi karir berbasis AI. Hasil yang diberikan bersifat informatif dan tidak dapat menggantikan konseling karir profesional dari psikolog atau konselor karir bersertifikat.</p>
          <p><strong>Akurasi Data</strong><br/>Data karir diperoleh dari sumber umum dan dapat berubah. Kami tidak menjamin akurasi mutlak data gaji, prospek, atau persyaratan karir.</p>
          <p><strong>Keputusan Pengguna</strong><br/>Keputusan karir sepenuhnya tanggung jawab pengguna. Life Compass tidak bertanggung jawab atas kerugian atau konsekuensi dari keputusan yang diambil berdasarkan rekomendasi kami.</p>
          <p><strong>AI Generated</strong><br/>Beberapa konten dihasilkan oleh AI (Google Gemini). Verifikasi informasi penting dengan sumber resmi.</p>
          <p><strong>Testimonial</strong><br/>Testimonial adalah opini pengguna dan bukan jaminan hasil. Hasil setiap pengguna dapat berbeda.</p>
          <p className="text-sm text-gray-400 mt-8">Terakhir diperbarui: Juni 2026</p>
        </div>
        <a href="/" className="text-blue-600 hover:underline mt-8 inline-block">← Kembali ke Beranda</a>
      </main>
    </div>
  );
}
