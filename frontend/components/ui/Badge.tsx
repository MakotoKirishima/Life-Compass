import { ReactNode } from "react";

type BadgeVariant = "emerald" | "amber" | "blue" | "red" | "gray";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-blue-100 text-blue-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-600",
};

export default function Badge({ children, variant = "gray" }: BadgeProps) {
  return (
    <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
