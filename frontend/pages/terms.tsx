import PageShell from "../components/ui/PageShell";
import Card from "../components/ui/Card";

export default function Terms() {
  return (
    <PageShell title="Syarat Ketentuan" showBack backHref="/">
      <Card padding="lg">
        <h1 className="text-3xl font-bold text-ink mb-8">Syarat dan Ketentuan</h1>
        <div className="space-y-6 text-ink/70 leading-relaxed">
          <div>
            <h2 className="font-bold text-ink text-lg mb-2">1. Layanan</h2>
            <p>Life Compass adalah alat bantu keputusan karir. Hasil rekomendasi bersifat informatif dan bukan konseling profesional.</p>
          </div>
          <div>
            <h2 className="font-bold text-ink text-lg mb-2">2. Akun</h2>
            <p>Pengguna bertanggung jawab atas kerahasiaan akun. Satu akun untuk satu orang.</p>
          </div>
          <div>
            <h2 className="font-bold text-ink text-lg mb-2">3. Penggunaan Wajar</h2>
            <p>Dilarang menyalahgunakan sistem, melakukan scraping, atau menggunakan akun untuk tujuan ilegal.</p>
          </div>
          <div>
            <h2 className="font-bold text-ink text-lg mb-2">4. Batasan Tanggung Jawab</h2>
            <p>Life Compass tidak bertanggung jawab atas keputusan karir yang diambil berdasarkan rekomendasi. Konsultasikan dengan profesional untuk keputusan penting.</p>
          </div>
          <div>
            <h2 className="font-bold text-ink text-lg mb-2">5. Penghentian Layanan</h2>
            <p>Kami berhak menghentikan akses jika melanggar ketentuan. Kami akan memberikan pemberitahuan jika layanan akan dihentikan.</p>
          </div>
          <p className="text-sm text-ink/40 pt-4 border-t-2 border-ink/10">Terakhir diperbarui: Juni 2026</p>
        </div>
      </Card>
    </PageShell>
  );
}
