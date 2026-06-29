import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

const paddings = {
  sm: "p-4",
  md: "p-5 md:p-6",
  lg: "p-6 md:p-8",
};

export default function Card({ children, className = "", hover = false, padding = "md" }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm ${paddings[padding]} ${
        hover ? "hover:shadow-md hover:border-gray-200 transition-all" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
