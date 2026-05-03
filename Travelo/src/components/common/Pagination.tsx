import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  className?: string;
}

const DEFAULT_PAGE_SIZES = [10, 20, 50, 100];

/**
 * Build a list of page numbers with ellipses, e.g. [1, '…', 4, 5, 6, '…', 20].
 * Always shows: first, last, current, and ±1 around current.
 */
function getPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const range: (number | "…")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) range.push("…");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push("…");

  range.push(total);
  return range;
}

export default function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  isLoading = false,
  className = "",
}: PaginationProps) {
  if (total === 0) return null;

  const pages = getPageRange(page, totalPages);
  const start = (page - 1) * limit + 1;
  const end = Math.min(start + limit - 1, total);

  const goTo = (p: number) => {
    if (isLoading) return;
    if (p < 1 || p > totalPages || p === page) return;
    onPageChange(p);
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-gray-200 bg-white p-3 sm:gap-4 dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      {/* Count text — pushed left by mr-auto so the rest stays right-aligned. */}
      <p className="mr-auto text-xs text-gray-500 dark:text-gray-400">
        Showing{" "}
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {start}
        </span>
        –
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {end}
        </span>{" "}
        of{" "}
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {total}
        </span>
      </p>

      {/* Per-page selector */}
      {onLimitChange && (
        <label className="hidden items-center gap-2 text-xs text-gray-500 sm:flex dark:text-gray-400">
          Per page
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            disabled={isLoading}
            className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Page numbers */}
      <nav
        aria-label="Pagination"
        className="flex flex-wrap items-center justify-end gap-1"
      >
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={isLoading || page <= 1}
          aria-label="Previous page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <ChevronLeft className="size-4" />
        </button>

        {pages.map((p, idx) =>
          p === "…" ? (
            <span
              key={`gap-${idx}`}
              className="px-1 text-xs text-gray-400"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => goTo(p)}
              disabled={isLoading}
              aria-current={p === page ? "page" : undefined}
              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium transition disabled:cursor-not-allowed ${
                p === page
                  ? "bg-brand-500 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={isLoading || page >= totalPages}
          aria-label="Next page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <ChevronRight className="size-4" />
        </button>
      </nav>
    </div>
  );
}
