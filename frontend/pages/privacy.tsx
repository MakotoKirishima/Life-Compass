export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4"><a href="/" className="text-blue-600 font-bold text-xl">Life Compass</a></nav>
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Kebijakan Privasi</h1>
        <div className="prose text-gray-700 space-y-4">
          <p><strong>1. Data yang Dikumpulkan</strong><br/>Kami mengumpulkan email, nama, jawaban discovery, dan data pembayaran yang diperlukan untuk memberikan layanan.</p>
          <p><strong>2. Penggunaan Data</strong><br/>Data digunakan untuk menghasilkan rekomendasi karir, memproses pembayaran, dan meningkatkan layanan. Data tidak dijual ke pihak ketiga.</p>
          <p><strong>3. Keamanan</strong><br/>Data disimpan dengan enkripsi. AI tidak dilatih dari data pengguna. Kami menggunakan JWT untuk autentikasi.</p>
          <p><strong>4. Hak Pengguna</strong><br/>Kamu dapat menghapus akun dan data kapan saja melalui dashboard. Hubungi kami untuk permintaan data.</p>
          <p><strong>5. Cookie</strong><br/>Kami hanya menggunakan localStorage untuk token. Tidak ada cookie tracker dari pihak ketiga.</p>
          <p><strong>6. Perubahan</strong><br/>Kebijakan ini dapat berubah sewaktu-waktu. Perubahan akan diinformasikan melalui website.</p>
          <p className="text-sm text-gray-400 mt-8">Terakhir diperbarui: Juni 2026</p>
        </div>
        <a href="/" className="text-blue-600 hover:underline mt-8 inline-block">← Kembali ke Beranda</a>
      </main>
    </div>
  );
}
