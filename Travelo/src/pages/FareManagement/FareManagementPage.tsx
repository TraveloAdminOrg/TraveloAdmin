import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import DeleteConfirmDialog from "../../components/common/DeleteConfirmDialog";
import Button from "../../components/ui/button/Button";
import PricingCard from "../../components/FareManagement/PricingCard";
import PricingFormModal from "../../components/FareManagement/PricingFormModal";
import {
  useDeletePricing,
  usePricingsQuery,
} from "../../hooks/queries/usePricings";
import { useRideTypesQuery } from "../../hooks/queries/useRideTypes";
import { useRegionsQuery } from "../../hooks/queries/useRegions";
import { getErrorMessage, isNotFoundError } from "../../lib/error";
import type { Pricing } from "../../types/pricing";

type TabValue = "ALL" | string; // "ALL" or a region _id

const DEFAULT_PAGE_SIZE = 10;

// Read the region id whether the API returned an object or a string.
const regionRefId = (r: Pricing["region"] | null | undefined): string => {
  if (!r) return "";
  return typeof r === "string" ? r : r._id ?? "";
};

const regionDisplayName = (r: Pricing["region"] | null | undefined): string => {
  if (!r || typeof r === "string") return "—";
  return r.country || r.code || "—";
};

export default function FareManagementPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [activeTab, setActiveTab] = useState<TabValue>("ALL");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Pricing | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Pricing | null>(null);

  const {
    data,
    isLoading,
    isFetching,
    error,
  } = usePricingsQuery({ page, limit });
  const deleteMutation = useDeletePricing();

  // Pull ride types (large page) so cards can resolve _id → title.
  const { data: rideTypesData } = useRideTypesQuery({ page: 1, limit: 100 });
  const { data: regions = [] } = useRegionsQuery();

  const rideTypeNames = useMemo(() => {
    const map = new Map<string, string>();
    (rideTypesData?.rideTypes ?? []).forEach((rt) => map.set(rt._id, rt.title));
    return map;
  }, [rideTypesData]);

  const pricings = data?.pricings ?? [];
  const meta = data?.meta;

  // Build tabs from fetched regions so they reflect what's actually configured
  // in the backend, not a hardcoded list.
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

  // Reset to page 1 when tab changes.
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // If we land past the last page (e.g. after delete), pull back.
  useEffect(() => {
    if (meta && page > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  const filtered = useMemo(
    () =>
      activeTab === "ALL"
        ? pricings
        : pricings.filter((p) => regionRefId(p.region) === activeTab),
    [pricings, activeTab],
  );

  // Counts on the current page only — meaningful as a hint, not a global count
  // (server-side region filtering would be needed for that).
  const tabCount = (value: TabValue) =>
    value === "ALL"
      ? pricings.length
      : pricings.filter((p) => regionRefId(p.region) === value).length;

  const openCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const openEdit = (p: Pricing) => {
    setEditing(p);
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
        `Deleted pricing for ${regionDisplayName(pendingDelete.region)}`,
      );
      setPendingDelete(null);
    } catch (err) {
      if (isNotFoundError(err)) {
        toast.error("Delete isn't available yet — backend endpoint not implemented.");
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
        title="Fare Management | Travelo Admin"
        description="Manage pricing rules per region and ride type."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Fare Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Define base fares, per-km / per-minute rates, minimums, and
            cancellation fees for each region's ride types.
          </p>
        </div>

        <Button
          size="sm"
          onClick={openCreate}
          startIcon={<Plus className="size-4" />}
        >
          Create Pricing
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
        <LoadingSpinner fullPage label="Loading pricings…" />
      ) : error ? (
        <EmptyState
          title="Failed to load pricings"
          description={getErrorMessage(error)}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={
            activeTab === "ALL"
              ? "No pricings yet"
              : `No pricings for ${
                  regionNameById.get(activeTab) ?? "this region"
                }`
          }
          description="Create one to get started."
          action={
            <Button
              size="sm"
              onClick={openCreate}
              startIcon={<Plus className="size-4" />}
            >
              Create Pricing
            </Button>
          }
        />
      ) : (
        <>
          <div
            className={`space-y-4 ${
              isFetching ? "opacity-70 transition" : ""
            }`}
          >
            {filtered.map((p) => (
              <PricingCard
                key={p._id}
                pricing={p}
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

      <PricingFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        pricing={editing}
        defaultRegionId={defaultRegionIdForCreate}
      />

      <DeleteConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete this pricing?"
        description={
          pendingDelete
            ? `The pricing for ${regionDisplayName(
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
