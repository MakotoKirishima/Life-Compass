import Card from "./Card";
import Button from "./Button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Card className="text-center py-12 border-2 border-primary-500">
      <div className="text-4xl mb-4">😥</div>
      <h3 className="text-lg font-bold text-ink mb-2">Terjadi Kesalahan</h3>
      <p className="text-ink/60 mb-6 max-w-sm mx-auto">{message}</p>
      {onRetry && <Button onClick={onRetry} variant="outline">Coba Lagi</Button>}
    </Card>
  );
}
