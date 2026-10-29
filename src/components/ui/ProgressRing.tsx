import React from "react";

export interface ProgressRingProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  colorVariant?: "sky" | "blue" | "emerald" | "amber" | "indigo";
  id?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  score,
  size = 120,
  strokeWidth = 10,
  label = "Readiness",
  sublabel = "Estimate",
  colorVariant = "blue",
  id,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  const colorMap = {
    sky: "#2563eb",
    blue: "#2563eb",
    emerald: "#10b981",
    amber: "#f59e0b",
    indigo: "#4f46e5",
  };

  const strokeColor = colorMap[colorVariant] || "#2563eb";

  return (
    <div id={id} className="inline-flex flex-col items-center justify-center">
      {/* Circle Container - exactly size x size for precise optical centering */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 block"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-100 dark:text-slate-800"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Value and label strictly centered inside the circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
            {clampedScore}%
          </span>
          {label && (
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mt-1 leading-none">
              {label}
            </span>
          )}
        </div>
      </div>

      {/* Sublabel positioned cleanly below the circle */}
      {sublabel && (
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 font-medium text-center">
          {sublabel}
        </span>
      )}
    </div>
  );
};
