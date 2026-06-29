import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
  border?: boolean;
}

const paddings = {
  sm: "p-4",
  md: "p-5 md:p-6",
  lg: "p-6 md:p-8",
};

export default function Card({ children, className = "", hover = false, padding = "md", border = true }: CardProps) {
  return (
    <div
      className={`bg-card rounded-2xl ${border ? "border-2 border-ink shadow-sm" : "shadow-sm"} ${paddings[padding]} ${
        hover ? "hover:shadow-md hover:-translate-y-0.5 transition-all" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
