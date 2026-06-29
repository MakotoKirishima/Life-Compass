import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  container?: boolean;
  dark?: boolean;
  warm?: boolean;
}

export default function Section({ children, className = "", container = true, dark = false, warm = false }: SectionProps) {
  return (
    <section className={`py-16 md:py-20 ${dark ? "bg-ink text-white" : warm ? "bg-warm" : "bg-warm"} ${className}`}>
      {container ? (
        <div className="max-w-6xl mx-auto px-6">
          {children}
        </div>
      ) : children}
    </section>
  );
}
