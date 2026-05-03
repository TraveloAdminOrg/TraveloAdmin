import { ReactNode } from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  crumbs?: Crumb[];
  meta?: ReactNode; // Tabs, region selector, status badge etc.
}

export default function PageHeader({
  title,
  description,
  icon,
  actions,
  crumbs,
  meta,
}: PageHeaderProps) {
  return (
    <div className="mb-6 animate-fade-up">
      {crumbs && crumbs.length > 0 && (
        <nav className="mb-3 flex flex-wrap items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Link
            to="/"
            className="transition hover:text-brand-600 dark:hover:text-brand-400"
          >
            Home
          </Link>
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`} className="inline-flex items-center gap-1">
              <ChevronRight size={12} className="text-gray-300" />
              {c.to ? (
                <Link
                  to={c.to}
                  className="transition hover:text-brand-600 dark:hover:text-brand-400"
                >
                  {c.label}
                </Link>
              ) : (
                <span className="text-gray-700 dark:text-gray-300">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-brand-500/20 sm:flex">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold text-gray-900 dark:text-white/90 sm:text-2xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>

      {meta && <div className="mt-4">{meta}</div>}
    </div>
  );
}
