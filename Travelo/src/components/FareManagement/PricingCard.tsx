import { Pencil, Trash2 } from "lucide-react";
import type { Pricing } from "../../types/pricing";
import { regionLabel } from "../../lib/regions";
import { formatDate } from "../../lib/format";

interface Props {
  pricing: Pricing;
  rideTypeNames: Map<string, string>; // rideType _id -> title
  onEdit: (p: Pricing) => void;
  onDelete: (p: Pricing) => void;
}

export default function PricingCard({
  pricing,
  rideTypeNames,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs transition hover:shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 p-4 dark:border-gray-800">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              {regionLabel(pricing.countryCode)}
            </h3>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              {pricing.countryCode}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {pricing.currency}
            </span>
          </div>
          {pricing.updatedAt && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Last updated {formatDate(pricing.updatedAt)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(pricing)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(pricing)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-error-500 transition hover:bg-error-50 dark:hover:bg-error-500/10"
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Ride types pricing table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500 dark:bg-white/[0.02] dark:text-gray-400">
            <tr>
              <th className="px-4 py-2 font-medium">Ride type</th>
              <th className="px-4 py-2 text-right font-medium">Base</th>
              <th className="px-4 py-2 text-right font-medium">Per km</th>
              <th className="px-4 py-2 text-right font-medium">Per min</th>
              <th className="px-4 py-2 text-right font-medium">Min fare</th>
              <th className="px-4 py-2 text-right font-medium">Cancel fee</th>
            </tr>
          </thead>
          <tbody>
            {pricing.rideTypes.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No ride types configured.
                </td>
              </tr>
            ) : (
              pricing.rideTypes.map((rt, idx) => {
                const title = rideTypeNames.get(rt.rideType);
                return (
                  <tr
                    key={`${rt.rideType}-${idx}`}
                    className="border-t border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-4 py-2.5 font-medium capitalize text-gray-800 dark:text-white/90">
                      {title ?? (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
                      {pricing.currency} {rt.baseFare}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
                      {pricing.currency} {rt.pricePerKm}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
                      {pricing.currency} {rt.pricePerMinute}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
                      {pricing.currency} {rt.minimumFare}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
                      {pricing.currency} {rt.cancellationFee}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
