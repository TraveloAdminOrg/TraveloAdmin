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
import { refId, regionRefId, regionDisplayName } from "../../lib/refs";
import type { Pricing } from "../../types/pricing";

type TabValue = "ALL" | string; // "ALL" or a region _id

const DEFAULT_PAGE_SIZE = 10;

export default function FareManagementPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [activeTab, setActiveTab] = useState<TabValue>("ALL");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Pricing | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Pricing | null>(null);

  // The whole fare list — one document per region, so filtering and paging
  // happen here rather than on the server. That keeps the tab counts and the
  // pager describing the same set of records.
  const { data, isLoading, isFetching, error } = usePricingsQuery();
  const deleteMutation = useDeletePricing();

  // Pull ride types (large page) so cards can resolve _id → title.
  const { data: rideTypesData } = useRideTypesQuery({ page: 1, limit: 100 });
  const { data: regions = [] } = useRegionsQuery();

  const rideTypeNames = useMemo(() => {
    const map = new Map<string, string>();
    (rideTypesData?.rideTypes ?? []).forEach((rt) => map.set(rt._id, rt.title));
    return map;
  }, [rideTypesData]);

  const regionNameById = useMemo(() => {
    const map = new Map<string, string>();
    regions.forEach((r) => map.set(r._id, r.country));
    return map;
  }, [regions]);

  const pricings = useMemo(() => data ?? [], [data]);

  // Each (region, rideType) pair is its own independent fare record. Group
  // them by region purely for display — one card per region, listing every
  // ride type priced there.
  const groupedByRegion = useMemo(() => {
    const map = new Map<string, Pricing[]>();
    pricings.forEach((p) => {
      const regionId = regionRefId(p.region);
      map.set(regionId, [...(map.get(regionId) ?? []), p]);
    });
    return map;
  }, [pricings]);

  // Which ride types (by id) already have a fare record for each region —
  // this is what lets Create Pricing add a never-before-priced ride type to
  // a region that already has other ride types priced.
  const existingRideTypeIdsByRegion = useMemo(() => {
    const map = new Map<string, Set<string>>();
    groupedByRegion.forEach((records, regionId) => {
      map.set(
        regionId,
        new Set(records.map((r) => refId(r.rideType)).filter(Boolean)),
      );
    });
    return map;
  }, [groupedByRegion]);

  const allRideTypes = useMemo(
    () => rideTypesData?.rideTypes ?? [],
    [rideTypesData],
  );

  // A region is fully priced only once every active ride type allowed in
  // that region already has a fare entry there — not merely "has a fare doc."
  const fullyPricedRegionIds = useMemo(() => {
    const result = new Set<string>();
    regions.forEach((region) => {
      const applicable = allRideTypes.filter(
        (rt) => rt.isActive && rt.allowedRegions.includes(region._id),
      );
      const priced = existingRideTypeIdsByRegion.get(region._id) ?? new Set();
      if (applicable.every((rt) => priced.has(rt._id))) {
        result.add(region._id);
      }
    });
    return result;
  }, [regions, allRideTypes, existingRideTypeIdsByRegion]);

  // Build tabs from fetched regions so they reflect what's actually configured
  // in the backend, not a hardcoded list.
  const tabs = useMemo<{ value: TabValue; label: string }[]>(
    () => [
      { value: "ALL", label: "All" },
      ...regions.map((r) => ({ value: r._id, label: r.country })),
    ],
    [regions],
  );

  // One page item per region card, not per fare record.
  const filteredGroups = useMemo(() => {
    const entries = Array.from(groupedByRegion.entries());
    return activeTab === "ALL"
      ? entries
      : entries.filter(([regionId]) => regionId === activeTab);
  }, [groupedByRegion, activeTab]);

  // Counts are global now — every ride type priced for a region counts, so the
  // badge reflects ride-type coverage, not just "does this region have a fare."
  const tabCount = (value: TabValue) =>
    value === "ALL"
      ? pricings.length
      : pricings.filter((p) => regionRefId(p.region) === value).length;

  const total = filteredGroups.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(
    () => filteredGroups.slice((currentPage - 1) * limit, currentPage * limit),
    [filteredGroups, currentPage, limit],
  );

  // Reset to page 1 when tab changes.
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // If we land past the last page (e.g. after a delete), pull back.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

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
        `Deleted pricing for ${regionDisplayName(
          pendingDelete.region,
          regionNameById,
        )}`,
      );
      setPendingDelete(null);
    } catch (err) {
      if (isNotFoundError(err)) {
        // Already gone — close the dialog rather than leaving it open on a
        // record that no longer exists.
        toast.error("That pricing was already removed.");
        setPendingDelete(null);
      } else {
        toast.error(getErrorMessage(err));
      }
    }
  };

  // Only pre-select the active region if it can actually be created.
  const defaultRegionIdForCreate =
    activeTab !== "ALL" && !fullyPricedRegionIds.has(activeTab)
      ? activeTab
      : undefined;

  // Nothing left to create once every region is fully priced.
  const allRegionsPriced =
    regions.length > 0 &&
    regions.every((r) => fullyPricedRegionIds.has(r._id));

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
          disabled={allRegionsPriced}
          title={
            allRegionsPriced
              ? "Every region already has a fare — edit one to change it."
              : undefined
          }
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
      ) : paged.length === 0 ? (
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
            className={`space-y-4 ${isFetching ? "opacity-70 transition" : ""}`}
          >
            {paged.map(([regionId, records]) => (
              <PricingCard
                key={regionId}
                region={records[0].region}
                records={records}
                rideTypeNames={rideTypeNames}
                regionNameById={regionNameById}
                onEdit={openEdit}
                onDelete={setPendingDelete}
              />
            ))}
          </div>

          {total > 0 && (
            <div className="mt-6">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                total={total}
                limit={limit}
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
        existingRideTypeIdsByRegion={existingRideTypeIdsByRegion}
        fullyPricedRegionIds={fullyPricedRegionIds}
      />

      <DeleteConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete this pricing?"
        description={
          pendingDelete
            ? `The pricing for ${regionDisplayName(
                pendingDelete.region,
                regionNameById,
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
