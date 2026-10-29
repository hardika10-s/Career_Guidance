import React from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "./Button.js";

export const EmptyState: React.FC<{
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-5 sm:p-8 lg:p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button size="sm" variant="primary" onClick={onAction} className="mt-2">
          {actionText}
        </Button>
      )}
    </div>
  );
};
