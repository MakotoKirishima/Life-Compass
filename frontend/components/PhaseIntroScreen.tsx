import { motion } from "framer-motion";
import Button from "./ui/Button";

interface PhaseIntroScreenProps {
  phaseId: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  onStart: () => void;
}

interface PhaseCopy {
  icon: string;
  title: string;
  subtitle: string;
  narrative: string;
  estimate: string;
  questionCount: number;
}

const PHASE_COPY: Record<number, PhaseCopy> = {
  1: {
    icon: "🌱",
    title: "Bab 1: Menemukan Konteks",
    subtitle: "Di mana kamu berada saat ini?",
    narrative:
      "Perjalanan karir dimulai dengan kejujuran. Di bab ini, kami akan mengerti situasimu — tahap hidup, pendidikan, definisi sukses, dan realita waktu yang kamu miliki. Tidak ada jawaban salah, hanya data.",
    estimate: "5-8 menit",
    questionCount: 7,
  },
  2: {
    icon: "🧠",
    title: "Bab 2: Gaya Kerja & Kepribadian",
    subtitle: "Bagaimana kamu merespon ketidakpastian, tekanan, dan kolaborasi?",
    narrative:
      "Kami tidak akan memberi label kepribadian. Sebaliknya, kami akan mengamati pola pilihanmu dalam situasi nyata. Ini membantu kami mencari karir yang sesuai dengan ritme kognitifmu — bukan sebaliknya.",
    estimate: "6-8 menit",
    questionCount: 5,
  },
  3: {
    icon: "🛠️",
    title: "Bab 3: Memetakan Kekuatan",
    subtitle: "Memisahkan apa yang Anda KLAIM dari apa yang telah Anda BUKTIKAN.",
    narrative:
      "Di bab ini, kamu akan memilih skill dari pustaka yang tersedia. Kejujuran adalah kunci: skill yang 'pernah digunakan di dunia nyata' bebannya sangat berbeda dengan 'sedang dipelajari'. Kami juga akan menanyakan apa yang kamu benci — sama pentingnya dengan apa yang kamu suka.",
    estimate: "12-18 menit",
    questionCount: 4,
  },
  4: {
    icon: "🎯",
    title: "Bab 4: Minat & Ketertarikan",
    subtitle: "Peta multidimensi dari apa yang membuatmu penasaran.",
    narrative:
      "Minat bukan satu dimensi. Kami memetakannya dalam 3 sumbu: bidang (domain), aktivitas (apa yang kamu lakukan), dan masalah (mengapa kamu peduli). Semakin presisi, semakin akurat rekomendasi karir kami.",
    estimate: "6-9 menit",
    questionCount: 3,
  },
  5: {
    icon: "💎",
    title: "Bab 5: Nilai & Prioritas",
    subtitle: "Keputusan sulit mengungkap apa yang benar-benar penting.",
    narrative:
      "Di bab ini, kami akan menyajikan skenario trade-off. Gaji besar vs pekerjaan bermakna. Stabilitas vs otonomi. Expert vs generalis. Tidak ada jawaban benar — hanya prioritas. Tujuan kami: mencari karir yang selaras dengan hierarki nilaimu.",
    estimate: "4-6 menit",
    questionCount: 3,
  },
  6: {
    icon: "🚧",
    title: "Bab 6: Kendala & Realitas",
    subtitle: "Mengenali hambatan — dan kekuatan yang tersembunyi.",
    narrative:
      "Semua orang punya batasan. Uang, lokasi, waktu, tanggung jawab keluarga. Tapi constraint bukan vonis — ini adalah data untuk mencari jalur yang realistis. Jujurlah. Semakin jelas hambatanmu, semakin pintar rekomendasi kami.",
    estimate: "5-7 menit",
    questionCount: 3,
  },
  7: {
    icon: "🏢",
    title: "Bab 7: Lingkungan Kerja",
    subtitle: "Di lingkungan seperti apa kamu akan berkembang dan betah?",
    narrative:
      "Bab terakhir. Kamu sudah memberi tahu kami siapa dirimu. Sekarang, beri tahu kami di mana kamu ingin berada. Remote vs kantor. Startup vs korporat. Tim kecil vs besar. Cepat vs terukur. Ini adalah sentuhan akhir dari profilmu.",
    estimate: "4-6 menit",
    questionCount: 3,
  },
};

export default function PhaseIntroScreen({ phaseId, onStart }: PhaseIntroScreenProps) {
  const copy = PHASE_COPY[phaseId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-card rounded-2xl border-2 border-ink shadow-sm p-6 md:p-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
        className="text-center"
      >
        <span className="text-5xl block mb-5">{copy.icon}</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-ink text-center mb-2">
          {copy.title}
        </h2>
        <p className="text-primary-500 font-semibold text-sm text-center mb-6">
          {copy.subtitle}
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="text-ink/70 leading-relaxed text-sm md:text-base mb-6 text-center max-w-lg mx-auto"
      >
        {copy.narrative}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-3 mb-8 text-xs text-ink/50"
      >
        <span className="bg-warm px-3 py-1.5 rounded-full border border-ink/10">
          ⏱ {copy.estimate}
        </span>
        <span className="bg-warm px-3 py-1.5 rounded-full border border-ink/10">
          📝 {copy.questionCount} pertanyaan
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.3 }}
        className="text-center"
      >
        <Button onClick={onStart} size="lg" className="w-full sm:w-auto px-12">
          Mulai Bab Ini
        </Button>
      </motion.div>
    </motion.div>
  );
}
