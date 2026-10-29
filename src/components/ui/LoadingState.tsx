import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingState: React.FC<{
  message?: string;
  subtext?: string;
  size?: "sm" | "md" | "lg";
}> = ({
  message = "Loading...",
  subtext,
  size = "md",
}) => {
  const spinnerSizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center p-5 sm:p-8 lg:p-12 text-center space-y-3">
      <Loader2 className={`${spinnerSizes[size]} animate-spin text-blue-600 dark:text-blue-400`} />
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{message}</p>
      {subtext && <p className="text-xs text-slate-400 max-w-sm">{subtext}</p>}
    </div>
  );
};
