import Card from "./Card";
import Button from "./Button";

interface FeatureLockCardProps {
  icon?: string;
  title: string;
  description: string;
}

export default function FeatureLockCard({ icon = "🔒", title, description }: FeatureLockCardProps) {
  return (
    <Card className="text-center border-2 border-ink/20 border-dashed" padding="lg">
      <div className="text-3xl mb-3">{icon}</div>
      <div className="w-10 h-10 bg-ink/10 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg className="w-5 h-5 text-ink/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h4 className="font-bold text-ink mb-1">{title}</h4>
      <p className="text-sm text-ink/60 mb-4">{description}</p>
      <a href="/login">
        <Button size="sm" variant="outline">Masuk untuk membuka</Button>
      </a>
    </Card>
  );
}
