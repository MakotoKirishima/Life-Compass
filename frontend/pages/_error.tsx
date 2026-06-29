import Button from "../components/ui/Button";

export default function ErrorPage({ statusCode }: { statusCode?: number }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          🧭
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {statusCode ? `Error ${statusCode}` : "Terjadi Kesalahan"}
        </h1>
        <p className="text-gray-500 mb-8">
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
