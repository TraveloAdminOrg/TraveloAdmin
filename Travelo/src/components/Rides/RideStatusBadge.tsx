import type { RideStatus } from "../../types/ride";

const STATUS_TONE: Record<RideStatus, string> = {
  requested:
    "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400",
  accepted:
    "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
  in_progress:
    "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
  completed:
    "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400",
  cancelled:
    "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400",
  no_show:
    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

const STATUS_LABEL: Record<RideStatus, string> = {
  requested: "Requested",
  accepted: "Accepted",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
};

export default function RideStatusBadge({ status }: { status: RideStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_TONE[status] ?? STATUS_TONE.no_show}`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
