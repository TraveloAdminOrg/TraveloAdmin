import { useState } from "react";
import { Download, DollarSign, Car, Users, AlertCircle, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../components/common/PageHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/ui/button/Button";
import {
  useReportOverviewQuery,
  useDriversReportQuery,
} from "../../hooks/queries/useReports";
import { reportsApi, type ReportRangeParams } from "../../api/reports.api";
import { formatCurrency } from "../../lib/format";
import { getErrorMessage } from "../../lib/error";

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
  { key: "users", label: "Users" },
  { key: "reviews", label: "Reviews" },
];

export default function ReportsPage() {
  const [from, setFrom] = useState(daysAgoIso(30));
  const [to, setTo] = useState(todayIso());

  const range: ReportRangeParams = { from, to };

  const overviewQ = useReportOverviewQuery(range);
  const driversQ = useDriversReportQuery(range);

  const overview = overviewQ.data;
  const leaderboard = driversQ.data ?? [];

  const handleExport = async (resource: string) => {
    try {
      toast.message(`Preparing ${resource} export…`);
      const blob = await reportsApi.export(resource, range);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resource}_${from}_${to}.csv`;
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

      {/* Overview KPIs */}
      {overviewQ.isLoading ? (
        <LoadingSpinner label="Loading overview…" />
      ) : overviewQ.error ? (
        <EmptyState
          title="Couldn't load overview"
          description={getErrorMessage(overviewQ.error)}
        />
      ) : overview ? (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi
            label="Today's revenue"
            value={formatCurrency(overview.todayRevenue, overview.currency)}
            icon={<DollarSign className="size-5" />}
            tone="success"
          />
          <Kpi
            label="Today's rides"
            value={overview.todayRides.toString()}
            icon={<Car className="size-5" />}
            tone="brand"
          />
          <Kpi
            label="Active drivers"
            value={overview.activeDrivers.toString()}
            icon={<Users className="size-5" />}
            tone="brand"
          />
          <Kpi
            label="Pending approvals"
            value={overview.pendingApprovals.toString()}
            icon={<AlertCircle className="size-5" />}
            tone="warning"
          />
          <Kpi
            label="Active users"
            value={overview.activeUsers.toString()}
            icon={<Users className="size-5" />}
            tone="brand"
          />
          <Kpi
            label="Cancellation rate"
            value={`${(overview.cancellationRate * 100).toFixed(1)}%`}
            icon={<AlertCircle className="size-5" />}
            tone={
              overview.cancellationRate > 0.15
                ? "error"
                : overview.cancellationRate > 0.08
                  ? "warning"
                  : "success"
            }
          />
          <Kpi
            label="Average fare"
            value={formatCurrency(overview.averageFare, overview.currency)}
            icon={<DollarSign className="size-5" />}
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
      ) : null}

      {/* Exports */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            CSV exports
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Range: {from} → {to}
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
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Top drivers ({from} → {to})
          </h2>
        </div>
        {driversQ.isLoading ? (
          <div className="p-6">
            <LoadingSpinner />
          </div>
        ) : driversQ.error ? (
          <div className="p-6">
            <EmptyState
              title="Couldn't load leaderboard"
              description={getErrorMessage(driversQ.error)}
            />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No data for this range" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500 dark:bg-white/[0.02] dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 text-right font-medium">Rides</th>
                <th className="px-4 py-3 text-right font-medium">Revenue</th>
                <th className="px-4 py-3 text-right font-medium">Rating</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, i) => (
                <tr
                  key={row.driverId}
                  className="border-t border-gray-100 dark:border-gray-800"
                >
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-white/90">
                    {row.driverName}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                    {row.rides}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                    {row.revenue}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                    {row.rating?.toFixed(1) ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function Kpi({
  label,
  value,
  icon,
  tone,
  small,
}: {
  label: string;
  value: string;
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
    </div>
  );
}
