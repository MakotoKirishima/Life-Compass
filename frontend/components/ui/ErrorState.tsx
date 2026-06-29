import Button from "./Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  fullPage?: boolean;
}

export default function ErrorState({
  message = "Terjadi kendala saat memproses permintaanmu. Coba ulangi beberapa saat lagi atau sederhanakan pertanyaanmu.",
  onRetry,
  fullPage = false,
}: ErrorStateProps) {
  const content = (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Yah, ada yang error</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{message}</p>
      {onRetry && <Button onClick={onRetry} variant="secondary">Coba Lagi</Button>}
    </div>
  );

  if (fullPage) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">{content}</div>;
  }

  return content;
}
