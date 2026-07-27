import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import DeleteConfirmDialog from "../../components/common/DeleteConfirmDialog";
import Button from "../../components/ui/button/Button";
import ExtraChargeCard from "../../components/ExtraCharges/ExtraChargeCard";
import ExtraChargeFormModal from "../../components/ExtraCharges/ExtraChargeFormModal";
import {
  useExtraChargesQuery,
  useDeleteExtraCharge,
} from "../../hooks/queries/useExtraCharges";
import { useRegionsQuery } from "../../hooks/queries/useRegions";
import { getErrorMessage, isNotFoundError } from "../../lib/error";
import { regionRefId, regionDisplayName } from "../../lib/refs";
import type { ExtraChargeConfig } from "../../types/extraCharge";

type TabValue = "ALL" | string;

const DEFAULT_PAGE_SIZE = 10;

export default function ExtraChargesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [activeTab, setActiveTab] = useState<TabValue>("ALL");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExtraChargeConfig | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<ExtraChargeConfig | null>(null);

  const { data, isLoading, isFetching, error } = useExtraChargesQuery({
    page,
    limit,
  });
  const deleteMutation = useDeleteExtraCharge();

  const { data: regions = [] } = useRegionsQuery();

  const configs = useMemo(() => data?.extraCharges ?? [], [data]);
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

  // One config per region: gate Create once every region is covered, and
  // hide already-configured regions inside the create form.
  const configuredRegionIds = useMemo(
    () => new Set(configs.map((c) => regionRefId(c.region)).filter(Boolean)),
    [configs],
  );
  const allRegionsConfigured =
    regions.length > 0 && regions.every((r) => configuredRegionIds.has(r._id));

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
        ? configs
        : configs.filter((c) => regionRefId(c.region) === activeTab),
    [configs, activeTab],
  );

  const tabCount = (value: TabValue) =>
    value === "ALL"
      ? configs.length
      : configs.filter((c) => regionRefId(c.region) === value).length;

  const openCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const openEdit = (c: ExtraChargeConfig) => {
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
        `Deleted extra charges for ${regionDisplayName(
          pendingDelete.region,
          regionNameById,
        )}`,
      );
      setPendingDelete(null);
    } catch (err) {
      if (isNotFoundError(err)) {
        toast.error("That configuration was already removed.");
        setPendingDelete(null);
      } else {
        toast.error(getErrorMessage(err));
      }
    }
  };

  const defaultRegionIdForCreate =
    activeTab !== "ALL" && !configuredRegionIds.has(activeTab)
      ? activeTab
      : undefined;

  return (
    <>
      <PageMeta
        title="Extra Charges | Travelo Admin"
        description="Configure the fixed surcharges drivers can apply before finishing a ride."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Extra Charges
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Per-region amounts for parking, congestion, airport, toll, cleaning
            and pet charges. Drivers only tick a box — these amounts are what
            riders pay. Completed rides keep the amounts they were billed.
          </p>
        </div>

        <Button
          size="sm"
          onClick={openCreate}
          disabled={allRegionsConfigured}
          startIcon={<Plus className="size-4" />}
        >
          Create Extra Charges
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
        <LoadingSpinner fullPage label="Loading extra charges…" />
      ) : error ? (
        <EmptyState
          title="Failed to load extra charges"
          description={getErrorMessage(error)}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={
            activeTab === "ALL"
              ? "No extra charges yet"
              : `No extra charges for ${
                  regionNameById.get(activeTab) ?? "this region"
                }`
          }
          description="Create a configuration so drivers can apply fixed surcharges at ride completion."
          action={
            <Button
              size="sm"
              onClick={openCreate}
              disabled={allRegionsConfigured}
              startIcon={<Plus className="size-4" />}
            >
              Create Extra Charges
            </Button>
          }
        />
      ) : (
        <>
          <div
            className={`space-y-4 ${isFetching ? "opacity-70 transition" : ""}`}
          >
            {filtered.map((c) => (
              <ExtraChargeCard
                key={c._id}
                config={c}
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

      <ExtraChargeFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        config={editing}
        defaultRegionId={defaultRegionIdForCreate}
        configuredRegionIds={configuredRegionIds}
      />

      <DeleteConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete this configuration?"
        description={
          pendingDelete
            ? `Extra charges for ${regionDisplayName(
                pendingDelete.region,
                regionNameById,
              )} will be permanently removed. Drivers there will no longer see any finish-screen charges. Completed rides keep their billed amounts.`
            : ""
        }
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
