import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import RideStatusBadge from "../../components/Rides/RideStatusBadge";
import { useRidesQuery } from "../../hooks/queries/useRides";
import { REGIONS, type RegionCode } from "../../lib/regions";
import { formatDateTime } from "../../lib/format";
import { getErrorMessage } from "../../lib/error";
import type { RideStatus } from "../../types/ride";

type RegionTab = "ALL" | RegionCode;

const STATUS_OPTIONS: { value: RideStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "requested", label: "Requested" },
  { value: "accepted", label: "Accepted" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No show" },
];

const DEFAULT_PAGE_SIZE = 10;

export default function RidesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [activeRegion, setActiveRegion] = useState<RegionTab>("ALL");
  const [status, setStatus] = useState<RideStatus | "all">("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, error } = useRidesQuery({
    page,
    limit,
    countryCode: activeRegion === "ALL" ? undefined : activeRegion,
    status: status === "all" ? undefined : status,
  });

  const rides = data?.rides ?? [];
  const meta = data?.meta;

  useEffect(() => {
    setPage(1);
  }, [activeRegion, status, search]);

  useEffect(() => {
    if (meta && page > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  const filtered = search.trim()
    ? rides.filter((r) => {
        const q = search.trim().toLowerCase();
        return [r._id, r.userName, r.driverName, r.pickup?.address, r.dropoff?.address]
          .filter(Boolean)
          .some((s) => (s as string).toLowerCase().includes(q));
      })
    : rides;

  return (
    <>
      <PageMeta
        title="Rides | Travelo Admin"
        description="Browse, filter, and inspect rides."
      />

      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Rides
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {meta
            ? `${meta.total} ride${meta.total === 1 ? "" : "s"} total.`
            : "All rides across regions and statuses."}
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1">
          {[
            { value: "ALL" as const, label: "All" },
            ...REGIONS.map((r) => ({ value: r.code, label: r.label })),
          ].map((t) => {
            const isActive = activeRegion === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setActiveRegion(t.value as RegionTab)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as RideStatus | "all")}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search ride / address / name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage label="Loading rides…" />
      ) : error ? (
        <EmptyState title="Failed to load rides" description={getErrorMessage(error)} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No rides found" description="Try clearing filters." />
      ) : (
        <>
          <div
            className={`overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 ${
              isFetching ? "opacity-70 transition" : ""
            }`}
          >
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500 dark:bg-white/[0.02] dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Ride</th>
                  <th className="px-4 py-3 font-medium">Rider</th>
                  <th className="px-4 py-3 font-medium">Driver</th>
                  <th className="px-4 py-3 font-medium">From → To</th>
                  <th className="px-4 py-3 text-right font-medium">Fare</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Requested</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r._id}
                    className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-600 dark:text-gray-300">
                      {r._id.slice(-8)}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white/90">
                      {r.userName ?? <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white/90">
                      {r.driverName ?? <span className="text-gray-400">—</span>}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                      <div className="truncate">{r.pickup?.address ?? "—"}</div>
                      <div className="truncate text-gray-400">↓ {r.dropoff?.address ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-800 dark:text-white/90">
                      {r.fare !== undefined
                        ? `${r.currency ?? ""} ${r.fare}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <RideStatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {r.requestedAt
                        ? formatDateTime(r.requestedAt)
                        : r.createdAt
                          ? formatDateTime(r.createdAt)
                          : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.total > 0 && (
            <div className="mt-6">
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                limit={meta.limit}
                onPageChange={setPage}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
                isLoading={isFetching}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
