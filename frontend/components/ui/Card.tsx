import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
  border?: boolean;
  onClick?: () => void;
}

const paddings = {
  sm: "p-4",
  md: "p-5 md:p-6",
  lg: "p-6 md:p-8",
};

export default function Card({ children, className = "", hover = false, padding = "md", border = true, onClick }: CardProps) {
  return (
    <div
      className={`bg-card rounded-2xl ${border ? "border-2 border-ink shadow-sm" : "shadow-sm"} ${paddings[padding]} ${
        hover ? "hover:shadow-md hover:-translate-y-0.5 transition-all" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
