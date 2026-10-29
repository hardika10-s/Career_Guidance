import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "primary" | "success" | "warning" | "danger" | "purple" | "cyan";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  className = "",
  id,
  ...props
}) => {
  const variantClasses = {
    neutral: "bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700",
    primary: "bg-blue-50/90 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60",
    success: "bg-emerald-50/90 dark:bg-emerald-950/60 text-green-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800",
    warning: "bg-amber-50/90 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800",
    danger: "bg-rose-50/90 dark:bg-rose-950/60 text-red-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800",
    purple: "bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800",
    cyan: "bg-cyan-50/90 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  return (
    <span
      id={id}
      className={`inline-flex max-w-full items-center gap-1 rounded-lg border whitespace-normal break-words leading-snug transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
