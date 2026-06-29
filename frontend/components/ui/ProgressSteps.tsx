interface ProgressStepsProps {
  current: number;
  total: number;
}

export default function ProgressSteps({ current, total }: ProgressStepsProps) {
  return (
    <div className="mb-6">
      <div className="flex gap-1 mb-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= current ? "bg-blue-500" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-sm text-gray-400">Langkah {current + 1} dari {total}</p>
    </div>
  );
}
