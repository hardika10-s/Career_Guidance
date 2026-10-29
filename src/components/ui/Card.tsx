import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "bordered" | "highlight" | "glass";
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  hoverable = false,
  className = "",
  id,
  ...props
}) => {
  const variantClasses = {
    default:
      "bg-white dark:bg-slate-900 border border-slate-200/75 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_18px_rgba(15,23,42,0.02)]",
    subtle:
      "bg-slate-50/90 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70",
    bordered:
      "bg-transparent border border-slate-300/80 dark:border-slate-700/80",
    highlight:
      "bg-blue-50/70 dark:bg-blue-950/25 border border-blue-200/80 dark:border-blue-800/60 shadow-[0_2px_10px_rgba(37,99,235,0.06)]",
    glass:
      "bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/70 shadow-[0_4px_20px_rgba(15,23,42,0.04)]",
  };

  const hoverClass = hoverable
    ? "transition-all duration-200 ease-out hover:shadow-[0_8px_28px_rgba(15,23,42,0.08)] hover:border-slate-300/90 dark:hover:border-slate-700 hover:-translate-y-0.5 cursor-pointer"
    : "transition-colors duration-150";
  const defaultPadding = /(?:^|\s)p-(?:\d+(?:\.\d+)?|\[[^\]]+\])(?:\s|$)/.test(className)
    ? ""
    : "p-4 sm:p-5 md:p-6";

  return (
    <div
      id={id}
      className={`rounded-2xl ${defaultPadding} ${variantClasses[variant]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
