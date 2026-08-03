import { useEffect, useState } from "react";
import { Siren } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import { useSosSessionsQuery } from "../../hooks/queries/useSos";
import { REGIONS, type RegionCode } from "../../lib/regions";
import { formatDateTime } from "../../lib/format";
import { getErrorMessage } from "../../lib/error";
import {
  SOS_STATUS_LABEL,
  SOS_STATUS_TONE,
  counterpartLabel,
  formatDuration,
  initiatorLabel,
  partyName,
  shortRideRef,
} from "../../lib/sos";
import type { SosSession, SosStatus } from "../../types/sos";

type RegionTab = "ALL" | RegionCode;

const STATUS_OPTIONS: { value: SosStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "ringing", label: "Ringing" },
  { value: "active", label: "In call" },
  { value: "ended", label: "Ended" },
  { value: "missed", label: "Missed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "failed", label: "Failed" },
];

const DEFAULT_PAGE_SIZE = 10;

function SosStatusBadge({ status }: { status: SosStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
        SOS_STATUS_TONE[status] ??
        "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400"
      }`}
    >
      {SOS_STATUS_LABEL[status] ?? status}
    </span>
  );
}

function SosRow({ session }: { session: SosSession }) {
  const counterpart = counterpartLabel(session);
  const operator =
    session.admin && typeof session.admin === "object"
      ? (session.admin.email ?? "—")
      : "—";

  return (
    <tr className="border-t border-gray-100 text-gray-700 dark:border-gray-800 dark:text-gray-300">
      <td className="px-4 py-3 font-mono text-xs">{shortRideRef(session)}</td>
      <td className="px-4 py-3">
        <div className="font-medium text-gray-800 dark:text-white/90">
          {partyName(session.initiator)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {initiatorLabel(session)}
        </div>
      </td>
      <td className="px-4 py-3">
        <div>{counterpart.name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {counterpart.label}
        </div>
      </td>
      <td className="px-4 py-3 text-xs">{operator}</td>
      <td className="px-4 py-3">
        <SosStatusBadge status={session.status} />
      </td>
      <td className="px-4 py-3 text-right font-mono text-xs tabular-nums">
        {session.durationSeconds ? formatDuration(session.durationSeconds) : "—"}
      </td>
      <td className="px-4 py-3 text-xs">{formatDateTime(session.createdAt)}</td>
      <td className="px-4 py-3 text-xs">
        {session.acceptedAt ? formatDateTime(session.acceptedAt) : "—"}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
        {session.endReason ?? "—"}
      </td>
    </tr>
  );
}

/**
 * Audit trail for emergency calls. This is the reason SOS sessions are persisted
 * rather than kept in Redis like normal calls: a missed emergency has to be
 * visible after the fact, not just while it is ringing.
 */
export default function SosHistoryPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [activeRegion, setActiveRegion] = useState<RegionTab>("ALL");
  const [status, setStatus] = useState<SosStatus | "all">("all");

  const { data, isLoading, isFetching, error } = useSosSessionsQuery({
    page,
    limit,
    region: activeRegion === "ALL" ? undefined : activeRegion,
    status: status === "all" ? undefined : status,
  });

  const sessions = data?.sosSessions ?? [];
  const meta = data?.meta;

  useEffect(() => {
    setPage(1);
  }, [activeRegion, status]);

  useEffect(() => {
    if (meta && page > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  return (
    <>
      <PageMeta
        title="Emergency SOS | Travelo Admin"
        description="Emergency SOS calls raised by riders and drivers."
      />

      <div className="mb-6 flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-white/90">
          <Siren className="size-5 text-error-500" />
          Emergency SOS
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {meta
            ? `${meta.total} SOS request${meta.total === 1 ? "" : "s"} recorded.`
            : "Every SOS raised during an in-progress ride."}
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

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as SosStatus | "all")}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage label="Loading SOS history…" />
      ) : error ? (
        <EmptyState
          title="Failed to load SOS history"
          description={getErrorMessage(error)}
        />
      ) : sessions.length === 0 ? (
        <EmptyState
          title="No SOS requests"
          description="Nothing has been raised for this filter — which is the good outcome."
        />
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
                  <th className="px-4 py-3 font-medium">Raised by</th>
                  <th className="px-4 py-3 font-medium">Other party</th>
                  <th className="px-4 py-3 font-medium">Operator</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Raised</th>
                  <th className="px-4 py-3 font-medium">Answered</th>
                  <th className="px-4 py-3 font-medium">End reason</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <SosRow key={s._id} session={s} />
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
