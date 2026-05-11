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
import type { Review, ReviewPerson, ReviewRide } from "../../types/review";

const FALLBACK_AVATAR = "/images/user/owner.jpg";

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

// Defensive readers for ride/customer/driver — they can be populated objects
// (current API) or bare ObjectId strings (older shape).
const personObj = (
  p: Review["customer"] | Review["driver"],
): ReviewPerson | null => (p && typeof p === "object" ? p : null);

const personName = (p: Review["customer"] | Review["driver"]): string => {
  if (!p) return "—";
  if (typeof p === "string") return `${p.slice(0, 6)}…${p.slice(-4)}`;
  return p.fullName || p.username || p.email || p._id.slice(-8) || "—";
};

const personImage = (
  p: Review["customer"] | Review["driver"],
): string | undefined => {
  if (!p || typeof p === "string") return undefined;
  return p.image;
};

const rideObj = (r: Review["ride"]): ReviewRide | null =>
  r && typeof r === "object" ? r : null;

const rideId = (r: Review["ride"]): string | undefined =>
  !r ? undefined : typeof r === "string" ? r : r._id;

// Search across populated names, emails, phones, ids — anything an admin
// might paste into the box.
function reviewMatchesSearch(r: Review, q: string): boolean {
  const c = personObj(r.customer);
  const d = personObj(r.driver);
  const haystack: (string | undefined)[] = [
    r._id,
    r.customerFeedback,
    rideId(r.ride),
    typeof r.customer === "string" ? r.customer : c?._id,
    typeof r.driver === "string" ? r.driver : d?._id,
    c?.fullName,
    c?.username,
    c?.email,
    c?.phone,
    d?.fullName,
    d?.username,
    d?.email,
    d?.phone,
  ];
  return haystack
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .some((s) => s.toLowerCase().includes(q));
}

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

  // Client-side text search across the populated fields on the current page.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter((r) => reviewMatchesSearch(r, q));
  }, [reviews, search]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMutation.mutateAsync(pendingDelete._id);
      toast.success("Review deleted");
      setPendingDelete(null);
    } catch (err) {
      if (isNotFoundError(err)) {
        toast.error("That review was already removed.");
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
          <div className="min-w-0 flex-1 sm:min-w-[220px]">
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Feedback, customer, driver, phone, ride id…"
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
              <ReviewCard
                key={r._id}
                review={r}
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
            ? "This review will be permanently removed. This cannot be undone."
            : ""
        }
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}

function PersonInline({
  label,
  person,
}: {
  label: string;
  person: Review["customer"] | Review["driver"];
}) {
  const image = personImage(person);
  return (
    <div className="flex min-w-0 items-center gap-2">
      <img
        src={image || FALLBACK_AVATAR}
        alt=""
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = FALLBACK_AVATAR;
        }}
        className="size-7 shrink-0 rounded-full bg-gray-100 object-cover dark:bg-gray-800"
      />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
          {label}
        </p>
        <p className="truncate text-xs font-medium capitalize text-gray-800 dark:text-white/90">
          {personName(person)}
        </p>
      </div>
    </div>
  );
}

function ReviewCard({
  review: r,
  onDelete,
}: {
  review: Review;
  onDelete: (r: Review) => void;
}) {
  const ride = rideObj(r.ride);
  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
      <div className="flex items-start justify-between gap-3">
        <Stars value={r.customerRating} />
        <button
          type="button"
          onClick={() => onDelete(r)}
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

      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-100 pt-3 sm:grid-cols-2 dark:border-gray-800">
        <PersonInline label="Customer" person={r.customer} />
        <PersonInline label="Driver" person={r.driver} />
      </div>

      {ride && (
        <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
          {ride.region && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {ride.region}
            </span>
          )}
          {ride.status && (
            <span className="capitalize">Ride: {ride.status}</span>
          )}
          {ride.fare !== undefined && (
            <span className="tabular-nums">
              {ride.currency ?? ""} {ride.fare}
            </span>
          )}
          {ride.completedAt && (
            <span>Completed {formatDateTime(ride.completedAt)}</span>
          )}
        </dl>
      )}

      {r.createdAt && (
        <p className="mt-3 text-[11px] text-gray-400 dark:text-gray-500">
          Reviewed {formatDateTime(r.createdAt)}
        </p>
      )}
    </div>
  );
}
