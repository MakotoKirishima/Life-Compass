interface ProgressStepsProps {
  current: number;
  total: number;
}

export default function ProgressSteps({ current, total }: ProgressStepsProps) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-2 rounded-full transition-all ${
            i <= current ? "bg-ink" : "bg-ink/10"
          }`}
        />
      ))}
      <span className="text-xs text-ink/50 font-medium ml-1">{current + 1}/{total}</span>
    </div>
  );
}
