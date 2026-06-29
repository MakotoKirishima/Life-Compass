import { useState, useEffect } from "react";

const STORAGE_KEY = "lc_cookie_consent_v2";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true }));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 right-0 left-0 md:bottom-6 md:right-6 md:left-auto md:max-w-md z-50 bg-white rounded-t-2xl md:rounded-2xl shadow-2xl border p-6 m-0 md:m-4 animate-in slide-in-from-bottom-4 duration-300">
      <h3 className="font-bold text-gray-900 mb-2">Cookie & Data</h3>
      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
        Kami menggunakan cookie esensial untuk login, keamanan sesi, dan fungsi dasar aplikasi.
        Tidak ada cookie pelacakan atau iklan. Data tidak dibagikan dengan pihak ketiga.
      </p>
      <div className="flex flex-col md:flex-row gap-2">
        <button
          onClick={dismiss}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition active:scale-[0.98]"
        >
          Lanjutkan
        </button>
      </div>
      <a href="/privacy" className="text-xs text-blue-600 hover:underline mt-3 inline-block">
        Kebijakan Privasi
      </a>
    </div>
  );
}
