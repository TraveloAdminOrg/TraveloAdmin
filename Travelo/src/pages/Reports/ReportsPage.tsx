import { useState } from "react";
import {
  BarChart3,
  Car,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Download,
  Globe,
  MapPin,
  Star,
  TrendingDown,
  UserPlus,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../components/common/PageHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/ui/button/Button";
import {
  useLeaderboardQuery,
  useReportOverviewQuery,
} from "../../hooks/queries/useReports";
import { reportsApi, type ReportRangeParams } from "../../api/reports.api";
import { formatCurrency } from "../../lib/format";
import { getErrorMessage } from "../../lib/error";
import { REGIONS, regionCurrency, type RegionCode } from "../../lib/regions";

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

const EXPORTS = [
  { key: "rides", label: "Rides" },
  { key: "transactions", label: "Transactions" },
  { key: "drivers", label: "Drivers" },
  { key: "customers", label: "Customers" },
  { key: "reviews", label: "Reviews" },
];

const prettify = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function ReportsPage() {
  const [from, setFrom] = useState(daysAgoIso(30));
  const [to, setTo] = useState(todayIso());
  const [region, setRegion] = useState<RegionFilter>("all");

  const range: ReportRangeParams = {
    startDate: from,
    endDate: to,
    ...(region !== "all" && { region: region.toLowerCase() }),
  };

  // Currency follows the active region tab. "All regions" can't be expressed
  // in a single currency so it defaults to USD.
  const activeCurrency =
    region === "all" ? "USD" : regionCurrency(region);

  const overviewQ = useReportOverviewQuery(range);
  const leaderboardQ = useLeaderboardQuery(range);

  const overview = overviewQ.data;
  const leaderboard = leaderboardQ.data?.drivers ?? [];

  const handleExport = async (resource: string) => {
    try {
      toast.message(`Preparing ${resource} export…`);
      const blob = await reportsApi.export(resource, range);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resource}_${region}_${from}_${to}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${resource}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <PageMeta
        title="Reports | Travelo Admin"
        description="Performance KPIs and CSV exports."
      />

      <PageHeader
        title="Reports & Exports"
        description="Performance overview and downloadable CSV reports."
        icon={<BarChart3 size={22} />}
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-9 rounded-lg border-0 bg-transparent px-2 text-sm focus:outline-none dark:text-gray-300"
            />
            <span className="text-gray-300">→</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-9 rounded-lg border-0 bg-transparent px-2 text-sm focus:outline-none dark:text-gray-300"
            />
          </div>
        }
      />

      {/* Region tabs */}
      <RegionTabs region={region} onChange={setRegion} />

      {/* Overview KPIs */}
      {overviewQ.isLoading ? (
        <LoadingSpinner label="Loading overview…" />
      ) : overviewQ.error ? (
        <EmptyState
          title="Couldn't load overview"
          description={getErrorMessage(overviewQ.error)}
        />
      ) : overview ? (
        <div className="space-y-6">
          {/* Rides section */}
          <Section title="Rides" icon={<Car className="size-4" />}>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Kpi
                label="Total rides"
                value={(overview.rides.total ?? 0).toLocaleString()}
                icon={<Car className="size-5" />}
                tone="brand"
              />
              <Kpi
                label="Completed"
                value={(overview.rides.completed ?? 0).toLocaleString()}
                hint={`${(overview.rides.completionRate ?? 0).toFixed(1)}% completion`}
                icon={<CheckCircle2 className="size-5" />}
                tone="success"
              />
              <Kpi
                label="Cancelled"
                value={(overview.rides.cancelled ?? 0).toLocaleString()}
                hint={`${(overview.rides.cancellationRate ?? 0).toFixed(1)}% cancellation`}
                icon={<XCircle className="size-5" />}
                tone={
                  (overview.rides.cancellationRate ?? 0) > 30
                    ? "error"
                    : (overview.rides.cancellationRate ?? 0) > 15
                      ? "warning"
                      : "neutral"
                }
              />
              <Kpi
                label="Revenue"
                value={formatCurrency(
                  overview.rides.revenue ?? 0,
                  activeCurrency,
                )}
                hint={`Avg fare ${formatCurrency(overview.rides.averageFare ?? 0, activeCurrency)}`}
                icon={<CircleDollarSign className="size-5" />}
                tone="success"
              />
              <Kpi
                label="Total distance"
                value={`${(overview.rides.totalDistance ?? 0).toFixed(1)} km`}
                icon={<MapPin className="size-5" />}
                tone="brand"
              />
              <Kpi
                label="Total duration"
                value={`${Math.round(overview.rides.totalDuration ?? 0)} min`}
                icon={<Clock className="size-5" />}
                tone="brand"
              />
              <Kpi
                label="Average fare"
                value={formatCurrency(
                  overview.rides.averageFare ?? 0,
                  activeCurrency,
                )}
                icon={<TrendingDown className="size-5" />}
                tone="brand"
              />
              <Kpi
                label="Date range"
                value={`${from} → ${to}`}
                icon={null}
                tone="neutral"
                small
              />
            </div>
          </Section>

          {/* Transactions section */}
          <Section
            title="Transactions"
            icon={<Wallet className="size-4" />}
            subtitle={`${(overview.transactions.total ?? 0).toLocaleString()} total`}
          >
            {Object.keys(overview.transactions.byType ?? {}).length === 0 ? (
              <EmptyState
                title="No transactions in this range"
                variant="compact"
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(overview.transactions.byType).map(
                  ([type, info]) => (
                    <div
                      key={type}
                      className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {prettify(type)}
                        </p>
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                          {info.count} txns
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                        {formatCurrency(info.amount ?? 0, activeCurrency)}
                      </p>
                    </div>
                  ),
                )}
              </div>
            )}
          </Section>

          {/* Reviews + Users row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Section title="Reviews" icon={<Star className="size-4" />}>
              <div className="grid grid-cols-3 gap-3">
                <Kpi
                  label="Total reviews"
                  value={(overview.reviews.total ?? 0).toLocaleString()}
                  icon={<Star className="size-5" />}
                  tone="brand"
                />
                <Kpi
                  label="Avg driver"
                  value={`★ ${(overview.reviews.averageDriverRating ?? 0).toFixed(2)}`}
                  icon={<Star className="size-5" />}
                  tone="warning"
                />
                <Kpi
                  label="Avg customer"
                  value={`★ ${(overview.reviews.averageCustomerRating ?? 0).toFixed(2)}`}
                  icon={<Star className="size-5" />}
                  tone="warning"
                />
              </div>
            </Section>

            <Section title="Users" icon={<Users className="size-4" />}>
              <div className="grid grid-cols-3 gap-3">
                <Kpi
                  label="New customers"
                  value={(overview.users.newCustomers ?? 0).toLocaleString()}
                  icon={<UserPlus className="size-5" />}
                  tone="success"
                />
                <Kpi
                  label="New drivers"
                  value={(overview.users.newDrivers ?? 0).toLocaleString()}
                  icon={<UserPlus className="size-5" />}
                  tone="success"
                />
                <Kpi
                  label="Active drivers"
                  value={(overview.users.activeDrivers ?? 0).toLocaleString()}
                  icon={<Users className="size-5" />}
                  tone="brand"
                />
              </div>
            </Section>
          </div>
        </div>
      ) : null}

      {/* Exports */}
      <div className="my-6 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              CSV exports
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Download CSV files for the selected date range and region.
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {region === "all" ? "All regions" : region} · {from} → {to}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXPORTS.map((e) => (
            <Button
              key={e.key}
              size="sm"
              variant="outline"
              startIcon={<Download className="size-4" />}
              onClick={() => handleExport(e.key)}
            >
              {e.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Driver leaderboard */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-800">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Driver leaderboard
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {region === "all" ? "All regions" : region} · {from} → {to}
            </p>
          </div>
          {leaderboardQ.data && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {leaderboard.length} driver{leaderboard.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        {leaderboardQ.isLoading ? (
          <div className="p-6">
            <LoadingSpinner />
          </div>
        ) : leaderboardQ.error ? (
          <div className="p-6">
            <EmptyState
              title="Couldn't load leaderboard"
              description={getErrorMessage(leaderboardQ.error)}
            />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No data for this range" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500 dark:bg-white/[0.02] dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Driver</th>
                  <th className="px-4 py-3 text-right font-medium">Rides</th>
                  <th className="px-4 py-3 text-right font-medium">Revenue</th>
                  <th className="px-4 py-3 text-right font-medium">Avg fare</th>
                  <th className="px-4 py-3 text-right font-medium">Distance</th>
                  <th className="px-4 py-3 text-right font-medium">Duration</th>
                  <th className="px-4 py-3 text-right font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row) => (
                  <tr
                    key={row.driverId}
                    className="border-t border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {row.rank}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <img
                            src={row.driver?.image || FALLBACK_AVATAR}
                            alt=""
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                FALLBACK_AVATAR;
                            }}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-800 dark:text-white/90">
                            {row.driver?.fullName ||
                              row.driver?.username ||
                              "Unknown"}
                          </p>
                          {row.driver?.email && (
                            <p className="truncate text-[11px] text-gray-500">
                              {row.driver.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                      {row.completedRides}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-800 dark:text-white/90">
                      {formatCurrency(row.totalRevenue ?? 0, activeCurrency)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                      {formatCurrency(row.averageFare ?? 0, activeCurrency)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                      {(row.totalDistance ?? 0).toFixed(1)} km
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                      {Math.round(row.totalDuration ?? 0)} min
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                      {row.totalReviews > 0
                        ? `★ ${(row.averageRating ?? 0).toFixed(1)} (${row.totalReviews})`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

function Section({
  title,
  icon,
  subtitle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          {icon}
        </span>
        <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h2>
        {subtitle && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            · {subtitle}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function Kpi({
  label,
  value,
  hint,
  icon,
  tone,
  small,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  tone: "brand" | "success" | "warning" | "error" | "neutral";
  small?: boolean;
}) {
  const toneClass: Record<typeof tone, string> = {
    brand: "text-brand-500",
    success: "text-success-500",
    warning: "text-warning-500",
    error: "text-error-500",
    neutral: "text-gray-400",
  };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </p>
        {icon && <span className={toneClass[tone]}>{icon}</span>}
      </div>
      <p
        className={`mt-2 ${small ? "text-sm" : "text-2xl"} font-semibold text-gray-800 dark:text-white/90`}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
}
