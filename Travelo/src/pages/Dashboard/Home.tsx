import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Car,
  CheckCircle2,
  CircleDollarSign,
  Globe,
  Megaphone,
  ShieldCheck,
  Star,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import RideStatusBadge from "../../components/Rides/RideStatusBadge";
import Button from "../../components/ui/button/Button";
import RevenueAreaChart from "../../components/dashboard/RevenueAreaChart";
import RidesBarChart from "../../components/dashboard/RidesBarChart";
import {
  useRevenueReportQuery,
  useRidesReportQuery,
  useDriversReportQuery,
} from "../../hooks/queries/useReports";
import {
  useDashboardKpisQuery,
  useDriverStatusQuery,
  useLatestRidesQuery,
  usePendingApprovalsQuery,
  useRegionsOverviewQuery,
  useReviewsNeedingAttentionQuery,
  useRevenueTrendQuery,
  useRidesTrendQuery,
  useTopDriversQuery,
} from "../../hooks/queries/useDashboard";
import {
  useActiveDriversQuery,
  useActiveDispatchRidesQuery,
} from "../../hooks/queries/useDispatch";
import { useDriversQuery } from "../../hooks/queries/useDrivers";
import { useRidesQuery } from "../../hooks/queries/useRides";
import { useReviewsQuery } from "../../hooks/queries/useReviews";
import {
  useApproveDriver,
  useRejectDriver,
} from "../../hooks/queries/useDriverApprovals";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency, formatDateTime } from "../../lib/format";
import {
  REGIONS,
  regionCurrency,
  regionLabel,
  type RegionCode,
} from "../../lib/regions";
import { getErrorMessage } from "../../lib/error";

type RegionFilter = "all" | RegionCode;

const FALLBACK_AVATAR = "/images/user/owner.jpg";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function Home() {
  const { admin } = useAuth();
  const [region, setRegion] = useState<RegionFilter>("all");

  const baseRange = { from: daysAgoIso(30), to: todayIso() };
  const range = useMemo(
    () => (region === "all" ? baseRange : { ...baseRange, countryCode: region }),
    // baseRange is recomputed every render but values are stable for the day; ok.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [region],
  );

  const kpisQ = useDashboardKpisQuery();
  const revenueTrendQ = useRevenueTrendQuery();
  const regionsOverviewQ = useRegionsOverviewQuery();
  const ridesTrendQ = useRidesTrendQuery();
  const driverStatusQ = useDriverStatusQuery(
    region === "all" ? undefined : region.toLowerCase(),
  );
  const pendingApprovalsQ = usePendingApprovalsQuery();
  const reviewsAttentionQ = useReviewsNeedingAttentionQuery();
  const topDriversQ = useTopDriversQuery();
  const latestRidesQ = useLatestRidesQuery();

  // Legacy report queries — kept as fallbacks while the new dashboard endpoints
  // ramp up. They cost nothing extra if the new ones return first.
  const revenueQ = useRevenueReportQuery(range);
  const ridesTrendReportQ = useRidesReportQuery(range);
  const leaderboardQ = useDriversReportQuery(range);

  // Prefer the dedicated /adminDashboard/revenue-trend endpoint; fall back to
  // the reports-based query if the trend endpoint hasn't returned yet or fails.
  const revenuePoints = useMemo(
    () =>
      revenueTrendQ.data
        ? revenueTrendQ.data.trend.map((p) => ({
            date: p.date,
            amount: p.totalRevenue,
          }))
        : (revenueQ.data ?? []),
    [revenueTrendQ.data, revenueQ.data],
  );
  const revenueTotal =
    revenueTrendQ.data?.totalRevenue ??
    revenuePoints.reduce((s, p) => s + (p.amount || 0), 0);
  const revenueDays = revenueTrendQ.data?.days ?? 30;
  const revenueLoading = revenueTrendQ.isLoading && revenueQ.isLoading;
  const revenueError = revenueTrendQ.error && revenueQ.error;

  // Rides trend → bar chart points. Fall back to the legacy report endpoint
  // until the new dashboard query returns.
  const ridesPoints = useMemo(
    () => ridesTrendQ.data?.trend ?? ridesTrendReportQ.data ?? [],
    [ridesTrendQ.data, ridesTrendReportQ.data],
  );
  const ridesLoading = ridesTrendQ.isLoading && ridesTrendReportQ.isLoading;
  const ridesDays = ridesTrendQ.data?.days ?? 30;

  const activeDriversQ = useActiveDriversQuery();
  const activeRidesQ = useActiveDispatchRidesQuery();
  const recentRidesQ = useRidesQuery({
    page: 1,
    limit: 8,
    ...(region === "all" ? {} : { region }),
  });
  const driversQ = useDriversQuery({ page: 1, limit: 50 });
  const lowReviewsQ = useReviewsQuery({ page: 1, limit: 5, maxRating: 3 });

  const kpis = kpisQ.data;
  // Currency follows the active region tab. Cross-region KPIs can't be
  // meaningfully expressed in one currency, so "All regions" stays in USD.
  const activeCurrency =
    region === "all"
      ? "USD"
      : regionsOverviewQ.data?.find(
          (r) => r.code?.toUpperCase() === region,
        )?.currency ?? regionCurrency(region);
  const allActiveDrivers = activeDriversQ.data ?? [];
  const allActiveRides = activeRidesQ.data ?? [];
  // Normalize recent rides into a single display shape, sourced from the
  // dedicated /latest-rides endpoint when available, else the legacy list.
  const recentRides = useMemo(() => {
    const fromDashboard = latestRidesQ.data;
    if (fromDashboard) {
      const filtered =
        region === "all"
          ? fromDashboard
          : fromDashboard.filter((r) => r.region === region);
      return filtered.slice(0, 8).map((r) => ({
        _id: r._id,
        userName: r.userId?.fullName || r.userId?.username || undefined,
        driverName: r.driverId?.fullName || r.driverId?.username || undefined,
        countryCode: r.region,
        fare: r.fare ?? r.bid ?? r.estimatedFare,
        currency: r.currency,
        status: r.status,
        createdAt: r.createdAt,
      }));
    }
    // Normalize the /admin/rides/ fallback to the same display shape so the
    // table below can iterate without per-row type branches.
    return (recentRidesQ.data?.rides ?? []).map((r) => {
      const user = typeof r.userId === "object" ? r.userId : null;
      const driver = typeof r.driverId === "object" ? r.driverId : null;
      return {
        _id: r._id,
        userName: user?.fullName || user?.username || undefined,
        driverName: driver?.fullName || driver?.username || undefined,
        countryCode: r.region,
        fare: r.estimatedFare,
        currency: r.currency,
        status: r.status,
        createdAt: r.createdAt,
      };
    });
  }, [latestRidesQ.data, recentRidesQ.data, region]);
  const lowReviews =
    reviewsAttentionQ.data ?? lowReviewsQ.data?.reviews ?? [];
  // Map the dashboard's top-drivers payload to the same display shape used by
  // the leaderboard list, with a graceful fall-back to the legacy report.
  const leaderboard = useMemo(() => {
    const fromDashboard = topDriversQ.data?.drivers;
    if (fromDashboard) {
      return fromDashboard.slice(0, 5).map((row) => ({
        driverId: row.driverId,
        driverName:
          row.driver?.fullName || row.driver?.username || "Unknown driver",
        driverImage: row.driver?.image,
        rides: row.completedRides,
        revenue: row.totalRevenue,
        rating: row.averageRating,
      }));
    }
    return (leaderboardQ.data ?? []).slice(0, 5).map((row) => ({
      driverId: row.driverId,
      driverName: row.driverName,
      driverImage: undefined as string | undefined,
      rides: row.rides,
      revenue: row.revenue,
      rating: row.rating ?? 0,
    }));
  }, [topDriversQ.data, leaderboardQ.data]);

  // Client-side region filtering for endpoints that don't yet support countryCode.
  const activeDrivers = useMemo(
    () =>
      region === "all"
        ? allActiveDrivers
        : allActiveDrivers.filter((d) => d.country === region),
    [allActiveDrivers, region],
  );
  const activeRides = useMemo(
    () =>
      region === "all"
        ? allActiveRides
        : allActiveRides.filter((r) => r.region === region),
    [allActiveRides, region],
  );

  // Prefer the server-driven /pending-approvals list; fall back to the
  // locally-derived list if the new endpoint hasn't returned yet.
  const pendingApprovals = useMemo(() => {
    const serverList = pendingApprovalsQ.data?.drivers;
    if (serverList && serverList.length >= 0 && pendingApprovalsQ.data) {
      return region === "all"
        ? serverList
        : serverList.filter((d) => d.country === region);
    }
    const local = (driversQ.data?.drivers ?? []).filter(
      (d) => d.isDocumentUploaded && !d.isApproved && !d.isBlocked,
    );
    return region === "all" ? local : local.filter((d) => d.country === region);
  }, [pendingApprovalsQ.data, driversQ.data, region]);
  const totalPending = pendingApprovalsQ.data?.total ?? pendingApprovals.length;

  // Driver status card metrics — prefer the dedicated endpoint, fall back to
  // locally-derived counts from the dispatch query.
  const localOnTrip = activeDrivers.filter((d) => d.currentRideId).length;
  const localIdle = activeDrivers.filter((d) => !d.currentRideId).length;
  const onTrip = driverStatusQ.data?.onRideDrivers ?? localOnTrip;
  const idle = driverStatusQ.data?.idleDrivers ?? localIdle;
  const totalActive =
    driverStatusQ.data?.activeDrivers ?? activeDrivers.length;
  const offline = driverStatusQ.data?.offlineDrivers ?? 0;
  const totalDrivers = driverStatusQ.data?.totalDrivers ?? 0;

  const greeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const adminName = admin?.email?.split("@")[0] ?? "Admin";

  return (
    <>
      <PageMeta
        title="Dashboard | Travelo Admin"
        description="Real-time KPIs, live operations, and pending actions for the Travelo admin team."
      />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            {greeting}, {adminName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {region === "all"
              ? "Here's what's happening across Travelo today."
              : `Viewing ${regionLabel(region)} · last 30 days.`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-success-500" />
          Live · auto-refreshes every 15s
        </div>
      </div>

      {/* Region tabs */}
      <RegionTabs region={region} onChange={setRegion} />

      {/* Per-region snapshot strip — shown only when "All regions" is selected */}
      {region === "all" && (
        <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {REGIONS.map((r) => {
            // Prefer server-side metrics; fall back to locally-derived counts
            // if /adminDashboard/regions-overview hasn't returned yet.
            const server = regionsOverviewQ.data?.find(
              (s) => s.code?.toUpperCase() === r.code,
            );
            const localActiveDrivers = allActiveDrivers.filter(
              (d) => d.country === r.code,
            );
            const localOnTrip = localActiveDrivers.filter(
              (d) => d.currentRideId,
            ).length;
            const localPending = (driversQ.data?.drivers ?? []).filter(
              (d) =>
                d.isDocumentUploaded &&
                !d.isApproved &&
                !d.isBlocked &&
                d.country === r.code,
            ).length;
            return (
              <RegionSnapshotCard
                key={r.code}
                code={r.code}
                label={r.label}
                currency={server?.currency ?? r.currency}
                totalDrivers={server?.totalDrivers ?? localActiveDrivers.length}
                onTripDrivers={server?.onTripDrivers ?? localOnTrip}
                idleDrivers={
                  server?.idleDrivers ??
                  localActiveDrivers.length - localOnTrip
                }
                activeRidesNow={
                  server?.activeRidesNow ??
                  allActiveRides.filter((rd) => rd.region === r.code).length
                }
                pendingApprovals={server?.pendingApprovals ?? localPending}
                onSelect={() => setRegion(r.code)}
              />
            );
          })}
        </div>
      )}

      {/* KPI grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="Today's revenue"
          value={
            kpis
              ? formatCurrency(kpis.totalTodayRevenue ?? 0, activeCurrency)
              : "—"
          }
          icon={<CircleDollarSign className="size-5" />}
          tone="success"
          loading={kpisQ.isLoading}
        />
        <Kpi
          label="Today's rides"
          value={kpis ? (kpis.totalTodayRides ?? 0).toLocaleString() : "—"}
          icon={<Car className="size-5" />}
          tone="brand"
          loading={kpisQ.isLoading}
        />
        <Kpi
          label="Active drivers"
          value={activeDrivers.length.toLocaleString()}
          icon={<UserCheck className="size-5" />}
          tone="brand"
          loading={activeDriversQ.isLoading}
        />
        <Kpi
          label="Pending approvals"
          value={
            kpis
              ? (kpis.totalPendingApprovals ?? 0).toLocaleString()
              : pendingApprovals.length.toLocaleString()
          }
          icon={<ShieldCheck className="size-5" />}
          tone={
            (kpis?.totalPendingApprovals ?? pendingApprovals.length) > 0
              ? "warning"
              : "neutral"
          }
          loading={kpisQ.isLoading}
          href="/driver-approvals"
          actionable={(kpis?.totalPendingApprovals ?? 0) > 0}
        />
        <Kpi
          label="Active users"
          value={kpis ? (kpis.todayActiveUsers ?? 0).toLocaleString() : "—"}
          icon={<Users className="size-5" />}
          tone="brand"
          loading={kpisQ.isLoading}
        />
        <Kpi
          label="Cancellation rate"
          value={
            kpis ? `${(kpis.totalCancellationRate ?? 0).toFixed(1)}%` : "—"
          }
          icon={
            kpis && (kpis.totalCancellationRate ?? 0) > 10 ? (
              <TrendingUp className="size-5" />
            ) : (
              <TrendingDown className="size-5" />
            )
          }
          tone={
            kpis && (kpis.totalCancellationRate ?? 0) > 15
              ? "error"
              : kpis && (kpis.totalCancellationRate ?? 0) > 8
                ? "warning"
                : "success"
          }
          loading={kpisQ.isLoading}
        />
        <Kpi
          label="Average fare"
          value={
            kpis
              ? formatCurrency(
                  kpis.totalTodayAverageFare ?? 0,
                  activeCurrency,
                )
              : "—"
          }
          icon={<BarChart3 className="size-5" />}
          tone="brand"
          loading={kpisQ.isLoading}
        />
        <Kpi
          label="Active rides now"
          value={
            kpis
              ? (kpis.totalActiveRides ?? 0).toLocaleString()
              : activeRides.length.toLocaleString()
          }
          icon={<Car className="size-5" />}
          tone={
            (kpis?.totalActiveRides ?? activeRides.length) > 0
              ? "success"
              : "neutral"
          }
          loading={kpisQ.isLoading}
          href="/live-dispatch"
        />
      </div>

      {/* Quick actions */}
      <div className="mb-6 flex flex-wrap gap-2">
        <QuickAction
          to="/notifications"
          icon={<Bell className="size-4" />}
          label="Send notification"
        />
        <QuickAction
          to="/adverts"
          icon={<Megaphone className="size-4" />}
          label="Create advert"
        />
        <QuickAction
          to="/driver-approvals"
          icon={<ShieldCheck className="size-4" />}
          label="Review approvals"
          highlight={pendingApprovals.length > 0}
        />
        <QuickAction
          to="/reports"
          icon={<BarChart3 className="size-4" />}
          label="Reports & exports"
        />
        <QuickAction
          to="/live-dispatch"
          icon={<Car className="size-4" />}
          label="Open live dispatch"
        />
      </div>

      {/* Charts row */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title={`Revenue · last ${revenueDays} days`}
          subtitle={`Total period: ${formatCurrency(
            revenueTotal,
            activeCurrency,
          )}${
            revenueTrendQ.data?.totalRides != null
              ? ` · ${(revenueTrendQ.data.totalRides ?? 0).toLocaleString()} rides`
              : ""
          }`}
          right={
            <Link
              to="/reports"
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              View reports →
            </Link>
          }
        >
          {revenueLoading ? (
            <div className="h-[280px] flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : revenueError ? (
            <EmptyState
              title="Couldn't load revenue"
              description={getErrorMessage(
                revenueTrendQ.error ?? revenueQ.error,
              )}
            />
          ) : revenuePoints.length === 0 ? (
            <EmptyState title="No revenue data for this range" />
          ) : (
            <RevenueAreaChart
              points={revenuePoints}
              currency={activeCurrency}
            />
          )}
        </Card>

        <Card
          title="Driver status"
          subtitle={
            region === "all"
              ? "Real-time · all regions"
              : `Real-time · ${regionLabel(region)}`
          }
          right={
            <Link
              to="/live-dispatch"
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              Live dispatch →
            </Link>
          }
        >
          {driverStatusQ.isLoading && activeDriversQ.isLoading ? (
            <div className="h-[180px] flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <StatusBar
                label="On a ride"
                value={onTrip}
                total={totalActive || 1}
                color="bg-warning-500"
              />
              <StatusBar
                label="Idle / available"
                value={idle}
                total={totalActive || 1}
                color="bg-success-500"
              />
              <div className="grid grid-cols-4 gap-2 pt-2">
                <MiniStat label="Total" value={totalDrivers} />
                <MiniStat label="Active" value={totalActive} tone="success" />
                <MiniStat label="On trip" value={onTrip} tone="warning" />
                <MiniStat label="Offline" value={offline} />
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Action queues row */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PendingApprovalsCard
          drivers={pendingApprovals.slice(0, 5)}
          loading={pendingApprovalsQ.isLoading && driversQ.isLoading}
          totalPending={totalPending}
        />
        <LowRatedReviewsCard
          reviews={lowReviews}
          loading={reviewsAttentionQ.isLoading && lowReviewsQ.isLoading}
        />
      </div>

      {/* Rides trend + leaderboard */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title={`Rides · last ${ridesDays} days`}
          subtitle={
            ridesTrendQ.data
              ? `${ridesTrendQ.data.total.toLocaleString()} total · ${ridesTrendQ.data.completed.toLocaleString()} completed · ${ridesTrendQ.data.cancelled.toLocaleString()} cancelled`
              : "Completed vs cancelled"
          }
        >
          {ridesLoading ? (
            <div className="h-[260px] flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : ridesPoints.length === 0 ? (
            <EmptyState title="No ride data for this range" />
          ) : (
            <RidesBarChart points={ridesPoints} />
          )}
        </Card>

        <Card
          title="Top drivers"
          subtitle={
            topDriversQ.data
              ? `Last ${topDriversQ.data.days} days`
              : `${range.from} → ${range.to}`
          }
          right={
            <Link
              to="/driver-tables"
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              All drivers →
            </Link>
          }
        >
          {topDriversQ.isLoading && leaderboardQ.isLoading ? (
            <div className="py-6">
              <LoadingSpinner />
            </div>
          ) : leaderboard.length === 0 ? (
            <EmptyState title="No data" />
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {leaderboard.map((row, i) => (
                <li
                  key={row.driverId}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                      {i + 1}
                    </span>
                    {row.driverImage && (
                      <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <img
                          src={row.driverImage}
                          alt=""
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              FALLBACK_AVATAR;
                          }}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-800 dark:text-white/90">
                        {row.driverName}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {row.rides} rides · ★{" "}
                        {row.rating ? row.rating.toFixed(1) : "—"}
                      </p>
                    </div>
                  </div>
                  <span className="tabular-nums text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {formatCurrency(row.revenue, activeCurrency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Recent rides */}
      <Card
        title="Latest rides"
        subtitle="Most recent activity across all regions"
        right={
          <Link
            to="/rides"
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            View all rides →
          </Link>
        }
      >
        {latestRidesQ.isLoading && recentRidesQ.isLoading ? (
          <div className="py-6">
            <LoadingSpinner />
          </div>
        ) : recentRides.length === 0 ? (
          <EmptyState title="No rides yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500 dark:bg-white/[0.02] dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Ride</th>
                  <th className="px-4 py-3 font-medium">Rider</th>
                  <th className="px-4 py-3 font-medium">Driver</th>
                  <th className="px-4 py-3 font-medium">Region</th>
                  <th className="px-4 py-3 text-right font-medium">Fare</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {recentRides.map((r) => (
                  <tr
                    key={r._id}
                    className="border-t border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-500">
                      {r._id.slice(-8)}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {r.userName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {r.driverName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-gray-500">
                      {r.countryCode
                        ? regionLabel(r.countryCode as RegionCode)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                      {r.fare !== undefined
                        ? formatCurrency(r.fare, r.currency ?? "USD")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <RideStatusBadge
                        status={r.status as Parameters<typeof RideStatusBadge>[0]["status"]}
                      />
                    </td>
                    <td className="px-4 py-3 text-[11px] text-gray-500">
                      {r.createdAt ? formatDateTime(r.createdAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

/* ---------- Sub-components ---------- */

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
    <div className="mb-6 inline-flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
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

function RegionSnapshotCard({
  code,
  label,
  currency,
  totalDrivers,
  onTripDrivers,
  idleDrivers,
  activeRidesNow,
  pendingApprovals,
  onSelect,
}: {
  code: RegionCode;
  label: string;
  currency: string;
  totalDrivers: number;
  onTripDrivers: number;
  idleDrivers: number;
  activeRidesNow: number;
  pendingApprovals: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group rounded-2xl border border-gray-200 bg-white p-4 text-left transition hover:border-brand-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {code}
          </p>
          <h3 className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-white/90">
            {label}
          </h3>
          <p className="text-[11px] text-gray-500">Currency: {currency}</p>
        </div>
        {pendingApprovals > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2 py-0.5 text-[10px] font-medium text-warning-700 dark:bg-warning-500/10 dark:text-warning-400">
            <ShieldCheck className="size-3" />
            {pendingApprovals} pending
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-white/[0.02]">
          <p className="text-base font-semibold text-gray-800 dark:text-white/90">
            {totalDrivers}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-gray-500">
            Drivers
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-white/[0.02]">
          <p className="text-base font-semibold text-warning-600">
            {onTripDrivers}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-gray-500">
            On trip
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-white/[0.02]">
          <p className="text-base font-semibold text-success-600">
            {idleDrivers}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-gray-500">
            Idle
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-gray-500">Active rides now</span>
        <span className="font-semibold text-gray-800 dark:text-white/90">
          {activeRidesNow}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-end text-[11px] font-medium text-brand-600 opacity-0 transition group-hover:opacity-100">
        View {label} →
      </div>
    </button>
  );
}

function Card({
  title,
  subtitle,
  right,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function Kpi({
  label,
  value,
  icon,
  tone,
  loading,
  href,
  actionable,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "brand" | "success" | "warning" | "error" | "neutral";
  loading?: boolean;
  href?: string;
  actionable?: boolean;
}) {
  const toneRing: Record<typeof tone, string> = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
    success:
      "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400",
    warning:
      "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400",
    error: "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400",
    neutral: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  };

  const body = (
    <div
      className={`rounded-2xl border bg-white p-4 transition dark:bg-gray-900 ${
        actionable
          ? "border-warning-300 ring-1 ring-warning-200 dark:border-warning-500/30 dark:ring-warning-500/20"
          : "border-gray-200 dark:border-gray-800"
      } ${href ? "hover:border-brand-300 hover:shadow-sm" : ""}`}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneRing[tone]}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-gray-800 dark:text-white/90">
        {loading ? "…" : value}
      </p>
    </div>
  );

  return href ? <Link to={href}>{body}</Link> : body;
}

function QuickAction({
  to,
  icon,
  label,
  highlight,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
        highlight
          ? "border-warning-300 bg-warning-50 text-warning-700 hover:bg-warning-100 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-400"
          : "border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function StatusBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
        <span className="tabular-nums text-gray-500">
          {value} ({pct.toFixed(0)}%)
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "warning" | "success";
}) {
  const cls =
    tone === "warning"
      ? "text-warning-600"
      : tone === "success"
        ? "text-success-600"
        : "text-gray-800 dark:text-white/90";
  return (
    <div className="rounded-lg border border-gray-100 p-2 text-center dark:border-gray-800">
      <p className={`text-lg font-semibold ${cls}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-gray-500">
        {label}
      </p>
    </div>
  );
}

function PendingApprovalsCard({
  drivers,
  loading,
  totalPending,
}: {
  drivers: Array<{
    _id: string;
    fullName?: string;
    username: string;
    email: string;
    image?: string;
    country: string;
    createdAt?: string;
  }>;
  loading?: boolean;
  totalPending: number;
}) {
  const approveMutation = useApproveDriver();
  const rejectMutation = useRejectDriver();

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      toast.success("Driver approved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectMutation.mutateAsync({ id });
      toast.success("Driver rejected");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Card
      title="Pending driver approvals"
      subtitle={
        totalPending > 0
          ? `${totalPending} awaiting review`
          : "All clear"
      }
      right={
        totalPending > 0 ? (
          <Link
            to="/driver-approvals"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
          >
            Review all <ArrowRight className="size-3" />
          </Link>
        ) : null
      }
    >
      {loading ? (
        <div className="py-6">
          <LoadingSpinner />
        </div>
      ) : drivers.length === 0 ? (
        <div className="flex items-center gap-3 py-4">
          <CheckCircle2 className="size-5 text-success-500" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            No pending approvals — you're all caught up.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {drivers.map((d) => (
            <li
              key={d._id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
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
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                    {d.fullName || d.username}
                  </p>
                  <p className="truncate text-[11px] text-gray-500">
                    {d.email} · {regionLabel(d.country as never)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(d._id)}
                  disabled={rejectMutation.isPending}
                  startIcon={<XCircle className="size-3.5" />}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(d._id)}
                  disabled={approveMutation.isPending}
                  startIcon={<CheckCircle2 className="size-3.5" />}
                >
                  Approve
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function LowRatedReviewsCard({
  reviews,
  loading,
}: {
  reviews: Array<{
    _id: string;
    customerRating: number;
    customerFeedback?: string;
    // Either a populated user object or just an id, depending on the source.
    customer?: { _id: string; fullName?: string; username?: string } | string;
    driver?: { _id: string; fullName?: string; username?: string } | string;
    createdAt?: string;
  }>;
  loading?: boolean;
}) {
  return (
    <Card
      title="Reviews needing attention"
      subtitle="Ratings of 3 stars or lower"
      right={
        <Link
          to="/reviews"
          className="text-xs font-medium text-brand-600 hover:underline"
        >
          All reviews →
        </Link>
      }
    >
      {loading ? (
        <div className="py-6">
          <LoadingSpinner />
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex items-center gap-3 py-4">
          <CheckCircle2 className="size-5 text-success-500" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            No low-rated reviews — riders are happy.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {reviews.map((r) => (
            <li key={r._id} className="py-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  Driver{" "}
                  {!r.driver
                    ? "—"
                    : typeof r.driver === "string"
                      ? `${r.driver.slice(0, 6)}…`
                      : r.driver.fullName ||
                        r.driver.username ||
                        `${r.driver._id.slice(0, 6)}…`}
                </p>
                <span className="inline-flex items-center gap-0.5 text-xs">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3 ${
                        i < Math.round(r.customerRating)
                          ? "fill-warning-500 text-warning-500"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </span>
              </div>
              {r.customerFeedback && (
                <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                  "{r.customerFeedback}"
                </p>
              )}
              {r.createdAt && (
                <p className="mt-1 text-[10px] text-gray-400">
                  {formatDateTime(r.createdAt)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

