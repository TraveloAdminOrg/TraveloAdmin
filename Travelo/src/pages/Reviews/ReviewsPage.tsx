import { useEffect, useMemo, useState } from "react";
import { Search, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import DeleteConfirmDialog from "../../components/common/DeleteConfirmDialog";
import {
  useDeleteReview,
  useReviewsQuery,
} from "../../hooks/queries/useReviews";
import { formatDateTime } from "../../lib/format";
import { getErrorMessage, isNotFoundError } from "../../lib/error";
import type { Review } from "../../types/review";

function Stars({ value }: { value: number }) {
  // Floor for full stars; show half-star indicator if fractional ≥ .25.
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.25 && value - full < 0.75;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const isFull = n <= full;
        const isHalf = !isFull && n === full + 1 && hasHalf;
        return (
          <span key={n} className="relative inline-block">
            <Star
              className={`size-4 ${
                isFull
                  ? "fill-warning-400 text-warning-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
            {isHalf && (
              <Star
                className="absolute inset-0 size-4 fill-warning-400 text-warning-400"
                style={{ clipPath: "inset(0 50% 0 0)" }}
              />
            )}
          </span>
        );
      })}
      <span className="ml-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

const shortId = (id?: string) => (id ? `${id.slice(0, 6)}…${id.slice(-4)}` : "—");

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [minRating, setMinRating] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Review | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit,
      ...(minRating !== "all" && { minRating }),
    }),
    [page, limit, minRating],
  );

  const { data, isLoading, isFetching, error } = useReviewsQuery(params);
  const deleteMutation = useDeleteReview();

  const reviews = data?.reviews ?? [];
  const meta = data?.meta;

  useEffect(() => {
    setPage(1);
  }, [minRating, limit]);

  useEffect(() => {
    if (meta && page > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  // Client-side text search across feedback / customer / driver / ride ids on the current page.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter((r) =>
      [r.customerFeedback, r.customer, r.driver, r.ride, r._id]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [reviews, search]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMutation.mutateAsync(pendingDelete._id);
      toast.success("Review deleted");
      setPendingDelete(null);
    } catch (err) {
      if (isNotFoundError(err)) {
        toast.error("Review not found.");
      } else {
        toast.error(getErrorMessage(err));
      }
    }
  };

  const hasActiveFilters = minRating !== "all" || search.trim() !== "";

  return (
    <>
      <PageMeta
        title="Reviews | Travelo Admin"
        description="Browse and moderate ride reviews."
      />

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Reviews & Ratings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {meta
            ? `${meta.total} review${meta.total === 1 ? "" : "s"} total.`
            : "Customer ratings and feedback for completed rides."}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Feedback, customer, driver, ride id…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Minimum rating
            </label>
            <select
              value={minRating}
              onChange={(e) =>
                setMinRating(
                  e.target.value === "all" ? "all" : Number(e.target.value),
                )
              }
              className="h-10 appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 [&::-ms-expand]:hidden"
            >
              <option value="all">Any rating</option>
              <option value={1}>1★ and up</option>
              <option value={2}>2★ and up</option>
              <option value={3}>3★ and up</option>
              <option value={4}>4★ and up</option>
              <option value={5}>5★ only</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setMinRating("all");
                setSearch("");
              }}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage label="Loading reviews…" />
      ) : error ? (
        <EmptyState
          title="Failed to load reviews"
          description={getErrorMessage(error)}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No matching reviews" : "No reviews yet"}
          description={
            hasActiveFilters
              ? "Try adjusting or clearing the filters."
              : "Reviews will appear here once customers rate their rides."
          }
        />
      ) : (
        <>
          <div
            className={`grid grid-cols-1 gap-4 lg:grid-cols-2 ${
              isFetching ? "opacity-70 transition" : ""
            }`}
          >
            {filtered.map((r) => (
              <div
                key={r._id}
                className="group relative rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <Stars value={r.customerRating} />
                  <button
                    type="button"
                    onClick={() => setPendingDelete(r)}
                    aria-label="Delete review"
                    title="Delete review"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 opacity-0 transition hover:bg-error-50 hover:text-error-500 group-hover:opacity-100 dark:hover:bg-error-500/10"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {r.customerFeedback ? (
                  <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                    “{r.customerFeedback}”
                  </p>
                ) : (
                  <p className="mt-3 text-sm italic text-gray-400 dark:text-gray-500">
                    No written feedback.
                  </p>
                )}

                <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-3 text-xs dark:border-gray-800">
                  <div>
                    <dt className="text-gray-400 dark:text-gray-500">Customer</dt>
                    <dd
                      className="mt-0.5 truncate font-mono text-gray-600 dark:text-gray-300"
                      title={r.customer}
                    >
                      {shortId(r.customer)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 dark:text-gray-500">Driver</dt>
                    <dd
                      className="mt-0.5 truncate font-mono text-gray-600 dark:text-gray-300"
                      title={r.driver}
                    >
                      {shortId(r.driver)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 dark:text-gray-500">Ride</dt>
                    <dd
                      className="mt-0.5 truncate font-mono text-gray-600 dark:text-gray-300"
                      title={r.ride}
                    >
                      {shortId(r.ride)}
                    </dd>
                  </div>
                </dl>

                {r.createdAt && (
                  <p className="mt-3 text-[11px] text-gray-400 dark:text-gray-500">
                    {formatDateTime(r.createdAt)}
                  </p>
                )}
              </div>
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
                onLimitChange={setLimit}
                isLoading={isFetching}
              />
            </div>
          )}
        </>
      )}

      <DeleteConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete this review?"
        description={
          pendingDelete
            ? `Review ${pendingDelete._id} will be permanently removed. This cannot be undone.`
            : ""
        }
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
