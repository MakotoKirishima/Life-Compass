const SCORE_COLORS = {
  "Cocok Tinggi": { bg: "bg-emerald-100", bar: "bg-emerald-500", text: "text-emerald-800" },
  "Cocok Sedang": { bg: "bg-blue-100", bar: "bg-blue-500", text: "text-blue-800" },
  "Coba Dulu": { bg: "bg-amber-100", bar: "bg-amber-500", text: "text-amber-800" },
  "Kurang Cocok": { bg: "bg-red-100", bar: "bg-red-400", text: "text-red-800" },
  "Strong Match — Start Now": { bg: "bg-emerald-100", bar: "bg-emerald-500", text: "text-emerald-800" },
  "Strong Match — Short Gap": { bg: "bg-blue-100", bar: "bg-blue-500", text: "text-blue-800" },
  "Good Match — Invest to Get There": { bg: "bg-amber-100", bar: "bg-amber-500", text: "text-amber-800" },
  "Conditional Match": { bg: "bg-orange-100", bar: "bg-orange-500", text: "text-orange-800" },
  "Moderate Match": { bg: "bg-purple-100", bar: "bg-purple-500", text: "text-purple-800" },
  "Aspirational — Map the Path": { bg: "bg-gray-100", bar: "bg-gray-400", text: "text-gray-600" },
  "Bridge Career": { bg: "bg-cyan-100", bar: "bg-cyan-500", text: "text-cyan-800" },
};

export default function ScoreBar({ score, label }: { score: number; label: string }) {
  const colors = SCORE_COLORS[label] || { bg: "bg-gray-100", bar: "bg-gray-400", text: "text-gray-600" };
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 bg-ink/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${colors.bar}`} style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
      <span className="text-xs font-bold text-ink/60 w-12 text-right">{score}%</span>
    </div>
  );
}
