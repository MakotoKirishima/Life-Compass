import { ReactNode } from "react";

type BadgeVariant = "coral" | "emerald" | "blue" | "amber" | "gray" | "ink";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  coral: "bg-primary-500 text-white",
  emerald: "bg-emerald-500 text-white",
  blue: "bg-blue-500 text-white",
  amber: "bg-amber-500 text-white",
  gray: "bg-gray-200 text-gray-700",
  ink: "bg-ink text-white",
};

export default function Badge({ children, variant = "gray", className = "" }: BadgeProps) {
  return (
    <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
