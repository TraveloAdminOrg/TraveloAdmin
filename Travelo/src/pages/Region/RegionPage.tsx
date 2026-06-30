import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import DeleteConfirmDialog from "../../components/common/DeleteConfirmDialog";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import RegionFormModal from "../../components/Region/RegionFormModal";
import {
  useRegionsPageQuery,
  useDeleteRegion,
} from "../../hooks/queries/useRegions";
import { getErrorMessage, isNotFoundError } from "../../lib/error";
import { formatDate } from "../../lib/format";
import type { Region } from "../../types/region";

const DEFAULT_PAGE_SIZE = 10;

export default function RegionPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Region | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Region | null>(null);

  const { data, isLoading, isFetching, error } = useRegionsPageQuery({
    page,
    limit,
  });
  const deleteMutation = useDeleteRegion();

  const regions = data?.regions ?? [];
  const meta = data?.meta;

  // If a deletion empties the last page, step back so we don't show a blank table.
  useEffect(() => {
    if (meta && page > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  const openCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const openEdit = (r: Region) => {
    setEditing(r);
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
      toast.success(`Deleted ${pendingDelete.country}`);
      setPendingDelete(null);
    } catch (err) {
      if (isNotFoundError(err)) {
        toast.error("That region was already removed.");
        setPendingDelete(null);
      } else {
        toast.error(getErrorMessage(err));
      }
    }
  };

  return (
    <>
      <PageMeta
        title="Regions | Travelo Admin"
        description="Manage operating regions — country, code, currency, and availability."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Regions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure the countries Travelo operates in, each with its own
            currency.
          </p>
        </div>

        <Button
          size="sm"
          onClick={openCreate}
          startIcon={<Plus className="size-4" />}
        >
          Create Region
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner fullPage label="Loading regions…" />
      ) : error ? (
        <EmptyState
          title="Failed to load regions"
          description={getErrorMessage(error)}
        />
      ) : regions.length === 0 ? (
        <EmptyState
          title="No regions yet"
          description="Add your first operating region to start onboarding drivers and riders."
          action={
            <Button
              size="sm"
              onClick={openCreate}
              startIcon={<Plus className="size-4" />}
            >
              Create Region
            </Button>
          }
        />
      ) : (
        <>
          <div
            className={`overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 ${
              isFetching ? "opacity-70 transition" : ""
            }`}
          >
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      Country
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      Code
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      Currency
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      Cities
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      Created
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {regions.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell className="px-5 py-4 text-sm font-medium capitalize text-gray-800 dark:text-white/90">
                        {r.country}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm uppercase text-gray-600 dark:text-gray-300">
                        {r.code}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {r.currency}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {r.cities?.length ?? 0}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge
                          size="sm"
                          color={r.isActive ? "success" : "light"}
                        >
                          {r.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {r.createdAt ? formatDate(r.createdAt) : "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            aria-label={`Edit ${r.country}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-white/5"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(r)}
                            aria-label={`Delete ${r.country}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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

      <RegionFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        region={editing}
      />

      <DeleteConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete this region?"
        description={
          pendingDelete
            ? `${pendingDelete.country} (${pendingDelete.code}) will be permanently removed. This cannot be undone.`
            : ""
        }
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
