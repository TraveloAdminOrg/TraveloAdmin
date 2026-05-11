import type { RideStatus } from "../../types/ride";

// Known statuses get a tone; unknown ones fall through to the neutral default.
const STATUS_TONE: Record<string, string> = {
  pending:
    "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400",
  requested:
    "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400",
  accepted:
    "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
  arriving:
    "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
  arrived:
    "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
  in_progress:
    "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
  started:
    "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
  completed:
    "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400",
  cancelled:
    "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400",
  no_show: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

const DEFAULT_TONE =
  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";

// Turn snake_case into "Title case" so unfamiliar backend statuses still
// render cleanly without needing a code change.
const humanize = (status: string): string =>
  status
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

export default function RideStatusBadge({ status }: { status: RideStatus }) {
  const key = String(status).toLowerCase();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
        STATUS_TONE[key] ?? DEFAULT_TONE
      }`}
    >
      {humanize(key)}
    </span>
  );
}
