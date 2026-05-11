import { useEffect, useState } from "react";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "../common/EmptyState";
import Pagination from "../common/Pagination";
import RideStatusBadge from "../Rides/RideStatusBadge";
import { useRidesByUserQuery } from "../../hooks/queries/useRides";
import { formatDateTime } from "../../lib/format";
import { getErrorMessage } from "../../lib/error";
import type {
  Ride,
  RideGeoPoint,
  RidePerson,
  RideRideTypeRef,
} from "../../types/ride";

const DEFAULT_PAGE_SIZE = 10;

interface Props {
  userId: string;
}

// Reusable helpers — local copies of the ones in RidesPage so this section is
// self-contained.
const personName = (p: Ride["driverId"]): string => {
  if (!p) return "—";
  if (typeof p === "string") return p.slice(-8);
  return p.fullName || p.username || p.email || p._id.slice(-8) || "—";
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

const formatPoint = (point: RideGeoPoint | undefined): string => {
  if (!point?.coordinates || point.coordinates.length < 2) return "—";
  const [lng, lat] = point.coordinates;
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};

export default function UserRideHistorySection({ userId }: Props) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading, isFetching, error } = useRidesByUserQuery(userId, {
    page,
    limit,
  });

  const rides = data?.rides ?? [];
  const meta = data?.meta;

  // Pull back to the last existing page if we overshoot (e.g. after refetch).
  useEffect(() => {
    if (meta && page > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  if (isLoading) {
    return <LoadingSpinner fullPage label="Loading ride history…" />;
  }

  if (error) {
    return (
      <EmptyState
        title="Failed to load ride history"
        description={getErrorMessage(error)}
      />
    );
  }

  if (rides.length === 0) {
    return (
      <EmptyState
        title="No rides yet"
        description="This user hasn't taken any rides."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 ${
          isFetching ? "opacity-70 transition" : ""
        }`}
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500 dark:bg-white/[0.02] dark:text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">Driver</th>
              <th className="px-4 py-3 font-medium">Ride type</th>
              <th className="px-4 py-3 font-medium">From → To</th>
              <th className="px-4 py-3 text-right font-medium">Distance</th>
              <th className="px-4 py-3 text-right font-medium">Fare</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {rides.map((r) => (
              <RideRow key={r._id} ride={r} />
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.total > 0 && (
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
      )}
    </div>
  );
}

function RideRow({ ride: r }: { ride: Ride }) {
  const driver = r.driverId as RidePerson | string | null | undefined;
  const rideType = r.rideType as RideRideTypeRef | string | null;
  const icon = rideTypeIcon(rideType);

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]">
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
          {r.isScheduled && (
            <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              Scheduled
            </span>
          )}
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
        {r.cancellationReason && (
          <div
            className="mt-1 max-w-[12rem] truncate text-[10px] text-gray-400"
            title={r.cancellationReason}
          >
            {r.cancellationReason}
          </div>
        )}
      </td>
      <td className="px-4 py-3 align-top text-[11px] capitalize text-gray-600 dark:text-gray-300">
        <div>{r.paymentStatus}</div>
        <div className="text-gray-400">{r.paymentMethod}</div>
      </td>
      <td className="px-4 py-3 align-top text-[11px] text-gray-500 dark:text-gray-400">
        {r.createdAt ? formatDateTime(r.createdAt) : "—"}
      </td>
    </tr>
  );
}
