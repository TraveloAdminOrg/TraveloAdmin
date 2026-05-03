import { Map, Users, Car, Activity } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../components/common/PageHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import RideStatusBadge from "../../components/Rides/RideStatusBadge";
import {
  useActiveDriversQuery,
  useActiveDispatchRidesQuery,
} from "../../hooks/queries/useDispatch";
import { regionLabel } from "../../lib/regions";
import { formatDateTime } from "../../lib/format";

const FALLBACK_AVATAR = "/images/user/owner.jpg";

export default function LiveDispatchPage() {
  const driversQuery = useActiveDriversQuery();
  const ridesQuery = useActiveDispatchRidesQuery();

  const drivers = driversQuery.data ?? [];
  const rides = ridesQuery.data ?? [];

  return (
    <>
      <PageMeta
        title="Live Dispatch | Travelo Admin"
        description="Real-time view of active drivers and rides."
      />

      <PageHeader
        title="Live Dispatch"
        description="Real-time pulse of the platform · auto-refreshes every 15 seconds."
        icon={<Activity size={22} />}
        actions={
          <div className="inline-flex items-center gap-2 rounded-full border border-success-200 bg-success-50 px-3 py-1.5 text-xs font-medium text-success-700 dark:border-success-500/20 dark:bg-success-500/10 dark:text-success-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success-500" />
            Live · 15s refresh
          </div>
        }
      />

      {/* KPI strip */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Active drivers"
          value={drivers.length}
          icon={<Users className="size-5" />}
          loading={driversQuery.isLoading}
        />
        <KpiCard
          label="Active rides"
          value={rides.length}
          icon={<Car className="size-5" />}
          loading={ridesQuery.isLoading}
        />
        <KpiCard
          label="On a ride"
          value={drivers.filter((d) => d.currentRideId).length}
          icon={<Car className="size-5" />}
          loading={driversQuery.isLoading}
        />
        <KpiCard
          label="Idle drivers"
          value={drivers.filter((d) => !d.currentRideId).length}
          icon={<Users className="size-5" />}
          loading={driversQuery.isLoading}
        />
      </div>

      {/* Map placeholder + side panel */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          <div className="flex h-[420px] flex-col items-center justify-center gap-3 p-6 text-center">
            <Map className="size-12 text-gray-300 dark:text-gray-600" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Map view
            </h3>
            <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
              Real-time pins for active drivers and rides will render here.
              Requires a map library (e.g. Mapbox, Leaflet, Google Maps) — wire
              up once the map provider + API key are decided.
            </p>
          </div>
        </div>

        {/* Active rides side panel */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 p-4 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Active rides
            </h3>
          </div>
          <div className="max-h-[368px] divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800">
            {ridesQuery.isLoading ? (
              <div className="p-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : rides.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="No active rides"
                  description="They'll appear as drivers accept ride requests."
                />
              </div>
            ) : (
              rides.map((r) => (
                <div key={r._id} className="p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-gray-500">
                      {r._id.slice(-8)}
                    </span>
                    <RideStatusBadge status={r.status} />
                  </div>
                  <div className="mt-1 text-gray-700 dark:text-gray-300">
                    {r.userName ?? "—"} → {r.driverName ?? "—"}
                  </div>
                  <div className="mt-0.5 truncate text-gray-500 dark:text-gray-400">
                    {r.pickup?.address}
                  </div>
                  {r.requestedAt && (
                    <div className="mt-0.5 text-[10px] text-gray-400">
                      {formatDateTime(r.requestedAt)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active drivers grid */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 p-4 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Active drivers ({drivers.length})
          </h3>
        </div>
        {driversQuery.isLoading ? (
          <div className="p-6">
            <LoadingSpinner />
          </div>
        ) : drivers.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No active drivers"
              description="Drivers go online from the driver app."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {drivers.map((d) => (
              <div
                key={d._id}
                className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-gray-800"
              >
                <div className="relative">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <img
                      src={d.image || FALLBACK_AVATAR}
                      alt=""
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          FALLBACK_AVATAR;
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${
                      d.currentRideId ? "bg-warning-500" : "bg-success-500"
                    }`}
                    title={d.currentRideId ? "On a ride" : "Idle"}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                    {d.fullName || d.username}
                  </p>
                  <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                    {regionLabel(d.country)} · {d.rideType ?? "Driver"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function KpiCard({
  label,
  value,
  icon,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <span className="text-gray-400">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
        {loading ? "…" : value}
      </p>
    </div>
  );
}
