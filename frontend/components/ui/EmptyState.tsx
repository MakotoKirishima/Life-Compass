import { ReactNode } from "react";
import Card from "./Card";
import Button from "./Button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  children?: ReactNode;
}

export default function EmptyState({ icon = "📭", title, description, action, children }: EmptyStateProps) {
  return (
    <Card className="text-center py-12">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-ink mb-2">{title}</h3>
      {description && <p className="text-ink/60 mb-6 max-w-sm mx-auto">{description}</p>}
      {action && (
        <a href={action.href}>
          <Button>{action.label}</Button>
        </a>
      )}
      {children}
    </Card>
  );
}
