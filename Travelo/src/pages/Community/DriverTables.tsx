import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import DriverCard from "../../components/Drivers/DriverCard";
import { useDriversQuery } from "../../hooks/queries/useDrivers";
import { REGIONS, regionLabel, type RegionCode } from "../../lib/regions";
import { getErrorMessage } from "../../lib/error";

type RegionTab = "ALL" | RegionCode;
type StatusFilter = "all" | "approved" | "pending" | "blocked";

const REGION_TABS: { value: RegionTab; label: string }[] = [
  { value: "ALL", label: "All" },
  ...REGIONS.map((r) => ({ value: r.code, label: r.label })),
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending approval" },
  { value: "blocked", label: "Blocked" },
];

const DEFAULT_PAGE_SIZE = 10;

export default function DriverTables() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [activeRegion, setActiveRegion] = useState<RegionTab>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, error } = useDriversQuery({
    page,
    limit,
  });

  const drivers = data?.drivers ?? [];
  const meta = data?.meta;

  // Reset to page 1 when filters change.
  useEffect(() => {
    setPage(1);
  }, [activeRegion, statusFilter, search]);

  // Pull back if we're past the last page (e.g. after a filter).
  useEffect(() => {
    if (meta && page > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  // All filters here are client-side over the current page until the
  // backend supports `country`, `status`, and `q` query params.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return drivers.filter((d) => {
      if (activeRegion !== "ALL" && d.country !== activeRegion) return false;

      if (statusFilter === "approved" && !d.isApproved) return false;
      if (statusFilter === "pending" && d.isApproved) return false;
      if (statusFilter === "blocked" && !d.isBlocked) return false;

      if (q) {
        const haystack = [
          d.fullName,
          d.username,
          d.email,
          d.phone,
          d.city,
          d.idCardNumber,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [drivers, activeRegion, statusFilter, search]);

  const tabCount = (value: RegionTab) =>
    value === "ALL"
      ? drivers.length
      : drivers.filter((d) => d.country === value).length;

  return (
    <>
      <PageMeta
        title="Drivers | Travelo Admin"
        description="Browse, filter, and inspect driver accounts."
      />

      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Drivers
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {meta
            ? `${meta.total} driver${meta.total === 1 ? "" : "s"} across all regions.`
            : "Browse and manage driver accounts."}
        </p>
      </div>

      {/* Filters bar */}
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Filter by region"
          className="flex flex-wrap gap-1"
        >
          {REGION_TABS.map((t) => {
            const isActive = activeRegion === t.value;
            return (
              <button
                key={t.value}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveRegion(t.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                }`}
              >
                {t.label}
                <span
                  className={`ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {tabCount(t.value)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
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
              placeholder="Search name, email, phone, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner fullPage label="Loading drivers…" />
      ) : error ? (
        <EmptyState
          title="Failed to load drivers"
          description={getErrorMessage(error)}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={
            search || statusFilter !== "all"
              ? "No matches"
              : activeRegion === "ALL"
                ? "No drivers yet"
                : `No drivers in ${regionLabel(activeRegion as RegionCode)}`
          }
          description={
            search || statusFilter !== "all"
              ? "Try clearing your filters."
              : "Drivers will appear here as they sign up."
          }
        />
      ) : (
        <>
          <div
            className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
              isFetching ? "opacity-70 transition" : ""
            }`}
          >
            {filtered.map((d) => (
              <DriverCard key={d._id} driver={d} />
            ))}
          </div>

          {meta && meta.total > 0 && (
            <div className="mt-6">
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                limit={meta.limit}
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
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
