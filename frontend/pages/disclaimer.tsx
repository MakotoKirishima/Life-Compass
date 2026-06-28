export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4">
        <a href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Life Compass</a>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm border p-8 md:p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Disclaimer</h1>
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <div>
              <h2 className="font-semibold text-gray-900 text-lg mb-2">Alat Bantu, Bukan Konseling</h2>
              <p>Life Compass adalah alat bantu eksplorasi karir berbasis AI. Hasil yang diberikan bersifat informatif dan tidak dapat menggantikan konseling karir profesional dari psikolog atau konselor karir bersertifikat.</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg mb-2">Akurasi Data</h2>
              <p>Data karir diperoleh dari sumber umum dan dapat berubah. Kami tidak menjamin akurasi mutlak data gaji, prospek, atau persyaratan karir.</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg mb-2">Keputusan Pengguna</h2>
              <p>Keputusan karir sepenuhnya tanggung jawab pengguna. Life Compass tidak bertanggung jawab atas kerugian atau konsekuensi dari keputusan yang diambil berdasarkan rekomendasi kami.</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg mb-2">AI Generated</h2>
              <p>Beberapa konten dihasilkan oleh AI (Google Gemini). Verifikasi informasi penting dengan sumber resmi.</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg mb-2">Testimonial</h2>
              <p>Testimonial adalah opini pengguna dan bukan jaminan hasil. Hasil setiap pengguna dapat berbeda.</p>
            </div>
            <p className="text-sm text-gray-400 pt-4 border-t">Terakhir diperbarui: Juni 2026</p>
          </div>
          <a href="/" className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1 mt-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            Kembali ke Beranda
          </a>
        </div>
      </main>
    </div>
  );
}
