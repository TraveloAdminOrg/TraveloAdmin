import { useEffect, useState } from "react";
import { Eye, Search } from "lucide-react";
import RideDetailsModal from "../../components/Rides/RideDetailsModal";
import PageMeta from "../../components/common/PageMeta";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import RideStatusBadge from "../../components/Rides/RideStatusBadge";
import { useRidesQuery } from "../../hooks/queries/useRides";
import { REGIONS, regionLabel, type RegionCode } from "../../lib/regions";
import { formatDateTime } from "../../lib/format";
import { getErrorMessage } from "../../lib/error";
import type {
  Ride,
  RideGeoPoint,
  RidePerson,
  RideRideTypeRef,
  RideStatus,
} from "../../types/ride";

type RegionTab = "ALL" | RegionCode;

// Statuses we know about. Anything else from the backend (e.g. "pending",
// "arriving") will still render via RideStatusBadge's fallback handling, but
// the dropdown lists the common ones admins want to filter by.
const STATUS_OPTIONS: { value: RideStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const DEFAULT_PAGE_SIZE = 10;

// Read a populated user/driver object, returning a display name + a stable id
// regardless of whether the API returned the full object or just an id.
const personName = (p: Ride["userId"] | Ride["driverId"]): string => {
  if (!p) return "—";
  if (typeof p === "string") return p.slice(-8);
  return p.fullName || p.username || p.email || p._id.slice(-8) || "—";
};

const personId = (p: Ride["userId"] | Ride["driverId"]): string | undefined => {
  if (!p) return undefined;
  return typeof p === "string" ? p : p._id;
};

const rideTypeLabel = (rt: Ride["rideType"]): string => {
  if (!rt) return "—";
  if (typeof rt === "string") return rt.slice(-8);
  return rt.title;
};

const rideTypeIcon = (rt: Ride["rideType"]): string | undefined => {
  if (!rt || typeof rt === "string") return undefined;
  return rt.icon;
};

// GeoJSON Point has coordinates as [lng, lat]. Display them in [lat, lng]
// order since admins expect that ordering when copying into map tools.
const formatPoint = (point: RideGeoPoint | undefined): string => {
  if (!point?.coordinates || point.coordinates.length < 2) return "—";
  const [lng, lat] = point.coordinates;
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};

// Search across the fields admins are likely to paste in.
const matchesSearch = (r: Ride, q: string): boolean => {
  if (!q) return true;
  const haystack: (string | undefined)[] = [
    r._id,
    personName(r.userId),
    personName(r.driverId),
    personId(r.userId),
    personId(r.driverId),
    typeof r.userId === "object" ? r.userId?.email : undefined,
    typeof r.userId === "object" ? r.userId?.phone : undefined,
    typeof r.driverId === "object" ? r.driverId?.email : undefined,
    typeof r.driverId === "object" ? r.driverId?.phone : undefined,
    rideTypeLabel(r.rideType),
    r.region,
    r.status,
    r.cancellationReason,
  ];
  return haystack
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .some((s) => s.toLowerCase().includes(q));
};

export default function RidesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [activeRegion, setActiveRegion] = useState<RegionTab>("ALL");
  const [status, setStatus] = useState<RideStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);

  const { data, isLoading, isFetching, error } = useRidesQuery({
    page,
    limit,
    region: activeRegion === "ALL" ? undefined : activeRegion,
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

  const q = search.trim().toLowerCase();
  const filtered = q ? rides.filter((r) => matchesSearch(r, q)) : rides;

  // Group the (current-page) rides by their region code so each section gets
  // its own header. Preserve the order rides arrived in by remembering the
  // first time each region is seen.
  const grouped = (() => {
    const map = new Map<string, Ride[]>();
    const order: string[] = [];
    filtered.forEach((r) => {
      const key = r.region || "—";
      if (!map.has(key)) {
        map.set(key, []);
        order.push(key);
      }
      map.get(key)!.push(r);
    });
    return order.map((key) => ({ region: key, rides: map.get(key)! }));
  })();

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
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search ride / rider / driver / phone…"
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
                  <th className="px-4 py-3 font-medium">Rider</th>
                  <th className="px-4 py-3 font-medium">Driver</th>
                  <th className="px-4 py-3 font-medium">Ride type</th>
                  <th className="px-4 py-3 font-medium">From → To</th>
                  <th className="px-4 py-3 text-right font-medium">Distance</th>
                  <th className="px-4 py-3 text-right font-medium">Fare</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              {grouped.map((group) => (
                <tbody
                  key={group.region}
                  className="border-t-4 border-gray-50 first:border-t-0 dark:border-white/[0.02]"
                >
                  <tr className="bg-gray-50/60 dark:bg-white/[0.02]">
                    <td
                      colSpan={10}
                      className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300"
                    >
                      {regionLabel(group.region as RegionCode)}
                      <span className="ml-2 rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                        {group.rides.length}
                      </span>
                    </td>
                  </tr>
                  {group.rides.map((r) => (
                    <RideRow key={r._id} ride={r} onView={setSelectedRideId} />
                  ))}
                </tbody>
              ))}
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

      <RideDetailsModal
        rideId={selectedRideId}
        onClose={() => setSelectedRideId(null)}
      />
    </>
  );
}

function RideRow({
  ride: r,
  onView,
}: {
  ride: Ride;
  onView: (id: string) => void;
}) {
  const rider = r.userId as RidePerson | string | null;
  const driver = r.driverId as RidePerson | string | null | undefined;
  const rideType = r.rideType as RideRideTypeRef | string | null;
  const icon = rideTypeIcon(rideType);

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]">
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-2">
          <span className="text-gray-800 dark:text-white/90">
            {personName(rider)}
          </span>
          {r.isScheduled && (
            <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              Scheduled
            </span>
          )}
        </div>
        {typeof rider === "object" && rider?.phone && (
          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            {rider.phone}
          </div>
        )}
      </td>
      <td className="px-4 py-3 align-top">
        {driver ? (
          <>
            <div className="text-gray-800 dark:text-white/90">
              {personName(driver)}
            </div>
            {typeof driver === "object" && driver?.phone && (
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                {driver.phone}
              </div>
            )}
          </>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-2">
          {icon && (
            <img
              src={icon}
              alt=""
              className="size-6 shrink-0 rounded object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span className="capitalize text-gray-800 dark:text-white/90">
            {rideTypeLabel(rideType)}
          </span>
        </div>
      </td>
      <td className="max-w-[9rem] px-4 py-3 align-top text-[11px] text-gray-600 sm:max-w-[12rem] lg:max-w-[14rem] dark:text-gray-300">
        <div className="truncate" title={formatPoint(r.origin)}>
          {formatPoint(r.origin)}
        </div>
        <div className="truncate text-gray-400" title={formatPoint(r.destination)}>
          ↓ {formatPoint(r.destination)}
        </div>
      </td>
      <td className="px-4 py-3 text-right align-top tabular-nums text-gray-700 dark:text-gray-200">
        {r.distance.toFixed(1)} km
        <div className="text-[10px] text-gray-400">{r.duration} min</div>
      </td>
      <td className="px-4 py-3 text-right align-top tabular-nums text-gray-800 dark:text-white/90">
        {r.currency} {r.estimatedFare}
      </td>
      <td className="px-4 py-3 align-top">
        <RideStatusBadge status={r.status} />
      </td>
      <td className="px-4 py-3 align-top text-[11px] capitalize text-gray-600 dark:text-gray-300">
        <div>{r.paymentStatus}</div>
        <div className="text-gray-400">{r.paymentMethod}</div>
      </td>
      <td className="px-4 py-3 align-top text-[11px] text-gray-500 dark:text-gray-400">
        {r.createdAt ? formatDateTime(r.createdAt) : "—"}
      </td>
      <td className="px-4 py-3 align-top">
        <button
          type="button"
          onClick={() => onView(r._id)}
          aria-label="View ride details"
          title="View details"
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
        >
          <Eye className="size-4" />
        </button>
      </td>
    </tr>
  );
}
