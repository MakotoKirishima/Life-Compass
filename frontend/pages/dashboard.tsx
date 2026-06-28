import { useEffect, useState } from "react";

const DISCOVERY_STEPS = [
  { id: "stage", title: "Situasi Kamu", question: "Apa situasi kamu saat ini?", options: ["Pelajar", "Mahasiswa", "Fresh Graduate", "Sudah Bekerja", "Pindah Karir"] },
  { id: "interests", title: "Minat", question: "Apa yang kamu suka lakukan?", options: ["Meneliti", "Merancang", "Menulis", "Berhitung", "Berbicara", "Mengajar", "Melukis", "Memprogram", "Mengelola", "Menolong Orang", "Berjualan", "Memperbaiki", "Menganalisa", "Berkreasi", "Memimpin", "Bekerja dengan Data"] },
  { id: "work_values", title: "Nilai Kerja", question: "Apa yang paling penting dalam pekerjaan?", options: ["Gaji Tinggi", "Kreativitas", "Stabilitas", "Fleksibilitas Waktu", "Dampak Sosial", "Status/Prestise", "Otonomi", "Kerja Tim", "Jenjang Karir", "Work-Life Balance"] },
  { id: "skills", title: "Keahlian", question: "Skill apa yang kamu miliki?", options: ["Microsoft Office", "Desain Grafis", "Public Speaking", "Menulis", "Analisa Data", "Pemrograman", "Fotografi", "Bahasa Inggris", "Manajemen", "Excel/Spreadsheet", "Video Editing", "Social Media", "Penjualan", "Pelayanan Pelanggan", "Penelitian"] },
  { id: "constraints", title: "Kendala", question: "Apa kendala yang kamu hadapi?", options: ["Biaya Terbatas", "Harus Cepat Dapat Kerja", "Tekanan Orang Tua", "Lokasi Terbatas", "Pendidikan Terbatas", "Tidak Punya Pengalaman", "Waktu Terbatas", "Bingung Pilihan"] },
  { id: "work_preferences", title: "Preferensi Kerja", question: "Pilih yang paling cocok untukmu", options: ["Kerja Sendiri", "Kerja dalam Tim", "Rutin Terjadwal", "Variasi Tugas", "Kantor", "Remote/WFH", "Full-time", "Freelance/Part-time"] },
  { id: "reflection", title: "Refleksi", question: "Ceritakan sedikit tentang dirimu (opsional)", options: [] },
];

export default function Dashboard({ user, api, logout }) {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingText, setLoadingText] = useState("");
  const [trivia, setTrivia] = useState("");
  const [error, setError] = useState("");

  const triviaList = [
    "UI/UX Designer masuk 10 besar karir dengan pertumbuhan tercepat di Indonesia!",
    "PNS masih menjadi salah satu karir impian utama masyarakat Indonesia.",
    "Data Scientist adalah salah satu karir dengan gaji tertinggi untuk fresh graduate.",
    "Content Creator menjadi salah satu karir yang paling diminati Gen Z.",
    "Guru dan tenaga pendidik sangat dibutuhkan di daerah terpencil Indonesia."
  ];

  useEffect(() => {
    if (!user) { window.location.href = "/login"; return; }
    fetch(`${api}/api/discovery/history`, {
      headers: { Authorization: `Bearer ${user.token}` },
    }).then(r => r.json()).then(setHistory).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (step >= DISCOVERY_STEPS.length) {
      setLoading(true);
      setLoadingText("Mencocokkan minat...");
      const texts = ["Menganalisa skill...", "Membandingkan dengan 80 karir...", "Menyusun rekomendasi..."];
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
      }, 4000);
      setTrivia(triviaList[Math.floor(Math.random() * triviaList.length)]);

      const profile = {
        stage: answers.stage || "",
        education_level: answers.education_level || "",
        interests: answers.interests || [],
        work_values: answers.work_values || [],
        skills: answers.skills || [],
        constraints: answers.constraints || [],
        work_preferences: answers.work_preferences || [],
      };

      fetch(`${api}/api/discovery/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(profile),
      })
        .then(r => r.json())
        .then(data => {
          clearInterval(interval);
          setResult(data);
          setLoading(false);
        })
        .catch(() => {
          clearInterval(interval);
          setError("Gagal mendapat hasil. Coba lagi.");
          setLoading(false);
        });
    }
  }, [step]);

  const toggleAnswer = (section, value) => {
    const current = answers[section] || [];
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    setAnswers({ ...answers, [section]: next });
  };

  const setSingleAnswer = (section, value) => {
    setAnswers({ ...answers, [section]: value });
  };

  const handleRestart = () => {
    setStep(-1);
    setAnswers({});
    setResult(null);
    setError("");
    window.location.href = "/dashboard";
  };

  if (!user) return null;

  if (step === -1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-700">Life Compass</h1>
          <div className="flex items-center gap-4">
            <a href="/experiments" className="text-gray-500 hover:text-gray-700 text-sm">Eksperimen</a>
            <a href="/faq" className="text-gray-500 hover:text-gray-700 text-sm">FAQ</a>
            <button onClick={logout} className="text-red-500 text-sm">Logout</button>
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-4 py-12">
          {result ? (
            <div>
              <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">Hasil Direction Snapshot</h2>
                  <button onClick={handleRestart} className="text-blue-600 text-sm hover:underline">Buat Ulang</button>
                </div>

                <p className="text-gray-700 mb-6">{result.summary}</p>

                <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-4">
                  <span className="inline-block bg-green-500 text-white text-xs px-3 py-1 rounded-full mb-2 font-medium">{result.top_recommendation.label}</span>
                  <h3 className="text-xl font-bold mb-1">{result.top_recommendation.career_title}</h3>
                  <p className="text-gray-600">{result.top_recommendation.reason}</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-4">
                  <span className="inline-block bg-yellow-500 text-white text-xs px-3 py-1 rounded-full mb-2 font-medium">{result.exploration.label}</span>
                  <h3 className="text-xl font-bold mb-1">{result.exploration.career_title}</h3>
                  <p className="text-gray-600">{result.exploration.reason}</p>
                </div>

                {result.risk_note && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <p className="font-medium text-red-700 text-sm">⚠️ {result.risk_note}</p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-5 mb-6">
                  <h4 className="font-semibold mb-3">Rencana Eksperimen 7 Hari</h4>
                  {result.experiment_plan && result.experiment_plan.map((task, i) => (
                    <div key={i} className="flex items-start gap-3 mb-2 text-sm">
                      <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-medium">{i + 1}</span>
                      <span className="text-gray-700">{task}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <a href={`/full-report?id=${result.match_id}`} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                    Buka Laporan Lengkap
                  </a>
                  <button onClick={() => {
                    const url = `${window.location.origin}/result?id=${result.match_id}`;
                    navigator.clipboard?.writeText(url);
                    alert("Link hasil disalin!");
                  }} className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm">Bagikan</button>
                </div>
              </div>

              {history.length > 0 && (
                <div className="bg-white rounded-xl border p-4">
                  <h3 className="font-semibold mb-3">Riwayat Hasil</h3>
                  {history.map((h) => (
                    <a key={h.match_id} href={`/result?id=${h.match_id}`} className="block text-sm text-gray-600 py-2 px-2 hover:bg-gray-50 rounded-lg transition">
                      {h.created_at?.substring(0, 10)} — {h.top_result}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-3">Mulai Perjalanan Karirmu</h2>
              <p className="text-gray-500 mb-8">Jawab 7 pertanyaan sederhana (8-12 menit) dan dapatkan Direction Map-mu.</p>
              <div className="bg-white rounded-xl border p-6 mb-6 text-left text-sm text-gray-600">
                <p className="font-medium text-gray-800 mb-2">Kamu akan mendapatkan:</p>
                <ul className="space-y-2">
                  <li>✅ 1 rekomendasi karir utama + penjelasan</li>
                  <li>✅ 1 karir alternatif untuk eksplorasi</li>
                  <li>✅ Rencana eksperimen 7 hari konkret</li>
                  <li>✅ Laporan lengkap gratis</li>
                </ul>
              </div>
              <button onClick={() => setStep(0)} className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg hover:bg-blue-700 transition font-medium shadow-lg">
                Mulai Discovery
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-lg font-medium text-gray-700 mb-2">{loadingText}</p>
          <p className="text-sm text-gray-400 mb-4">AI sedang menganalisa jawabanmu dengan 80+ data karir Indonesia</p>
          <p className="text-xs text-gray-400 italic">💡 {trivia}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={handleRestart} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Coba Lagi</button>
        </div>
      </div>
    );
  }

  const currentStep = DISCOVERY_STEPS[step];
  const isMultiSelect = ["interests", "work_values", "skills", "constraints", "work_preferences"].includes(currentStep.id);
  const selected = answers[currentStep.id] || [];

  if (currentStep.id === "reflection") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="flex gap-1 mb-2">
              {DISCOVERY_STEPS.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-blue-500" : "bg-gray-200"}`}></div>
              ))}
            </div>
            <p className="text-sm text-gray-400">Langkah {step + 1} dari {DISCOVERY_STEPS.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border p-6 md:p-8">
            <h2 className="text-xl font-bold mb-2">{currentStep.title}</h2>
            <p className="text-gray-500 mb-6">{currentStep.question}</p>
            <textarea
              value={answers.reflection || ""}
              onChange={(e) => setAnswers({ ...answers, reflection: e.target.value })}
              placeholder="Contoh: Aku lulusan SMK jurusan Multimedia. Aku suka desain tapi juga tertarik dengan programming. Orang tuaku ingin aku jadi PNS..."
              className="w-full border rounded-xl px-4 py-3 h-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(step - 1)} className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">Kembali</button>
              <button onClick={() => setStep(step + 1)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Lewati</button>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button onClick={handleRestart} className="text-gray-400 text-sm hover:text-gray-600">Batalkan</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex gap-1 mb-2">
            {DISCOVERY_STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-blue-500" : "bg-gray-200"}`}></div>
            ))}
          </div>
          <p className="text-sm text-gray-400">Langkah {step + 1} dari {DISCOVERY_STEPS.length}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border p-6 md:p-8">
          <h2 className="text-xl font-bold mb-2">{currentStep.title}</h2>
          <p className="text-gray-500 mb-6">{currentStep.question}</p>

          {isMultiSelect ? (
            <div className="grid grid-cols-2 gap-3">
              {currentStep.options.map((opt) => {
                const isSelected = selected.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleAnswer(currentStep.id, opt)}
                    className={`p-4 rounded-xl border-2 text-left transition ${
                      isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                      }`}>
                        {isSelected && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className="text-sm">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {currentStep.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSingleAnswer(currentStep.id, opt)}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    answers[currentStep.id] === opt ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(step - 1)}
              className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50"
            >
              Kembali
            </button>
            <button
              onClick={() => setStep(step + 1)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isMultiSelect ? selected.length === 0 : !answers[currentStep.id]}
            >
              {step === DISCOVERY_STEPS.length - 1 ? "Lihat Hasil" : "Lanjut"}
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button onClick={handleRestart} className="text-gray-400 text-sm hover:text-gray-600">Batalkan</button>
        </div>
      </div>
    </div>
  );
}
