import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import DeleteConfirmDialog from "../../components/common/DeleteConfirmDialog";
import Button from "../../components/ui/button/Button";
import CommissionCard from "../../components/Commission/CommissionCard";
import CommissionFormModal from "../../components/Commission/CommissionFormModal";
import {
  useCommissionsQuery,
  useDeleteCommission,
} from "../../hooks/queries/useCommissions";
import { useRideTypesQuery } from "../../hooks/queries/useRideTypes";
import { useRegionsQuery } from "../../hooks/queries/useRegions";
import { getErrorMessage, isNotFoundError } from "../../lib/error";
import type { Commission } from "../../types/commission";

type TabValue = "ALL" | string;

const DEFAULT_PAGE_SIZE = 10;

const regionRefId = (r: Commission["region"] | null | undefined): string => {
  if (!r) return "";
  return typeof r === "string" ? r : r._id ?? "";
};

const regionDisplayName = (
  r: Commission["region"] | null | undefined,
): string => {
  if (!r || typeof r === "string") return "—";
  return r.country || r.code || "—";
};

export default function CommissionPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [activeTab, setActiveTab] = useState<TabValue>("ALL");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Commission | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Commission | null>(null);

  const { data, isLoading, isFetching, error } = useCommissionsQuery({
    page,
    limit,
  });
  const deleteMutation = useDeleteCommission();

  const { data: rideTypesData } = useRideTypesQuery({ page: 1, limit: 100 });
  const { data: regions = [] } = useRegionsQuery();

  const rideTypeNames = useMemo(() => {
    const map = new Map<string, string>();
    (rideTypesData?.rideTypes ?? []).forEach((rt) =>
      map.set(rt._id, rt.title),
    );
    return map;
  }, [rideTypesData]);

  const commissions = data?.commissions ?? [];
  const meta = data?.meta;

  const tabs = useMemo<{ value: TabValue; label: string }[]>(() => {
    const base: { value: TabValue; label: string }[] = [
      { value: "ALL", label: "All" },
    ];
    return [
      ...base,
      ...regions.map((r) => ({ value: r._id, label: r.country })),
    ];
  }, [regions]);

  const regionNameById = useMemo(() => {
    const map = new Map<string, string>();
    regions.forEach((r) => map.set(r._id, r.country));
    return map;
  }, [regions]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (meta && page > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  const filtered = useMemo(
    () =>
      activeTab === "ALL"
        ? commissions
        : commissions.filter((c) => regionRefId(c.region) === activeTab),
    [commissions, activeTab],
  );

  const tabCount = (value: TabValue) =>
    value === "ALL"
      ? commissions.length
      : commissions.filter((c) => regionRefId(c.region) === value).length;

  const openCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const openEdit = (c: Commission) => {
    setEditing(c);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMutation.mutateAsync(pendingDelete._id);
      toast.success(
        `Deleted commission for ${regionDisplayName(pendingDelete.region)}`,
      );
      setPendingDelete(null);
    } catch (err) {
      if (isNotFoundError(err)) {
        toast.error("That commission was already removed.");
      } else {
        toast.error(getErrorMessage(err));
      }
    }
  };

  const defaultRegionIdForCreate =
    activeTab !== "ALL" ? activeTab : undefined;

  return (
    <>
      <PageMeta
        title="Commission | Travelo Admin"
        description="Manage commission rules per region, ride type, and booking flow."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Commission
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Define what the platform charges per ride — percentage or fixed,
            scoped to ride type and booking flow.
          </p>
        </div>

        <Button
          size="sm"
          onClick={openCreate}
          startIcon={<Plus className="size-4" />}
        >
          Create Commission
        </Button>
      </div>

      {/* Region tabs */}
      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
        <div
          role="tablist"
          aria-label="Filter by region"
          className="flex flex-wrap gap-1"
        >
          {tabs.map((t) => {
            const isActive = activeTab === t.value;
            return (
              <button
                key={t.value}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(t.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
                  isActive
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                }`}
              >
                {t.label}
                <span
                  className={`ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {tabCount(t.value)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner fullPage label="Loading commissions…" />
      ) : error ? (
        <EmptyState
          title="Failed to load commissions"
          description={getErrorMessage(error)}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={
            activeTab === "ALL"
              ? "No commissions yet"
              : `No commissions for ${
                  regionNameById.get(activeTab) ?? "this region"
                }`
          }
          description="Create one to start collecting platform commission on rides."
          action={
            <Button
              size="sm"
              onClick={openCreate}
              startIcon={<Plus className="size-4" />}
            >
              Create Commission
            </Button>
          }
        />
      ) : (
        <>
          <div
            className={`space-y-4 ${isFetching ? "opacity-70 transition" : ""}`}
          >
            {filtered.map((c) => (
              <CommissionCard
                key={c._id}
                commission={c}
                rideTypeNames={rideTypeNames}
                regionNameById={regionNameById}
                onEdit={openEdit}
                onDelete={setPendingDelete}
              />
            ))}
          </div>

          {meta && meta.total > 0 && (
            <div className="mt-6">
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                limit={meta.limit}
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                isLoading={isFetching}
              />
            </div>
          )}
        </>
      )}

      <CommissionFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        commission={editing}
        defaultRegionId={defaultRegionIdForCreate}
      />

      <DeleteConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete this commission?"
        description={
          pendingDelete
            ? `The commission for ${regionDisplayName(
                pendingDelete.region,
              )} will be permanently removed. This cannot be undone.`
            : ""
        }
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
