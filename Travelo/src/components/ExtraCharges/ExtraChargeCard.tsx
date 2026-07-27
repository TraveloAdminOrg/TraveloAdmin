import { Pencil, Trash2 } from "lucide-react";
import type { ExtraChargeConfig } from "../../types/extraCharge";
import { formatCurrency, formatDate } from "../../lib/format";
import {
  EXTRA_CHARGE_CODES,
  EXTRA_CHARGE_LABELS,
} from "../../schemas/extraCharge.schema";

interface Props {
  config: ExtraChargeConfig;
  regionNameById?: Map<string, string>;
  onEdit: (c: ExtraChargeConfig) => void;
  onDelete: (c: ExtraChargeConfig) => void;
}

export default function ExtraChargeCard({
  config,
  regionNameById,
  onEdit,
  onDelete,
}: Props) {
  const regionObj = typeof config.region === "string" ? null : config.region;
  const regionId =
    typeof config.region === "string" ? config.region : config.region?._id;
  const regionCode = regionObj?.code ?? "";
  const regionName =
    regionObj?.country ??
    (regionId ? regionNameById?.get(regionId) : null) ??
    "—";

  const byCode = new Map(config.charges.map((c) => [c.code, c]));
  const activeCount = config.charges.filter(
    (c) => c.isActive && c.amount > 0,
  ).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs transition hover:shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 p-4 dark:border-gray-800">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold capitalize text-gray-800 dark:text-white/90">
              {regionName}
            </h3>
            {regionCode && (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                {regionCode}
              </span>
            )}
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {config.currency}
            </span>
            <span className="rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-medium text-success-700 dark:bg-success-500/10 dark:text-success-400">
              {activeCount} active
            </span>
          </div>
          {config.updatedAt && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Updated {formatDate(config.updatedAt)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(config)}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(config)}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10"
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Charge rows, always in the fixed vocabulary order */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {EXTRA_CHARGE_CODES.map((code) => {
          const entry = byCode.get(code);
          const enabled = !!entry?.isActive && (entry?.amount ?? 0) > 0;
          return (
            <div
              key={code}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {EXTRA_CHARGE_LABELS[code]}
                </p>
                {code === "pet_charge" && (
                  <span className="rounded-full bg-warning-50 px-2 py-0.5 text-[10px] font-medium text-warning-700 dark:bg-warning-500/10 dark:text-warning-400">
                    Auto at completion
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {entry ? formatCurrency(entry.amount, config.currency) : "—"}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    enabled
                      ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {enabled ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
