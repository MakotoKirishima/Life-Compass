interface LoadingStateProps {
  text?: string;
  skeleton?: "card" | "text" | "list";
  count?: number;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-full mb-1" />
      <div className="h-4 bg-gray-200 rounded w-4/5" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
      ))}
    </div>
  );
}

export default function LoadingState({ text, skeleton = "card", count = 3 }: LoadingStateProps) {
  if (skeleton === "card") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }
  if (skeleton === "list") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }
  return <SkeletonText />;
}

export function Spinner() {
  return (
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  );
}

export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="text-center">
        <Spinner />
        <p className="text-gray-500 mt-4">Memuat...</p>
      </div>
    </div>
  );
}
