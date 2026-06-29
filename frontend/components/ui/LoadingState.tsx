interface LoadingStateProps {
  skeleton?: "card" | "text";
  count?: number;
  message?: string;
}

export default function LoadingState({ skeleton = "text", count = 1, message }: LoadingStateProps) {
  const items = Array.from({ length: count });

  if (skeleton === "card") {
    return (
      <div className="space-y-4">
        {items.map((_, i) => (
          <div key={i} className="bg-card border-2 border-ink/10 rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-ink/10 rounded w-1/3 mb-4" />
            <div className="h-3 bg-ink/10 rounded w-2/3 mb-2" />
            <div className="h-3 bg-ink/10 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 border-4 border-ink/20 border-t-ink rounded-full animate-spin mx-auto mb-4" />
      {message && <p className="text-ink/60 text-sm">{message}</p>}
    </div>
  );
}
