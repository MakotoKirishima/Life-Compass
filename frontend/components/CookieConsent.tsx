import { useState, useEffect } from "react";

const STORAGE_KEY = "lc_cookie_consent_v1";

const CATEGORIES = [
  { id: "essential", title: "Cookie Esensial & Keamanan", desc: "Diperlukan untuk login, keamanan sesi, pencegahan penyalahgunaan, dan fungsi dasar aplikasi.", required: true },
  { id: "preferences", title: "Preferensi Pengguna", desc: "Menyimpan pilihan tampilan, preferensi bahasa, dan pengaturan pengalaman.", required: false },
  { id: "analytics", title: "Analitik Penggunaan", desc: "Membantu kami memahami fitur mana yang digunakan agar Life Compass bisa ditingkatkan.", required: false },
  { id: "personalization", title: "Personalisasi Pengalaman", desc: "Membantu menyesuaikan rekomendasi dan tampilan berdasarkan interaksi pengguna.", required: false },
];

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [choices, setChoices] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setShow(true);
  }, []);

  const save = (ch: Record<string, boolean>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ch));
    setShow(false);
    setShowConfig(false);
  };

  const acceptAll = () => {
    const all: Record<string, boolean> = {};
    CATEGORIES.forEach(c => { all[c.id] = true; });
    save(all);
  };

  const denyOptional = () => {
    const essential: Record<string, boolean> = {};
    CATEGORIES.forEach(c => { essential[c.id] = c.required; });
    save(essential);
  };

  const saveConfig = () => {
    save(choices);
  };

  if (!show) return null;

  if (!showConfig) {
    return (
      <div className="fixed bottom-0 right-0 left-0 md:bottom-6 md:right-6 md:left-auto md:max-w-md z-50 bg-white rounded-2xl shadow-2xl border p-6 m-4 md:m-0">
        <h3 className="font-bold text-gray-900 mb-2">Pengaturan Cookie & Data</h3>
        <p className="text-sm text-gray-600 mb-4">Kami menggunakan cookie dan menyimpan sebagian data untuk menjalankan login, menjaga keamanan, menyimpan preferensi, memahami penggunaan fitur, dan meningkatkan pengalaman Life Compass.</p>
        <div className="flex flex-col md:flex-row gap-2">
          <button onClick={acceptAll} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">Terima Semua</button>
          <button onClick={() => {
            const def: Record<string, boolean> = {};
            CATEGORIES.forEach(c => { def[c.id] = c.required; });
            setChoices(def);
            setShowConfig(true);
          }} className="border-2 border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Atur</button>
          <button onClick={denyOptional} className="text-gray-500 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Tolak Opsional</button>
        </div>
        <a href="/privacy" className="text-xs text-blue-600 hover:underline mt-3 inline-block">Kebijakan Privasi</a>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-lg mb-4">Atur Preferensi Cookie</h3>
        <p className="text-sm text-gray-500 mb-4">Data yang dapat dikumpulkan mencakup informasi akun, hasil jawaban discovery, riwayat penggunaan fitur, preferensi, informasi perangkat/browser dasar, serta log keamanan.</p>
        <div className="space-y-4 mb-6">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <input type="checkbox" id={cat.id} checked={choices[cat.id] ?? cat.required} disabled={cat.required}
                onChange={() => setChoices(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <div>
                <label htmlFor={cat.id} className={`font-medium text-sm ${cat.required ? "text-gray-900" : "text-gray-700"}`}>{cat.title}</label>
                <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <button onClick={saveConfig} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">Simpan Pilihan</button>
          <button onClick={acceptAll} className="border-2 border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Terima Semua</button>
          <button onClick={denyOptional} className="text-gray-500 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Tolak Opsional</button>
        </div>
        <a href="/privacy" className="text-xs text-blue-600 hover:underline mt-3 inline-block">Kebijakan Privasi</a>
      </div>
    </div>
  );
}
