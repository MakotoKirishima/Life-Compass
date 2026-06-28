export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4">
        <a href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Life Compass</a>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm border p-8 md:p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Kebijakan Privasi</h1>
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <div>
              <h2 className="font-semibold text-gray-900 text-lg mb-2">1. Data yang Dikumpulkan</h2>
              <p>Kami mengumpulkan email, nama, dan jawaban discovery yang diperlukan untuk memberikan layanan rekomendasi karir.</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg mb-2">2. Penggunaan Data</h2>
              <p>Data digunakan untuk menghasilkan rekomendasi karir dan meningkatkan layanan. Data tidak dijual ke pihak ketiga.</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg mb-2">3. Keamanan</h2>
              <p>Data disimpan dengan enkripsi. AI tidak dilatih dari data pengguna. Kami menggunakan JWT untuk autentikasi.</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg mb-2">4. Hak Pengguna</h2>
              <p>Kamu dapat menghapus akun dan data kapan saja melalui dashboard. Hubungi kami untuk permintaan data.</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg mb-2">5. Cookie</h2>
              <p>Kami menggunakan cookie untuk kebutuhan esensial, preferensi pengguna, analitik penggunaan, dan personalisasi pengalaman sesuai dengan pengaturan yang kamu pilih.</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg mb-2">6. Perubahan</h2>
              <p>Kebijakan ini dapat berubah sewaktu-waktu. Perubahan akan diinformasikan melalui website.</p>
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
