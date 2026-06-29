import { useEffect, useState, useCallback } from "react";
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
import { safeFetch } from "../lib/fetch";

const DISCOVERY_STEPS = [
  { id: "stage", title: "Tahap Hidup", question: "Sekarang kamu ada di tahap mana?" },
  { id: "interests", title: "Minat", question: "Apa saja yang kamu minati?" },
  { id: "work_values", title: "Nilai Karir", question: "Apa yang paling penting dalam karirmu?" },
  { id: "skills", title: "Skill", question: "Skill apa yang sudah kamu miliki?" },
  { id: "constraints", title: "Keterbatasan", question: "Apa kendala yang kamu hadapi?" },
  { id: "work_preferences", title: "Preferensi", question: "Lingkungan kerja seperti apa yang kamu inginkan?" },
  { id: "reflection", title: "Refleksi", question: "Ceritakan sedikit tentang dirimu." },
];

const OPTIONS = {
  stage: ["Pelajar SMA/SMK", "Mahasiswa", "Fresh Graduate", "Karyawan Junior (< 2 tahun)", "Pencari Kerja", "Career Switcher"],
  interests: ["Teknologi", "Desain", "Kesehatan", "Pendidikan", "Bisnis", "Kreatif", "Teknik", "Keuangan", "Pariwisata", "Pertanian", "Pemerintahan", "Hukum"],
  work_values: ["Gaji Tinggi", "Stabilitas", "Kreativitas", "Fleksibilitas", "Dampak Sosial", "Work-Life Balance", "Jenjang Karir", "Kepemimpinan"],
  skills: ["Komunikasi", "Analisa", "Desain", "Programming", "Menulis", "Public Speaking", "Manajemen", "Riset", "Kerja Tim", "Bahasa Asing"],
  constraints: ["Tidak bisa kuliah", "Tidak bisa coding", "Takut matematika", "Butuh gaji cepat", "Terikat lokasi", "Tidak punya koneksi", "Usia", "Biaya terbatas"],
  work_preferences: ["Remote", "Hybrid", "Kantor", "Freelance", "Startup", "Perusahaan Besar", "Pemerintahan", "Wirausaha"],
};

const MULTI_SELECT_IDS = ["interests", "work_values", "skills", "constraints", "work_preferences"];

export default function Dashboard({ user, api, logout }) {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLock, setShowLock] = useState(false);
  const [loadingText, setLoadingText] = useState("AI sedang menganalisa jawabanmu...");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!user) { setShowLock(true); return; }
    setUserName(user.display_name || user.email?.split("@")[0] || "Pengguna");
    safeFetch<any[]>("/api/discovery/history", { token: user.token, baseUrl: api })
      .then((res) => { if (res.ok) setHistory(res.data || []); })
      .catch(() => {});
  }, [user]);

  const loadingMessages = [
    "AI sedang menganalisa jawabanmu dengan 80+ data karir Indonesia...",
    "Mencocokkan minat dengan karir yang sesuai...",
    "Menyusun rekomendasi personal untukmu...",
    "Hampir selesai! Menyiapkan rencana eksperimen...",
  ];

  const submitDiscovery = async () => {
    setLoading(true);
    setError("");
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[i]);
    }, 3000);
    try {
      const payload = { ...answers, stage: String(answers.stage || ""), reflection: String(answers.reflection || "") };
      const res = await safeFetch("/api/discovery/submit", {
        method: "POST", data: payload, token: user.token, baseUrl: api,
      });
      clearInterval(interval);
      if (res.ok) {
        setResult(res.data);
        setStep(DISCOVERY_STEPS.length);
      } else {
        setError(res.error || "Gagal mengirim data");
      }
    } catch {
      clearInterval(interval);
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    }
    setLoading(false);
  };

  const handleRestart = useCallback(() => {
    setStep(-1); setAnswers({}); setResult(null); setError("");
  }, []);

  if (!user) return <LockModal show={showLock} />;

  if (step === -1) {
    const latestResult = history.length > 0 ? history[0] : null;
    return (
      <>
        <Head>
          <title>Dashboard — Life Compass</title>
          <meta name="description" content="Mulai discovery karir dan dapatkan rekomendasi personal." />
        </Head>
        <div className="min-h-screen bg-warm">
          <nav className="bg-card border-b-2 border-ink px-6 py-4 flex items-center justify-between sticky top-0 z-40">
            <h1 className="text-xl font-bold text-ink">Life Compass</h1>
            <div className="flex items-center gap-4">
              <a href="/experiments" className="text-ink/60 hover:text-ink text-sm font-semibold">Eksperimen</a>
              <a href="/faq" className="text-ink/60 hover:text-ink text-sm font-semibold">FAQ</a>
              <button onClick={logout} className="text-primary-500 text-sm font-semibold hover:text-primary-600">Logout</button>
            </div>
          </nav>
          <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-ink">Halo, {userName} 👋</h2>
                  <p className="text-ink/60 mt-1">Siap melanjutkan perjalanan karirmu?</p>
                </div>
              </div>

              {latestResult && (
                <Card padding="md" className="bg-emerald-50 border-emerald-500 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <p className="font-bold text-ink">Hasil terakhirmu</p>
                      <p className="text-sm text-ink/70 mt-1">
                        {latestResult.top_result || "Lihat hasil discovery terbaru"}
                      </p>
                      <a href={`/result?id=${latestResult.match_id}`}>
                        <Button size="sm" variant="outline" className="mt-3">Lihat Hasil</Button>
                      </a>
                    </div>
                  </div>
                </Card>
              )}

              <Card padding="lg">
                <h3 className="font-bold text-ink text-lg mb-2">Mulai Discovery Baru</h3>
                <p className="text-ink/60 mb-6">
                  Jawab 7 pertanyaan tentang minat, skill, dan situasimu. Butuh waktu 8–12 menit.
                </p>
                <Button onClick={() => setStep(0)} size="lg" className="w-full sm:w-auto">
                  Mulai Discovery
                </Button>
              </Card>
            </div>

            {history.length > 0 && (
              <div>
                <h3 className="font-bold text-ink text-lg mb-4">Riwayat Discovery</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {history.slice(0, 4).map((item) => (
                    <Card key={item.match_id} padding="sm" hover>
                      <p className="font-semibold text-ink text-sm">{item.top_result || "Hasil Discovery"}</p>
                      <p className="text-xs text-ink/50 mt-1">{item.created_at}</p>
                      <a href={`/result?id=${item.match_id}`}>
                        <Button size="sm" variant="ghost" className="mt-2 !p-0 !text-ink/60 hover:!text-ink">Lihat →</Button>
                      </a>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Card padding="md" className="bg-ink/5 border-ink/20">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💬</span>
                <div className="flex-1">
                  <p className="font-bold text-ink">Butuh saran cepat?</p>
                  <p className="text-sm text-ink/60 mt-1">Tanya asisten Life Compass soal karir, jurusan, atau skill.</p>
                </div>
                <span className="text-xs bg-ink/10 text-ink/60 px-3 py-1 rounded-full font-semibold">Chat</span>
              </div>
            </Card>
          </main>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-14 h-14 border-4 border-ink/20 border-t-ink rounded-full animate-spin mx-auto mb-6" />
          <p className="text-lg font-bold text-ink mb-2">Menganalisa Jawabanmu</p>
          <p className="text-sm text-ink/60">{loadingText}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center">
        <ErrorState message={error} onRetry={handleRestart} />
      </div>
    );
  }

  if (step === DISCOVERY_STEPS.length) {
    return (
      <PageShell title="Hasil Discovery" showBack backHref="/dashboard">
        <Head><title>Hasil Discovery — Life Compass</title></Head>
        <div className="space-y-6">
          {result && (
            <>
              <Card padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-ink">Direction Snapshot</h2>
                  <Badge variant="ink">Hasil</Badge>
                </div>
                <p className="text-ink/70 mb-6 leading-relaxed">{result.summary}</p>

                <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-5 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="emerald">{result.top_recommendation.label}</Badge>
                    <span className="text-2xl font-bold text-emerald-700">{result.top_recommendation.score}%</span>
                  </div>
                  <h3 className="text-xl font-bold text-ink mb-1">{result.top_recommendation.career_title}</h3>
                  <p className="text-ink/60 text-sm">{result.top_recommendation.reason}</p>
                </div>

                <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-5 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="amber">{result.exploration.label}</Badge>
                    <span className="text-2xl font-bold text-amber-700">{result.exploration.score}%</span>
                  </div>
                  <h3 className="text-xl font-bold text-ink mb-1">{result.exploration.career_title}</h3>
                  <p className="text-ink/60 text-sm">{result.exploration.reason}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a href={`/result?id=${result.match_id}`}><Button>Lihat Detail</Button></a>
                  <Button variant="outline" onClick={handleRestart}>Discovery Baru</Button>
                </div>
              </Card>

              {(result.experiment_plan || []).length > 0 && (
                <Card padding="lg">
                  <h3 className="font-bold text-lg text-ink mb-3">Rencana Eksperimen 7 Hari</h3>
                  <div className="space-y-2">
                    {result.experiment_plan.slice(0, 5).map((task, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm bg-warm rounded-xl p-3 border border-ink/10">
                        <span className="bg-ink text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</span>
                        <span className="text-ink pt-0.5">{task}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </PageShell>
    );
  }

  const currentStep = DISCOVERY_STEPS[step];
  const isMultiSelect = MULTI_SELECT_IDS.includes(currentStep.id);
  const selected = (answers[currentStep.id] as string[]) || [];

  const handleSelect = (value: string) => {
    if (currentStep.id === "stage") {
      setAnswers((prev) => ({ ...prev, stage: value }));
    } else if (isMultiSelect) {
      setAnswers((prev) => ({
        ...prev,
        [currentStep.id]: selected.includes(value)
          ? selected.filter((s) => s !== value)
          : [...selected, value],
      }));
    }
  };

  return (
    <div className="min-h-screen bg-warm">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ProgressSteps current={step} total={DISCOVERY_STEPS.length} />

        <Card padding="lg">
          <h2 className="text-xl font-bold text-ink mb-2">{currentStep.title}</h2>
          <p className="text-ink/60 mb-6">{currentStep.question}</p>

          {currentStep.id === "reflection" ? (
            <textarea
              value={String(answers.reflection || "")}
              onChange={(e) => setAnswers({ ...answers, reflection: e.target.value })}
              placeholder="Contoh: Aku lulusan SMK jurusan Multimedia. Aku suka desain tapi juga tertarik dengan programming. Orang tuaku ingin aku jadi PNS..."
              className="w-full border-2 border-ink/20 rounded-xl px-4 py-3 h-40 focus:outline-none focus:border-ink text-sm bg-warm"
            />
          ) : isMultiSelect ? (
            <div className="grid grid-cols-2 gap-3">
              {(OPTIONS[currentStep.id] || []).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                    selected.includes(opt)
                      ? "bg-ink text-white border-ink"
                      : "bg-warm text-ink/70 border-ink/20 hover:border-ink/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {(OPTIONS[currentStep.id] || []).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                    String(answers.stage) === opt
                      ? "bg-ink text-white border-ink"
                      : "bg-warm text-ink/70 border-ink/20 hover:border-ink/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>Kembali</Button>
            )}
            <Button
              onClick={() => {
                if (step < DISCOVERY_STEPS.length - 1) setStep(step + 1);
                else submitDiscovery();
              }}
              disabled={currentStep.id === "reflection" ? false : isMultiSelect ? selected.length === 0 : !answers.stage}
              className="flex-1"
            >
              {step === DISCOVERY_STEPS.length - 1 ? "Lihat Hasil" : "Lanjut"}
            </Button>
          </div>
        </Card>

        <div className="mt-4 text-center">
          <button onClick={handleRestart} className="text-ink/40 text-sm hover:text-ink font-medium">
            Batalkan
          </button>
        </div>
      </div>
    </div>
  );
}
