import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-ink/90 active:scale-[0.97]",
  secondary: "bg-primary-500 text-white hover:bg-primary-500/90 active:scale-[0.97]",
  danger: "bg-red-500 text-white hover:bg-red-600 active:scale-[0.97]",
  outline: "border-2 border-ink text-ink hover:bg-ink/5 active:scale-[0.97]",
  ghost: "text-ink/70 hover:text-ink hover:bg-ink/5",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-1.5 text-xs rounded-xl",
  md: "px-6 py-2.5 text-sm rounded-xl",
  lg: "px-10 py-3.5 text-base rounded-xl",
};

export default function Button({
  variant = "primary", size = "md", loading, icon, children, disabled, className = "", ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : icon ? (
        <span className="w-4 h-4">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
