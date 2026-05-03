import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import Button from "../../components/ui/button/Button";
import { useDriversQuery } from "../../hooks/queries/useDrivers";
import {
  useApproveDriver,
  useRejectDriver,
} from "../../hooks/queries/useDriverApprovals";
import { regionLabel } from "../../lib/regions";
import { formatDateTime } from "../../lib/format";
import { getErrorMessage } from "../../lib/error";
import type { Driver } from "../../types/driver";

const FALLBACK_AVATAR = "/images/user/owner.jpg";
const DEFAULT_PAGE_SIZE = 10;

export default function DriverApprovalsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);

  // The list endpoint is currently the same drivers endpoint — we filter client-side
  // to drivers who have uploaded docs but aren't yet approved. When the backend ships
  // a dedicated /admin/drivers/pending-approval endpoint, swap this query.
  const { data, isLoading, isFetching, error } = useDriversQuery({ page, limit });

  const approveMutation = useApproveDriver();
  const rejectMutation = useRejectDriver();

  const drivers = data?.drivers ?? [];
  const meta = data?.meta;

  const pending = drivers.filter(
    (d) => d.isDocumentUploaded && !d.isApproved && !d.isBlocked && !d.isDeleted,
  );

  useEffect(() => {
    if (meta && page > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  const onApprove = async (d: Driver) => {
    try {
      await approveMutation.mutateAsync(d._id);
      toast.success(`Approved ${d.fullName || d.username}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onReject = async (d: Driver) => {
    const reason = window.prompt("Reason for rejection (optional):") ?? undefined;
    try {
      await rejectMutation.mutateAsync({ id: d._id, reason });
      toast.success(`Rejected ${d.fullName || d.username}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <PageMeta
        title="Driver Approvals | Travelo Admin"
        description="Review and approve driver document submissions."
      />

      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Driver Approvals
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {pending.length} pending on this page · review documents and approve to onboard.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage label="Loading…" />
      ) : error ? (
        <EmptyState title="Failed to load drivers" description={getErrorMessage(error)} />
      ) : pending.length === 0 ? (
        <EmptyState
          title="No pending approvals on this page"
          description="Drivers with uploaded documents who haven't been approved will appear here."
        />
      ) : (
        <>
          <div
            className={`space-y-3 ${isFetching ? "opacity-70 transition" : ""}`}
          >
            {pending.map((d) => {
              const name = d.fullName || d.username;
              const isApproving =
                approveMutation.isPending &&
                approveMutation.variables === d._id;
              const isRejecting =
                rejectMutation.isPending &&
                rejectMutation.variables?.id === d._id;
              return (
                <div
                  key={d._id}
                  className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <img
                        src={d.image || FALLBACK_AVATAR}
                        alt={name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            FALLBACK_AVATAR;
                        }}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold capitalize text-gray-800 dark:text-white/90">
                        {name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{d.email}</span>
                        <span>·</span>
                        <span>{d.phone}</span>
                        <span>·</span>
                        <span>{regionLabel(d.country)}</span>
                        {d.rideType && (
                          <>
                            <span>·</span>
                            <span>{d.rideType}</span>
                          </>
                        )}
                      </div>
                      {d.createdAt && (
                        <p className="mt-1 text-[10px] text-gray-400">
                          Submitted {formatDateTime(d.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/DriverProfile/${d._id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                    >
                      <ExternalLink className="size-3.5" />
                      Review docs
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReject(d)}
                      disabled={isRejecting || isApproving}
                      startIcon={<X className="size-4" />}
                    >
                      {isRejecting ? "Rejecting…" : "Reject"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onApprove(d)}
                      disabled={isApproving || isRejecting}
                      startIcon={<Check className="size-4" />}
                    >
                      {isApproving ? "Approving…" : "Approve"}
                    </Button>
                  </div>
                </div>
              );
            })}
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
