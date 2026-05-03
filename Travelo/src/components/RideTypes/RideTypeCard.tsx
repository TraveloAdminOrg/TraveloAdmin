import { Pencil, Trash2, Users } from "lucide-react";
import type { RideType } from "../../types/rideType";
import { regionLabel } from "../../lib/regions";

const FALLBACK_ICON = "/images/user/owner.jpg";

interface Props {
  rideType: RideType;
  onEdit: (rt: RideType) => void;
  onDelete: (rt: RideType) => void;
}

export default function RideTypeCard({ rideType, onEdit, onDelete }: Props) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs transition hover:shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800">
          <img
            src={rideType.icon || FALLBACK_ICON}
            alt={rideType.title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_ICON;
            }}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-base font-semibold capitalize text-gray-800 dark:text-white/90">
              {rideType.title}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                rideType.isActive
                  ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {rideType.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Users className="size-3.5" />
            {rideType.passengers}{" "}
            {rideType.passengers === 1 ? "passenger" : "passengers"}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {rideType.allowedRegions.map((code) => (
              <span
                key={code}
                className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                title={regionLabel(code)}
              >
                {code}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
        <button
          type="button"
          onClick={() => onEdit(rideType)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <Pencil className="size-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(rideType)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-error-500 transition hover:bg-error-50 dark:hover:bg-error-500/10"
        >
          <Trash2 className="size-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}
