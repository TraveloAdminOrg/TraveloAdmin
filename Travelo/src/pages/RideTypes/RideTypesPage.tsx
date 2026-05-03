import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import Button from "../../components/ui/button/Button";
import RideTypeCard from "../../components/RideTypes/RideTypeCard";
import RideTypeFormModal from "../../components/RideTypes/RideTypeFormModal";
import DeleteConfirmDialog from "../../components/common/DeleteConfirmDialog";
import {
  useDeleteRideType,
  useRideTypesQuery,
} from "../../hooks/queries/useRideTypes";
import { REGIONS, type RegionCode } from "../../lib/regions";
import { getErrorMessage, isNotFoundError } from "../../lib/error";
import type { RideType } from "../../types/rideType";

type TabValue = "ALL" | RegionCode;

const TABS: { value: TabValue; label: string }[] = [
  { value: "ALL", label: "All" },
  ...REGIONS.map((r) => ({ value: r.code, label: r.label })),
];

const DEFAULT_PAGE_SIZE = 10;

export default function RideTypesPage() {
  // ---- Pagination state ----
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);

  // ---- Filters (client-side, applied to current page) ----
  const [activeTab, setActiveTab] = useState<TabValue>("ALL");
  const [search, setSearch] = useState("");

  // ---- Modals ----
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<RideType | null>(null);
  const [pendingDelete, setPendingDelete] = useState<RideType | null>(null);

  const { data, isLoading, isFetching, error } = useRideTypesQuery({
    page,
    limit,
  });
  const deleteMutation = useDeleteRideType();

  const rideTypes = data?.rideTypes ?? [];
  const meta = data?.meta;

  // Reset to page 1 whenever a filter changes (avoids landing on empty pages).
  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

  // If the server says we have N pages and we're past N (e.g. after delete), pull back.
  useEffect(() => {
    if (meta && page > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rideTypes
      .filter((rt) =>
        activeTab === "ALL" ? true : rt.allowedRegions.includes(activeTab),
      )
      .filter((rt) => (q ? rt.title.toLowerCase().includes(q) : true));
  }, [rideTypes, activeTab, search]);

  const openCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const openEdit = (rt: RideType) => {
    setEditing(rt);
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
      toast.success(`Deleted "${pendingDelete.title}"`);
      setPendingDelete(null);
    } catch (err) {
      if (isNotFoundError(err)) {
        toast.error("Delete isn't available yet — backend endpoint not implemented.");
      } else {
        toast.error(getErrorMessage(err));
      }
    }
  };

  const defaultRegionForCreate =
    activeTab !== "ALL" ? (activeTab as RegionCode) : undefined;

  // Region tab counts use only the current page (until backend supports a region filter).
  const tabCount = (value: TabValue) =>
    value === "ALL"
      ? rideTypes.length
      : rideTypes.filter((rt) =>
          rt.allowedRegions.includes(value as RegionCode),
        ).length;

  return (
    <>
      <PageMeta
        title="Ride Types | Travelo Admin"
        description="Manage vehicle categories per region."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Ride Types
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Vehicle categories available across regions.
          </p>
        </div>

        <Button
          size="sm"
          onClick={openCreate}
          startIcon={<Plus className="size-4" />}
        >
          Create Ride Type
        </Button>
      </div>

      {/* Region tabs + search */}
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Filter by region"
          className="flex flex-wrap gap-1"
        >
          {TABS.map((t) => {
            const isActive = activeTab === t.value;
            return (
              <button
                key={t.value}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(t.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
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

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner fullPage label="Loading ride types…" />
      ) : error ? (
        <EmptyState
          title="Failed to load ride types"
          description={getErrorMessage(error)}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={
            search
              ? "No matches"
              : activeTab === "ALL"
                ? "No ride types yet"
                : `No ride types in ${TABS.find((t) => t.value === activeTab)?.label}`
          }
          description={
            search
              ? "Try a different search term."
              : "Create your first ride type to get started."
          }
          action={
            !search && (
              <Button
                size="sm"
                onClick={openCreate}
                startIcon={<Plus className="size-4" />}
              >
                Create Ride Type
              </Button>
            )
          }
        />
      ) : (
        <>
          <div
            className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
              isFetching ? "opacity-70 transition" : ""
            }`}
          >
            {filtered.map((rt) => (
              <RideTypeCard
                key={rt._id}
                rideType={rt}
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

      {/* Modals */}
      <RideTypeFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        rideType={editing}
        defaultRegion={defaultRegionForCreate}
      />

      <DeleteConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete this ride type?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" will be permanently removed. This cannot be undone.`
            : ""
        }
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
