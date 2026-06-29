import PageShell from "../components/ui/PageShell";
import Card from "../components/ui/Card";

export default function Disclaimer() {
  return (
    <PageShell title="Disclaimer" showBack backHref="/">
      <Card padding="lg">
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
      </Card>
    </PageShell>
  );
}
