import { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  variant?: "default" | "compact";
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  variant = "default",
}: EmptyStateProps) {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-gray-800 dark:bg-white/[0.02]">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-400 dark:bg-gray-800">
          {icon ?? <Inbox size={16} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </p>
          {description && (
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-dashed border-gray-200 bg-gradient-to-b from-white to-gray-50/40 px-6 py-12 text-center dark:border-gray-800 dark:from-gray-900 dark:to-gray-900/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-200/40 to-transparent dark:via-brand-500/20" />
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
        <div className="text-gray-400 dark:text-gray-500">
          {icon ?? <Inbox size={22} />}
        </div>
      </div>
      <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h3>
      {description && (
        <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
