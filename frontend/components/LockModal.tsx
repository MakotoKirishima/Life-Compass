import { useRouter } from "next/router";

export default function LockModal({ show, feature }: { show: boolean; feature?: string }) {
  const router = useRouter();
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Masuk untuk membuka fitur ini</h2>
        <p className="text-gray-500 mb-6">
          {feature
            ? `Simpan ${feature.toLowerCase()}, lihat laporan lengkap, dan lanjutkan eksperimen kariermu setelah login.`
            : "Simpan hasil, lihat laporan lengkap, dan lanjutkan eksperimen kariermu setelah login."}
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition active:scale-[0.98]"
          >
            Masuk
          </button>
          <button
            onClick={() => router.push("/login")}
            className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition active:scale-[0.98]"
          >
            Daftar Gratis
          </button>
        </div>
      </div>
    </div>
  );
}
