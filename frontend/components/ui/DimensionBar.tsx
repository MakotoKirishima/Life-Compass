const DIMENSION_LABELS: Record<string, string> = {
  skill: "Skill",
  interest: "Minat",
  value: "Nilai Kerja",
  education: "Pendidikan",
  constraints: "Kendala",
  preference: "Preferensi",
  skills_alignment: "Skill",
  interest_resonance: "Minat",
  values_alignment: "Nilai",
  cognitive_fit: "Kognitif",
  education_alignment: "Pendidikan",
  constraint_impact: "Kendala",
  environment_fit: "Lingkungan",
  market_timing: "Pasar",
  trajectory_alignment: "Lintasan",
};

const DIMENSION_COLORS: Record<string, { bg: string; bar: string; text: string }> = {
  skill: { bg: "bg-blue-100", bar: "bg-blue-500", text: "text-blue-700" },
  interest: { bg: "bg-purple-100", bar: "bg-purple-500", text: "text-purple-700" },
  value: { bg: "bg-emerald-100", bar: "bg-emerald-500", text: "text-emerald-700" },
  education: { bg: "bg-amber-100", bar: "bg-amber-500", text: "text-amber-700" },
  constraints: { bg: "bg-red-100", bar: "bg-red-400", text: "text-red-700" },
  preference: { bg: "bg-cyan-100", bar: "bg-cyan-500", text: "text-cyan-700" },
  skills_alignment: { bg: "bg-blue-100", bar: "bg-blue-500", text: "text-blue-700" },
  interest_resonance: { bg: "bg-purple-100", bar: "bg-purple-500", text: "text-purple-700" },
  values_alignment: { bg: "bg-emerald-100", bar: "bg-emerald-500", text: "text-emerald-700" },
  cognitive_fit: { bg: "bg-pink-100", bar: "bg-pink-500", text: "text-pink-700" },
  education_alignment: { bg: "bg-amber-100", bar: "bg-amber-500", text: "text-amber-700" },
  constraint_impact: { bg: "bg-red-100", bar: "bg-red-400", text: "text-red-700" },
  environment_fit: { bg: "bg-cyan-100", bar: "bg-cyan-500", text: "text-cyan-700" },
  market_timing: { bg: "bg-orange-100", bar: "bg-orange-500", text: "text-orange-700" },
  trajectory_alignment: { bg: "bg-teal-100", bar: "bg-teal-500", text: "text-teal-700" },
};

export default function DimensionBar({ dimKey, value, maxScore = 100 }: { dimKey: string; value: number; maxScore?: number }) {
  const label = DIMENSION_LABELS[dimKey] || dimKey.replace(/_/g, " ");
  const colors = DIMENSION_COLORS[dimKey] || { bg: "bg-gray-100", bar: "bg-gray-400", text: "text-gray-700" };
  const pct = Math.min((value / maxScore) * 100, 100);

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 text-ink/60 shrink-0 font-medium text-right capitalize">{label}</span>
      <div className="flex-1 h-2.5 bg-ink/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${colors.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 shrink-0 font-bold text-right text-ink/70">{Math.round(value)}</span>
    </div>
  );
}
