import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import type {
  Pricing,
  PricingRideType,
  WeeklyFareEntry,
} from "../../types/pricing";
import { formatDate } from "../../lib/format";

interface Props {
  pricing: Pricing;
  rideTypeNames: Map<string, string>; // rideType _id -> title
  regionNameById?: Map<string, string>; // region _id -> country name (fallback when region is just an id)
  onEdit: (p: Pricing) => void;
  onDelete: (p: Pricing) => void;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Defensive: rideType may be null if the underlying ride type was deleted.
const refId = (r: PricingRideType["rideType"] | null | undefined): string => {
  if (!r) return "";
  return typeof r === "string" ? r : r._id ?? "";
};

const refTitle = (
  r: PricingRideType["rideType"] | null | undefined,
): string | undefined => {
  if (!r || typeof r === "string") return undefined;
  return r.title;
};

// Fields that contribute to "is the week uniform" comparison.
const COMPARABLE_FIELDS: (keyof Omit<WeeklyFareEntry, "dayOfWeek">)[] = [
  "baseFare",
  "pricePerKm",
  "pricePerMinute",
  "minimumFare",
  "cancellationFee",
  "cleaningCharge",
  "waitingCharge",
  "surgeMultiplier",
];

// Returns null if all 7 days share identical fare values (so we can collapse
// the row to a single line); otherwise returns the seven entries sorted.
const collapseUniform = (
  week: WeeklyFareEntry[],
): WeeklyFareEntry | null => {
  if (week.length !== 7) return null;
  const sorted = [...week].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  const [first] = sorted;
  const uniform = sorted.every((d) =>
    COMPARABLE_FIELDS.every((k) => d[k] === first[k]),
  );
  return uniform ? first : null;
};

export default function PricingCard({
  pricing,
  rideTypeNames,
  regionNameById,
  onEdit,
  onDelete,
}: Props) {
  // Track which ride-type rows are expanded to show their per-day breakdown.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // `region` may be either the populated object or just an _id depending on
  // which endpoint produced it (GET populates, POST/PATCH return the id).
  const regionObj =
    typeof pricing.region === "string" ? null : pricing.region;
  const regionId =
    typeof pricing.region === "string" ? pricing.region : pricing.region?._id;
  const regionCode = regionObj?.code ?? "";
  const regionName =
    regionObj?.country ?? (regionId ? regionNameById?.get(regionId) : null) ?? "—";

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
              {pricing.currency}
            </span>
            {pricing.rideTypes.length > 0 && (
              <span className="rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-medium text-success-700 dark:bg-success-500/10 dark:text-success-400">
                {pricing.rideTypes.length} ride type
                {pricing.rideTypes.length === 1 ? "" : "s"}
              </span>
            )}
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
              <th className="px-4 py-2 font-medium">Day</th>
              <th className="px-4 py-2 text-right font-medium">Base</th>
              <th className="px-4 py-2 text-right font-medium">Per km</th>
              <th className="px-4 py-2 text-right font-medium">Per min</th>
              <th className="px-4 py-2 text-right font-medium">Min fare</th>
              <th className="px-4 py-2 text-right font-medium">Cancel</th>
              <th className="px-4 py-2 text-right font-medium">Cleaning</th>
              <th className="px-4 py-2 text-right font-medium">Waiting</th>
              <th className="px-4 py-2 text-right font-medium">Surge</th>
            </tr>
          </thead>
          <tbody>
            {pricing.rideTypes.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No ride types configured.
                </td>
              </tr>
            ) : (
              pricing.rideTypes.map((rt, idx) => {
                const id = refId(rt.rideType);
                const title =
                  refTitle(rt.rideType) ?? rideTypeNames.get(id);
                const uniform = collapseUniform(rt.weeklyFare ?? []);
                const isOpen = expanded[`${id}-${idx}`] ?? false;
                const week = [...(rt.weeklyFare ?? [])].sort(
                  (a, b) => a.dayOfWeek - b.dayOfWeek,
                );

                if (uniform) {
                  return (
                    <tr
                      key={`${id}-${idx}`}
                      className="border-t border-gray-100 dark:border-gray-800"
                    >
                      <td className="px-4 py-2.5 font-medium capitalize text-gray-800 dark:text-white/90">
                        {title ?? (
                          <span className="text-gray-400 dark:text-gray-500">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">
                        All days
                      </td>
                      <FareCells row={uniform} currency={pricing.currency} />
                    </tr>
                  );
                }

                return (
                  <Fragment key={`${id}-${idx}`}>
                    <tr
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
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded((p) => ({
                              ...p,
                              [`${id}-${idx}`]: !isOpen,
                            }))
                          }
                          className="inline-flex items-center gap-1 rounded-md text-[11px] font-medium text-brand-600 hover:underline dark:text-brand-400"
                        >
                          {isOpen ? (
                            <ChevronDown className="size-3" />
                          ) : (
                            <ChevronRight className="size-3" />
                          )}
                          Varies — {isOpen ? "hide" : "show"} 7 days
                        </button>
                      </td>
                      <td
                        colSpan={8}
                        className="px-4 py-2.5 text-right text-gray-500 dark:text-gray-400"
                      >
                        {/* Range hint so admins see the spread without expanding */}
                        Base {pricing.currency} {minMax(week, "baseFare")} ·
                        Per km {pricing.currency} {minMax(week, "pricePerKm")}
                      </td>
                    </tr>
                    {isOpen &&
                      week.map((d) => {
                        // Sun (0) and Sat (6) get a slight tint so weekends
                        // are easy to spot when scanning the breakdown.
                        const isWeekend = d.dayOfWeek === 0 || d.dayOfWeek === 6;
                        return (
                          <tr
                            key={`${id}-${idx}-${d.dayOfWeek}`}
                            className={`border-t border-dashed border-gray-100 dark:border-gray-800 ${
                              isWeekend
                                ? "bg-warning-50/40 dark:bg-warning-500/[0.04]"
                                : "bg-gray-50/40 dark:bg-white/[0.02]"
                            }`}
                          >
                            <td />
                            <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                              {DAY_LABELS[d.dayOfWeek]}
                              {isWeekend && (
                                <span className="ml-1 text-[9px] uppercase tracking-wide text-warning-600 dark:text-warning-400">
                                  wknd
                                </span>
                              )}
                            </td>
                            <FareCells row={d} currency={pricing.currency} />
                          </tr>
                        );
                      })}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FareCells({
  row,
  currency,
}: {
  row: WeeklyFareEntry;
  currency: string;
}) {
  return (
    <>
      <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
        {currency} {row.baseFare}
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
        {currency} {row.pricePerKm}
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
        {currency} {row.pricePerMinute}
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
        {currency} {row.minimumFare}
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
        {currency} {row.cancellationFee}
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
        {currency} {row.cleaningCharge}
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
        {currency} {row.waitingCharge}
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
        {row.surgeMultiplier}
        <span className="ml-0.5 text-[10px] text-gray-400">×</span>
      </td>
    </>
  );
}

function minMax(
  week: WeeklyFareEntry[],
  field: keyof Omit<WeeklyFareEntry, "dayOfWeek">,
): string {
  if (!week.length) return "—";
  const values = week.map((d) => d[field]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? `${min}` : `${min}–${max}`;
}
