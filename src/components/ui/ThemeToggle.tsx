import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.js";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  showLabel = false,
  size = "md",
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      id="theme-changer-btn"
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"
      } ${
        isDark
          ? "bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700 hover:border-slate-600 shadow-xs"
          : "bg-white hover:bg-slate-100 text-slate-700 hover:text-blue-600 border-slate-200/90 hover:border-slate-300 shadow-xs"
      } ${className}`}
    >
      <div className="relative flex items-center justify-center shrink-0">
        {isDark ? (
          <Sun className={size === "sm" ? "w-4 h-4 text-amber-400" : "w-4.5 h-4.5 text-amber-400"} />
        ) : (
          <Moon className={size === "sm" ? "w-4 h-4 text-slate-700" : "w-4.5 h-4.5 text-slate-700"} />
        )}
      </div>
      {showLabel && (
        <span className="font-semibold text-xs tracking-tight text-slate-700 dark:text-slate-200">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
};
