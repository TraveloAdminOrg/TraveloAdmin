import { useState } from "react";
import {
  Activity,
  Car,
  Globe,
  Users,
  UserCheck,
  Zap,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../components/common/PageHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import RideStatusBadge from "../../components/Rides/RideStatusBadge";
import DispatchMap from "../../components/LiveDispatch/DispatchMap";
import {
  useActiveDispatchRidesQuery,
  useActiveDriversQuery,
  useDispatchOverviewQuery,
} from "../../hooks/queries/useDispatch";
import { REGIONS, regionLabel, type RegionCode } from "../../lib/regions";
import { formatDateTime } from "../../lib/format";

type RegionFilter = "all" | RegionCode;

const FALLBACK_AVATAR = "/images/user/owner.jpg";

export default function LiveDispatchPage() {
  const [region, setRegion] = useState<RegionFilter>("all");

  // Pass the region only when a specific country is selected; otherwise the
  // backend returns the global aggregate.
  const regionParam = region === "all" ? undefined : region.toLowerCase();

  const overviewQuery = useDispatchOverviewQuery(regionParam);
  const driversQuery = useActiveDriversQuery(regionParam);
  const ridesQuery = useActiveDispatchRidesQuery(regionParam);

  const drivers = driversQuery.data ?? [];
  const rides = ridesQuery.data ?? [];
  const overview = overviewQuery.data;

  // Prefer server overview values; fall back to client-side counts so the UI
  // never renders blank while the overview query is in flight.
  const activeDriverCount =
    overview?.activeDrivers ?? drivers.length;
  const activeRideCount = overview?.activeRides ?? rides.length;
  const onRideCount =
    overview?.onRide ?? drivers.filter((d) => d.currentRideId).length;
  const idleCount =
    overview?.idleDrivers ?? drivers.filter((d) => !d.currentRideId).length;

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

      {/* Region tabs */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <RegionTabs region={region} onChange={setRegion} />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {region === "all"
            ? "Showing all regions"
            : `Showing ${regionLabel(region)}`}
        </p>
      </div>

      {/* KPI strip */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Active drivers"
          value={activeDriverCount}
          icon={<UserCheck className="size-5" />}
          tone="brand"
          loading={overviewQuery.isLoading && driversQuery.isLoading}
        />
        <KpiCard
          label="Active rides"
          value={activeRideCount}
          icon={<Car className="size-5" />}
          tone="brand"
          loading={overviewQuery.isLoading && ridesQuery.isLoading}
        />
        <KpiCard
          label="On a ride"
          value={onRideCount}
          icon={<Zap className="size-5" />}
          tone="warning"
          loading={overviewQuery.isLoading && driversQuery.isLoading}
        />
        <KpiCard
          label="Idle drivers"
          value={idleCount}
          icon={<Users className="size-5" />}
          tone="success"
          loading={overviewQuery.isLoading && driversQuery.isLoading}
        />
      </div>

      {/* Live map + active rides side panel */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          <DispatchMap drivers={drivers} rides={rides} region={region} />
          <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 px-4 py-2 text-[11px] text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <LegendDot color="#10b981" label="Idle driver" />
            <LegendDot color="#f59e0b" label="Driver on ride" />
            <LegendDot color="#3b82f6" label="Pickup" />
            <LegendDot color="#ef4444" label="Drop-off" />
          </div>
        </div>

        {/* Active rides side panel */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Active rides
            </h3>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              {activeRideCount}
            </span>
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
              rides.map((r) => {
                // userId/driverId may be a populated object or a bare id.
                const userName =
                  typeof r.userId === "object" && r.userId
                    ? r.userId.fullName || r.userId.username
                    : undefined;
                const driverName =
                  typeof r.driverId === "object" && r.driverId
                    ? r.driverId.fullName || r.driverId.username
                    : undefined;
                const origin = r.origin?.coordinates;
                const originLabel =
                  origin && origin.length >= 2
                    ? `${origin[1].toFixed(4)}, ${origin[0].toFixed(4)}`
                    : undefined;
                return (
                  <div key={r._id} className="p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-gray-500">
                        {r._id.slice(-8)}
                      </span>
                      <RideStatusBadge status={r.status} />
                    </div>
                    <div className="mt-1 text-gray-700 dark:text-gray-300">
                      {userName ?? "—"} → {driverName ?? "—"}
                    </div>
                    {originLabel && (
                      <div className="mt-0.5 truncate text-gray-500 dark:text-gray-400">
                        {originLabel}
                      </div>
                    )}
                    {r.createdAt && (
                      <div className="mt-0.5 text-[10px] text-gray-400">
                        {formatDateTime(r.createdAt)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Active drivers grid */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Active drivers
          </h3>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            {activeDriverCount}
          </span>
        </div>
        {driversQuery.isLoading ? (
          <div className="p-6">
            <LoadingSpinner />
          </div>
        ) : drivers.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No active drivers"
              description={
                region === "all"
                  ? "Drivers go online from the driver app."
                  : `No drivers active in ${regionLabel(region)} right now.`
              }
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

function RegionTabs({
  region,
  onChange,
}: {
  region: RegionFilter;
  onChange: (r: RegionFilter) => void;
}) {
  const tabs: { value: RegionFilter; label: string; flag?: string }[] = [
    { value: "all", label: "All regions" },
    ...REGIONS.map((r) => ({
      value: r.code as RegionFilter,
      label: r.label,
      flag: r.code,
    })),
  ];
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
      {tabs.map((t) => {
        const active = region === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              active
                ? "bg-brand-500 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {t.value === "all" ? (
              <Globe className="size-3.5" />
            ) : (
              <span className="font-mono text-[10px] tracking-wide">
                {t.flag}
              </span>
            )}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="inline-block size-2.5 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function KpiCard({
  label,
  value,
  icon,
  loading,
  tone = "brand",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  loading?: boolean;
  tone?: "brand" | "success" | "warning";
}) {
  const toneClass: Record<string, string> = {
    brand: "text-brand-500",
    success: "text-success-500",
    warning: "text-warning-500",
  };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <span className={toneClass[tone]}>{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
        {loading ? "…" : value.toLocaleString()}
      </p>
    </div>
  );
}
