export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4">
        <a href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Life Compass</a>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm border p-8 md:p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Syarat dan Ketentuan</h1>
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <div>
              <h2 className="font-semibold text-gray-900 text-lg mb-2">1. Layanan</h2>
              <p>Life Compass adalah alat bantu keputusan karir. Hasil rekomendasi bersifat informatif dan bukan konseling profesional.</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg mb-2">2. Akun</h2>
              <p>Pengguna bertanggung jawab atas kerahasiaan akun. Satu akun untuk satu orang.</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg mb-2">3. Penggunaan Wajar</h2>
              <p>Dilarang menyalahgunakan sistem, melakukan scraping, atau menggunakan akun untuk tujuan ilegal.</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg mb-2">4. Batasan Tanggung Jawab</h2>
              <p>Life Compass tidak bertanggung jawab atas keputusan karir yang diambil berdasarkan rekomendasi. Konsultasikan dengan profesional untuk keputusan penting.</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg mb-2">5. Penghentian Layanan</h2>
              <p>Kami berhak menghentikan akses jika melanggar ketentuan. Kami akan memberikan pemberitahuan jika layanan akan dihentikan.</p>
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
