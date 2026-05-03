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
  useReportOverviewQuery,
  useRevenueReportQuery,
  useRidesReportQuery,
  useDriversReportQuery,
} from "../../hooks/queries/useReports";
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
import { REGIONS, regionLabel, type RegionCode } from "../../lib/regions";
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

  const overviewQ = useReportOverviewQuery(range);
  const revenueQ = useRevenueReportQuery(range);
  const ridesTrendQ = useRidesReportQuery(range);
  const leaderboardQ = useDriversReportQuery(range);

  const activeDriversQ = useActiveDriversQuery();
  const activeRidesQ = useActiveDispatchRidesQuery();
  const recentRidesQ = useRidesQuery({
    page: 1,
    limit: 8,
    ...(region === "all" ? {} : { countryCode: region }),
  });
  const driversQ = useDriversQuery({ page: 1, limit: 50 });
  const lowReviewsQ = useReviewsQuery({ page: 1, limit: 5, maxRating: 3 });

  const overview = overviewQ.data;
  const allActiveDrivers = activeDriversQ.data ?? [];
  const allActiveRides = activeRidesQ.data ?? [];
  const recentRides = recentRidesQ.data?.rides ?? [];
  const lowReviews = lowReviewsQ.data?.reviews ?? [];
  const leaderboard = (leaderboardQ.data ?? []).slice(0, 5);

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
        : allActiveRides.filter((r) => r.countryCode === region),
    [allActiveRides, region],
  );

  const pendingApprovals = useMemo(() => {
    const all = (driversQ.data?.drivers ?? []).filter(
      (d) => d.isDocumentUploaded && !d.isApproved && !d.isBlocked,
    );
    return region === "all" ? all : all.filter((d) => d.country === region);
  }, [driversQ.data, region]);

  const onTrip = activeDrivers.filter((d) => d.currentRideId).length;
  const idle = activeDrivers.filter((d) => !d.currentRideId).length;

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
          {REGIONS.map((r) => (
            <RegionSnapshotCard
              key={r.code}
              code={r.code}
              label={r.label}
              currency={r.currency}
              activeDrivers={allActiveDrivers.filter(
                (d) => d.country === r.code,
              )}
              activeRides={allActiveRides.filter(
                (rd) => rd.countryCode === r.code,
              )}
              pendingApprovals={
                (driversQ.data?.drivers ?? []).filter(
                  (d) =>
                    d.isDocumentUploaded &&
                    !d.isApproved &&
                    !d.isBlocked &&
                    d.country === r.code,
                ).length
              }
              onSelect={() => setRegion(r.code)}
            />
          ))}
        </div>
      )}

      {/* KPI grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="Today's revenue"
          value={
            overview
              ? formatCurrency(overview.todayRevenue, overview.currency)
              : "—"
          }
          icon={<CircleDollarSign className="size-5" />}
          tone="success"
          loading={overviewQ.isLoading}
        />
        <Kpi
          label="Today's rides"
          value={overview ? overview.todayRides.toLocaleString() : "—"}
          icon={<Car className="size-5" />}
          tone="brand"
          loading={overviewQ.isLoading}
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
          value={pendingApprovals.length.toLocaleString()}
          icon={<ShieldCheck className="size-5" />}
          tone={pendingApprovals.length > 0 ? "warning" : "neutral"}
          loading={driversQ.isLoading}
          href="/driver-approvals"
          actionable={pendingApprovals.length > 0}
        />
        <Kpi
          label="Active users"
          value={overview ? overview.activeUsers.toLocaleString() : "—"}
          icon={<Users className="size-5" />}
          tone="brand"
          loading={overviewQ.isLoading}
        />
        <Kpi
          label="Cancellation rate"
          value={
            overview ? `${(overview.cancellationRate * 100).toFixed(1)}%` : "—"
          }
          icon={
            overview && overview.cancellationRate > 0.1 ? (
              <TrendingUp className="size-5" />
            ) : (
              <TrendingDown className="size-5" />
            )
          }
          tone={
            overview && overview.cancellationRate > 0.15
              ? "error"
              : overview && overview.cancellationRate > 0.08
                ? "warning"
                : "success"
          }
          loading={overviewQ.isLoading}
        />
        <Kpi
          label="Average fare"
          value={
            overview
              ? formatCurrency(overview.averageFare, overview.currency)
              : "—"
          }
          icon={<BarChart3 className="size-5" />}
          tone="brand"
          loading={overviewQ.isLoading}
        />
        <Kpi
          label="Active rides now"
          value={activeRides.length.toLocaleString()}
          icon={<Car className="size-5" />}
          tone={activeRides.length > 0 ? "success" : "neutral"}
          loading={activeRidesQ.isLoading}
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
          title="Revenue · last 30 days"
          subtitle={
            overview
              ? `Total period: ${formatCurrency(
                  (revenueQ.data ?? []).reduce(
                    (s, p) => s + (p.amount || 0),
                    0,
                  ),
                  overview.currency,
                )}`
              : ""
          }
          right={
            <Link
              to="/reports"
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              View reports →
            </Link>
          }
        >
          {revenueQ.isLoading ? (
            <div className="h-[280px] flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : revenueQ.error ? (
            <EmptyState
              title="Couldn't load revenue"
              description={getErrorMessage(revenueQ.error)}
            />
          ) : (revenueQ.data ?? []).length === 0 ? (
            <EmptyState title="No revenue data for this range" />
          ) : (
            <RevenueAreaChart
              points={revenueQ.data ?? []}
              currency={overview?.currency ?? "USD"}
            />
          )}
        </Card>

        <Card
          title="Driver status"
          subtitle="Real-time"
          right={
            <Link
              to="/live-dispatch"
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              Live dispatch →
            </Link>
          }
        >
          {activeDriversQ.isLoading ? (
            <div className="h-[180px] flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <StatusBar
                label="On a ride"
                value={onTrip}
                total={activeDrivers.length || 1}
                color="bg-warning-500"
              />
              <StatusBar
                label="Idle / available"
                value={idle}
                total={activeDrivers.length || 1}
                color="bg-success-500"
              />
              <div className="grid grid-cols-3 gap-2 pt-2">
                <MiniStat label="Active" value={activeDrivers.length} />
                <MiniStat label="On trip" value={onTrip} tone="warning" />
                <MiniStat label="Idle" value={idle} tone="success" />
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Action queues row */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PendingApprovalsCard
          drivers={pendingApprovals.slice(0, 5)}
          loading={driversQ.isLoading}
          totalPending={pendingApprovals.length}
        />
        <LowRatedReviewsCard
          reviews={lowReviews}
          loading={lowReviewsQ.isLoading}
        />
      </div>

      {/* Rides trend + leaderboard */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Rides · last 30 days"
          subtitle="Completed vs cancelled"
        >
          {ridesTrendQ.isLoading ? (
            <div className="h-[260px] flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (ridesTrendQ.data ?? []).length === 0 ? (
            <EmptyState title="No ride data for this range" />
          ) : (
            <RidesBarChart points={ridesTrendQ.data ?? []} />
          )}
        </Card>

        <Card
          title="Top drivers"
          subtitle={`${range.from} → ${range.to}`}
          right={
            <Link
              to="/driver-tables"
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              All drivers →
            </Link>
          }
        >
          {leaderboardQ.isLoading ? (
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
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-800 dark:text-white/90">
                        {row.driverName}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {row.rides} rides · ★ {row.rating?.toFixed?.(1) ?? "—"}
                      </p>
                    </div>
                  </div>
                  <span className="tabular-nums text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {overview
                      ? formatCurrency(row.revenue, overview.currency)
                      : row.revenue}
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
        {recentRidesQ.isLoading ? (
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
                      {r.countryCode ? regionLabel(r.countryCode) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                      {r.fare !== undefined
                        ? formatCurrency(r.fare, r.currency ?? "USD")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <RideStatusBadge status={r.status} />
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
  activeDrivers,
  activeRides,
  pendingApprovals,
  onSelect,
}: {
  code: RegionCode;
  label: string;
  currency: string;
  activeDrivers: Array<{ currentRideId?: string | null }>;
  activeRides: unknown[];
  pendingApprovals: number;
  onSelect: () => void;
}) {
  const onTrip = activeDrivers.filter((d) => d.currentRideId).length;
  const idle = activeDrivers.length - onTrip;

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
            {activeDrivers.length}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-gray-500">
            Drivers
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-white/[0.02]">
          <p className="text-base font-semibold text-warning-600">{onTrip}</p>
          <p className="text-[10px] uppercase tracking-wide text-gray-500">
            On trip
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-white/[0.02]">
          <p className="text-base font-semibold text-success-600">{idle}</p>
          <p className="text-[10px] uppercase tracking-wide text-gray-500">
            Idle
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-gray-500">Active rides now</span>
        <span className="font-semibold text-gray-800 dark:text-white/90">
          {activeRides.length}
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
    rating: number;
    comment?: string;
    reviewerName?: string;
    subjectName?: string;
    direction: string;
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
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {r.reviewerName ?? "—"} → {r.subjectName ?? "—"}
                </p>
                <span className="inline-flex items-center gap-0.5 text-xs">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3 ${
                        i < r.rating
                          ? "fill-warning-500 text-warning-500"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </span>
              </div>
              {r.comment && (
                <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                  "{r.comment}"
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

