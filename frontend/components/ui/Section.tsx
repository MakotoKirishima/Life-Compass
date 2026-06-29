import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  container?: boolean;
  dark?: boolean;
}

export default function Section({ children, className = "", container = true, dark = false }: SectionProps) {
  return (
    <section className={`py-16 md:py-20 ${dark ? "bg-gray-900 text-white" : "bg-transparent"} ${className}`}>
      {container ? (
        <div className="max-w-6xl mx-auto px-6">
          {children}
        </div>
      ) : children}
    </section>
  );
}
