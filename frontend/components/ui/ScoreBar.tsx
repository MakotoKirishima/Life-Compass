const SCORE_COLORS = {
  "Cocok Tinggi": { bg: "bg-emerald-100", bar: "bg-emerald-500", text: "text-emerald-800" },
  "Cocok Sedang": { bg: "bg-blue-100", bar: "bg-blue-500", text: "text-blue-800" },
  "Coba Dulu": { bg: "bg-amber-100", bar: "bg-amber-500", text: "text-amber-800" },
  "Kurang Cocok": { bg: "bg-red-100", bar: "bg-red-400", text: "text-red-800" },
};

export default function ScoreBar({ score, label }: { score: number; label: string }) {
  const colors = SCORE_COLORS[label] || { bar: "bg-gray-400" };
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 bg-ink/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${colors.bar}`} style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
      <span className="text-xs font-bold text-ink/60 w-12 text-right">{score}%</span>
    </div>
  );
}
