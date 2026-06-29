import { useEffect, useState } from "react";
import Head from "next/head";
import LockModal from "../components/LockModal";
import PageShell from "../components/ui/PageShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ProgressSteps from "../components/ui/ProgressSteps";
import LoadingState from "../components/ui/LoadingState";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";

const DISCOVERY_STEPS = [
  { id: "stage", title: "Situasi Kamu", question: "Apa situasi kamu saat ini?", options: ["Pelajar", "Mahasiswa", "Fresh Graduate", "Sudah Bekerja", "Pindah Karir"] },
  { id: "interests", title: "Minat", question: "Apa yang kamu suka lakukan?", options: ["Meneliti", "Merancang", "Menulis", "Berhitung", "Berbicara", "Mengajar", "Melukis", "Memprogram", "Mengelola", "Menolong Orang", "Berjualan", "Memperbaiki", "Menganalisa", "Berkreasi", "Memimpin", "Bekerja dengan Data"] },
  { id: "work_values", title: "Nilai Kerja", question: "Apa yang paling penting dalam pekerjaan?", options: ["Gaji Tinggi", "Kreativitas", "Stabilitas", "Fleksibilitas Waktu", "Dampak Sosial", "Status/Prestise", "Otonomi", "Kerja Tim", "Jenjang Karir", "Work-Life Balance"] },
  { id: "skills", title: "Keahlian", question: "Skill apa yang kamu miliki?", options: ["Microsoft Office", "Desain Grafis", "Public Speaking", "Menulis", "Analisa Data", "Pemrograman", "Fotografi", "Bahasa Inggris", "Manajemen", "Excel/Spreadsheet", "Video Editing", "Social Media", "Penjualan", "Pelayanan Pelanggan", "Penelitian"] },
  { id: "constraints", title: "Kendala", question: "Apa kendala yang kamu hadapi?", options: ["Biaya Terbatas", "Harus Cepat Dapat Kerja", "Tekanan Orang Tua", "Lokasi Terbatas", "Pendidikan Terbatas", "Tidak Punya Pengalaman", "Waktu Terbatas", "Bingung Pilihan"] },
  { id: "work_preferences", title: "Preferensi Kerja", question: "Pilih yang paling cocok untukmu", options: ["Kerja Sendiri", "Kerja dalam Tim", "Rutin Terjadwal", "Variasi Tugas", "Kantor", "Remote/WFH", "Full-time", "Freelance/Part-time"] },
  { id: "reflection", title: "Refleksi", question: "Ceritakan sedikit tentang dirimu (opsional)", options: [] },
];

const TRIVIA = [
  "UI/UX Designer masuk 10 besar karir dengan pertumbuhan tercepat di Indonesia!",
  "PNS masih menjadi salah satu karir impian utama masyarakat Indonesia.",
  "Data Scientist adalah salah satu karir dengan gaji tertinggi untuk fresh graduate.",
  "Content Creator menjadi salah satu karir yang paling diminati Gen Z.",
  "Guru dan tenaga pendidik sangat dibutuhkan di daerah terpencil Indonesia.",
];

export default function Dashboard({ user, api, logout }) {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("");
  const [trivia, setTrivia] = useState("");
  const [error, setError] = useState("");
  const [showLock, setShowLock] = useState(false);

  useEffect(() => {
    if (!user) { setShowLock(true); setHistoryLoading(false); return; }
    fetch(`${api}/api/discovery/history`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [user]);

  useEffect(() => {
    if (step < DISCOVERY_STEPS.length) return;
    setLoading(true);
    setLoadingText("Mencocokkan minat...");
    const texts = ["Menganalisa skill...", "Membandingkan dengan 80+ karir...", "Menyusun rekomendasi..."];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 4000);
    setTrivia(TRIVIA[Math.floor(Math.random() * TRIVIA.length)]);

    const profile = {
      stage: answers.stage || "",
      education_level: answers.education_level || "",
      interests: answers.interests || [],
      work_values: answers.work_values || [],
      skills: answers.skills || [],
      constraints: answers.constraints || [],
      work_preferences: answers.work_preferences || [],
      reflection: answers.reflection || "",
    };

    fetch(`${api}/api/discovery/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
      body: JSON.stringify(profile),
    })
      .then((r) => r.json())
      .then((data) => {
        clearInterval(interval);
        setResult(data);
        setLoading(false);
      })
      .catch(() => {
        clearInterval(interval);
        setError("Gagal mendapat hasil. Coba lagi.");
        setLoading(false);
      });
  }, [step]);

  const toggleAnswer = (section, value) => {
    const current = answers[section] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setAnswers({ ...answers, [section]: next });
  };

  const handleRestart = () => {
    setStep(-1);
    setAnswers({});
    setResult(null);
    setError("");
  };

  if (!user) return <LockModal show={showLock} />;

  if (step === -1) {
    return (
      <>
        <Head>
          <title>Dashboard — Life Compass</title>
          <meta name="description" content="Mulai discovery karir dan dapatkan rekomendasi personal." />
        </Head>
        <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            Life Compass
          </h1>
          <div className="flex items-center gap-4">
            <a href="/experiments" className="text-gray-500 hover:text-gray-700 text-sm font-medium">Eksperimen</a>
            <a href="/faq" className="text-gray-500 hover:text-gray-700 text-sm font-medium">FAQ</a>
            <button onClick={logout} className="text-red-500 text-sm font-medium hover:text-red-600">Logout</button>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          {result ? (
            <div>
              <Card padding="lg" className="mb-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hasil Direction Snapshot</h2>
                    <p className="text-gray-500 text-sm mt-1">Berdasarkan jawabanmu</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRestart}>
                    Buat Ulang
                  </Button>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">{result.summary}</p>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-4">
                  <Badge variant="emerald">{result.top_recommendation.label}</Badge>
                  <h3 className="text-xl font-bold text-gray-900 mt-2 mb-1">{result.top_recommendation.career_title}</h3>
                  <p className="text-gray-600">{result.top_recommendation.reason}</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4">
                  <Badge variant="amber">{result.exploration.label}</Badge>
                  <h3 className="text-xl font-bold text-gray-900 mt-2 mb-1">{result.exploration.career_title}</h3>
                  <p className="text-gray-600">{result.exploration.reason}</p>
                </div>

                {result.risk_note && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-2">
                    <span className="text-red-500">⚠️</span>
                    <p className="text-sm text-red-700">{result.risk_note}</p>
                  </div>
                )}

                {(result.experiment_plan || []).length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-5 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Rencana Eksperimen 7 Hari</h4>
                    <div className="space-y-2">
                      {result.experiment_plan.map((task, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-medium">
                            {i + 1}
                          </span>
                          <span className="text-gray-700">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <a href={`/full-report?id=${result.match_id}`}>
                    <Button>Buka Laporan Lengkap</Button>
                  </a>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const url = `${window.location.origin}/result?id=${result.match_id}`;
                      navigator.clipboard?.writeText(url);
                      alert("Link hasil disalin!");
                    }}
                  >
                    Bagikan
                  </Button>
                </div>
              </Card>

              {history.length > 0 && (
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-4">Riwayat Hasil</h3>
                  <div className="space-y-2">
                    {history.map((h) => (
                      <a
                        key={h.match_id}
                        href={`/result?id=${h.match_id}`}
                        className="flex items-center justify-between text-sm text-gray-600 py-3 px-4 hover:bg-gray-50 rounded-xl transition"
                      >
                        <span className="font-medium text-gray-800">{h.top_result}</span>
                        <span className="text-gray-400">{h.created_at?.substring(0, 10)}</span>
                      </a>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Mulai Perjalanan Karirmu</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Jawab 7 pertanyaan sederhana (8-12 menit) dan dapatkan Direction Map-mu.
              </p>
              <Card padding="sm" className="max-w-md mx-auto mb-8 text-left bg-blue-50 border-blue-100">
                <p className="font-semibold text-gray-900 mb-3 text-sm">Kamu akan mendapatkan:</p>
                <ul className="space-y-2">
                  {[
                    "1 rekomendasi karir utama + penjelasan",
                    "1 karir alternatif untuk eksplorasi",
                    "Rencana eksperimen 7 hari konkret",
                    "Laporan lengkap gratis",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
              <Button size="lg" onClick={() => setStep(0)} className="shadow-lg shadow-blue-200">
                Mulai Discovery
              </Button>
            </div>
          )}
        </main>
      </div>
    </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
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
        <ErrorState message={error} onRetry={handleRestart} />
      </div>
    );
  }

  const currentStep = DISCOVERY_STEPS[step];
  const isMultiSelect = ["interests", "work_values", "skills", "constraints", "work_preferences"].includes(currentStep.id);
  const selected = answers[currentStep.id] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ProgressSteps current={step} total={DISCOVERY_STEPS.length} />

        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{currentStep.title}</h2>
          <p className="text-gray-500 mb-6">{currentStep.question}</p>

          {currentStep.id === "reflection" ? (
            <textarea
              value={answers.reflection || ""}
              onChange={(e) => setAnswers({ ...answers, reflection: e.target.value })}
              placeholder="Contoh: Aku lulusan SMK jurusan Multimedia. Aku suka desain tapi juga tertarik dengan programming. Orang tuaku ingin aku jadi PNS..."
              className="w-full border rounded-xl px-4 py-3 h-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
            />
          ) : isMultiSelect ? (
            <div className="grid grid-cols-2 gap-3">
              {currentStep.options.map((opt) => {
                const isSelected = selected.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleAnswer(currentStep.id, opt)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {currentStep.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAnswers({ ...answers, [currentStep.id]: opt })}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    answers[currentStep.id] === opt
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-sm">{opt}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              Kembali
            </Button>
            <Button
              onClick={() => setStep(step + 1)}
              disabled={isMultiSelect ? selected.length === 0 : currentStep.id === "reflection" ? false : !answers[currentStep.id]}
            >
              {step === DISCOVERY_STEPS.length - 1 ? "Lihat Hasil" : "Lanjut"}
            </Button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button onClick={handleRestart} className="text-gray-400 text-sm hover:text-gray-600 font-medium">
            Batalkan
          </button>
        </div>
      </div>
    </div>
  );
}
