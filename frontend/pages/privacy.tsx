import PageShell from "../components/ui/PageShell";
import Card from "../components/ui/Card";

export default function Privacy() {
  return (
    <PageShell title="Kebijakan Privasi" showBack backHref="/">
      <Card padding="lg">
        <h1 className="text-3xl font-bold text-ink mb-8">Kebijakan Privasi</h1>
        <div className="space-y-6 text-ink/70 leading-relaxed">
          <div>
            <h2 className="font-bold text-ink text-lg mb-2">1. Data yang Dikumpulkan</h2>
            <p>Kami mengumpulkan email, nama, dan jawaban discovery yang diperlukan untuk memberikan layanan rekomendasi karir.</p>
          </div>
          <div>
            <h2 className="font-bold text-ink text-lg mb-2">2. Penggunaan Data</h2>
            <p>Data digunakan untuk menghasilkan rekomendasi karir dan meningkatkan layanan. Data tidak dijual ke pihak ketiga.</p>
          </div>
          <div>
            <h2 className="font-bold text-ink text-lg mb-2">3. Keamanan</h2>
            <p>Data disimpan dengan enkripsi. AI tidak dilatih dari data pengguna. Kami menggunakan JWT untuk autentikasi.</p>
          </div>
          <div>
            <h2 className="font-bold text-ink text-lg mb-2">4. Hak Pengguna</h2>
            <p>Kamu dapat menghapus akun dan data kapan saja melalui dashboard. Hubungi kami untuk permintaan data.</p>
          </div>
          <div>
            <h2 className="font-bold text-ink text-lg mb-2">5. Cookie</h2>
            <p>Kami menggunakan cookie untuk kebutuhan esensial, preferensi pengguna, analitik penggunaan, dan personalisasi pengalaman sesuai dengan pengaturan yang kamu pilih.</p>
          </div>
          <div>
            <h2 className="font-bold text-ink text-lg mb-2">6. Perubahan</h2>
            <p>Kebijakan ini dapat berubah sewaktu-waktu. Perubahan akan diinformasikan melalui website.</p>
          </div>
          <p className="text-sm text-ink/40 pt-4 border-t-2 border-ink/10">Terakhir diperbarui: Juni 2026</p>
        </div>
      </Card>
    </PageShell>
  );
}
