import Button from "../components/ui/Button";

export default function ErrorPage({ statusCode }: { statusCode?: number }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border-2 border-ink/10">
          🧭
        </div>
        <h1 className="text-2xl font-bold text-ink mb-2">
          {statusCode ? `Error ${statusCode}` : "Terjadi Kesalahan"}
        </h1>
        <p className="text-ink/60 mb-8">
          {statusCode === 404
            ? "Halaman tidak ditemukan."
            : "Maaf, terjadi kendala tak terduga. Silakan coba lagi."}
        </p>
        <div className="flex gap-3 justify-center">
          <a href="/">
            <Button>Kembali ke Beranda</Button>
          </a>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </div>
      </div>
    </div>
  );
}
