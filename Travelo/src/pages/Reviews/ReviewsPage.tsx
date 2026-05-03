import { useEffect, useState } from "react";
import { Eye, EyeOff, Star } from "lucide-react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import Button from "../../components/ui/button/Button";
import {
  useReviewsQuery,
  useHideReview,
  useUnhideReview,
} from "../../hooks/queries/useReviews";
import { formatDate } from "../../lib/format";
import { getErrorMessage } from "../../lib/error";
import type { ReviewDirection } from "../../types/review";

const FALLBACK_AVATAR = "/images/user/owner.jpg";
const DIRECTIONS: { value: ReviewDirection | "all"; label: string }[] = [
  { value: "all", label: "All directions" },
  { value: "rider_to_driver", label: "Rider → Driver" },
  { value: "driver_to_rider", label: "Driver → Rider" },
];

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`size-3.5 ${
            n <= value
              ? "fill-warning-400 text-warning-400"
              : "text-gray-300 dark:text-gray-600"
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-gray-700 dark:text-gray-300">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [direction, setDirection] = useState<ReviewDirection | "all">("all");
  const [minRating, setMinRating] = useState<number | "all">("all");

  const { data, isLoading, isFetching, error } = useReviewsQuery({
    page,
    limit,
    direction: direction === "all" ? undefined : direction,
    minRating: minRating === "all" ? undefined : minRating,
  });

  const hideMutation = useHideReview();
  const unhideMutation = useUnhideReview();

  const reviews = data?.reviews ?? [];
  const meta = data?.meta;

  useEffect(() => {
    setPage(1);
  }, [direction, minRating]);

  useEffect(() => {
    if (meta && page > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  const onToggleHide = async (id: string, hidden: boolean) => {
    try {
      if (hidden) {
        await unhideMutation.mutateAsync(id);
        toast.success("Review unhidden");
      } else {
        await hideMutation.mutateAsync(id);
        toast.success("Review hidden");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

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
          {meta ? `${meta.total} reviews total.` : "All ride reviews."}
        </p>
      </div>

      <div className="mb-5 flex flex-wrap gap-3 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
        <select
          value={direction}
          onChange={(e) =>
            setDirection(e.target.value as ReviewDirection | "all")
          }
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          {DIRECTIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        <select
          value={minRating}
          onChange={(e) =>
            setMinRating(
              e.target.value === "all" ? "all" : Number(e.target.value),
            )
          }
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          <option value="all">Any rating</option>
          <option value={1}>1 star and up</option>
          <option value={2}>2 stars and up</option>
          <option value={3}>3 stars and up</option>
          <option value={4}>4 stars and up</option>
          <option value={5}>5 stars only</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage label="Loading reviews…" />
      ) : error ? (
        <EmptyState
          title="Failed to load reviews"
          description={getErrorMessage(error)}
        />
      ) : reviews.length === 0 ? (
        <EmptyState title="No reviews found" />
      ) : (
        <>
          <div
            className={`grid grid-cols-1 gap-3 lg:grid-cols-2 ${
              isFetching ? "opacity-70 transition" : ""
            }`}
          >
            {reviews.map((r) => (
              <div
                key={r._id}
                className={`rounded-2xl border p-4 transition ${
                  r.isHidden
                    ? "border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-white/[0.02]"
                    : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <img
                      src={r.reviewerImage || FALLBACK_AVATAR}
                      alt={r.reviewerName ?? "Reviewer"}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          FALLBACK_AVATAR;
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
                        {r.reviewerName ?? "Anonymous"}
                      </h3>
                      <Stars value={r.rating} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {r.direction === "rider_to_driver"
                        ? "Rider → Driver"
                        : "Driver → Rider"}
                      {" · "}
                      <span className="text-gray-600 dark:text-gray-300">
                        {r.subjectName ?? "Unknown"}
                      </span>
                      {r.createdAt && ` · ${formatDate(r.createdAt)}`}
                    </p>
                    {r.comment && (
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        {r.comment}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      {r.isFlagged && (
                        <span className="rounded-full bg-warning-50 px-2 py-0.5 text-[10px] font-medium uppercase text-warning-700 dark:bg-warning-500/10 dark:text-warning-400">
                          Flagged
                        </span>
                      )}
                      {r.isHidden && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          Hidden
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onToggleHide(r._id, !!r.isHidden)}
                        startIcon={
                          r.isHidden ? (
                            <Eye className="size-3.5" />
                          ) : (
                            <EyeOff className="size-3.5" />
                          )
                        }
                      >
                        {r.isHidden ? "Unhide" : "Hide"}
                      </Button>
                    </div>
                  </div>
                </div>
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
