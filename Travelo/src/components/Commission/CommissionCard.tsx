import { Pencil, Percent, Trash2, Wallet } from "lucide-react";
import type {
  Commission,
  CommissionBookingType,
} from "../../types/commission";
import { formatDate } from "../../lib/format";
import { refId, refTitle } from "../../lib/refs";

interface Props {
  commission: Commission;
  rideTypeNames: Map<string, string>;
  regionNameById?: Map<string, string>;
  onEdit: (c: Commission) => void;
  onDelete: (c: Commission) => void;
}

const BOOKING_LABELS: Record<string, string> = {
  auto_accept: "Auto-accept",
  scheduled_ride: "Scheduled",
  bid_for_ride: "Bid",
};

const BOOKING_TONES: Record<string, string> = {
  auto_accept:
    "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
  scheduled_ride:
    "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400",
  bid_for_ride:
    "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400",
};

const bookingLabel = (b: CommissionBookingType): string =>
  BOOKING_LABELS[b as string] ??
  String(b)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const bookingTone = (b: CommissionBookingType): string =>
  BOOKING_TONES[b as string] ??
  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";

export default function CommissionCard({
  commission,
  rideTypeNames,
  regionNameById,
  onEdit,
  onDelete,
}: Props) {
  const regionObj =
    typeof commission.region === "string" ? null : commission.region;
  const regionId =
    typeof commission.region === "string"
      ? commission.region
      : commission.region?._id;
  const regionCode = regionObj?.code ?? "";
  const regionName =
    regionObj?.country ??
    (regionId ? regionNameById?.get(regionId) : null) ??
    "—";

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
              {commission.currency}
            </span>
            {commission.commissions.length > 0 && (
              <span className="rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-medium text-success-700 dark:bg-success-500/10 dark:text-success-400">
                {commission.commissions.length} rule
                {commission.commissions.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          {commission.updatedAt && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Last updated {formatDate(commission.updatedAt)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(commission)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(commission)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-error-500 transition hover:bg-error-50 dark:hover:bg-error-500/10"
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Commissions table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500 dark:bg-white/[0.02] dark:text-gray-400">
            <tr>
              <th className="px-4 py-2 font-medium">Ride type</th>
              <th className="px-4 py-2 font-medium">Booking</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 text-right font-medium">Commission</th>
            </tr>
          </thead>
          <tbody>
            {commission.commissions.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No commission rules configured.
                </td>
              </tr>
            ) : (
              commission.commissions.map((c, idx) => {
                const id = refId(c.rideType);
                const title = refTitle(c.rideType) ?? rideTypeNames.get(id);
                const isPct = c.commissionType === "percentage";
                return (
                  <tr
                    key={`${id}-${c.bookingType}-${idx}`}
                    className="border-t border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-4 py-2.5 font-medium capitalize text-gray-800 dark:text-white/90">
                      {title ?? (
                        <span className="text-gray-400 dark:text-gray-500">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${bookingTone(c.bookingType)}`}
                      >
                        {bookingLabel(c.bookingType)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                        {isPct ? (
                          <Percent className="size-3 text-gray-400" />
                        ) : (
                          <Wallet className="size-3 text-gray-400" />
                        )}
                        <span className="capitalize">
                          {c.commissionType}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      <span className="font-semibold text-gray-800 dark:text-white/90">
                        {isPct
                          ? `${c.commission}%`
                          : `${commission.currency} ${c.commission}`}
                      </span>
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
