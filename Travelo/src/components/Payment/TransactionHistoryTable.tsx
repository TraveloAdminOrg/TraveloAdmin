import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { ArrowDownLeft, ArrowUpRight, Search, Trash2, User } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table/index";
import Badge from "../ui/badge/Badge";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "../common/EmptyState";
import Pagination from "../common/Pagination";
import DeleteConfirmDialog from "../common/DeleteConfirmDialog";
import {
  useDeletePayment,
  usePaymentsQuery,
} from "../../hooks/queries/usePayments";
import { formatCurrency, formatDateTime } from "../../lib/format";
import { getErrorMessage, isNotFoundError } from "../../lib/error";
import type { Transaction } from "../../types/payment";

const STATUS_OPTIONS = ["All", "succeeded", "pending", "failed", "refunded"];
const TYPE_OPTIONS = ["All", "wallet_topup", "ride_payment", "refund", "payout"];
const DIRECTION_OPTIONS = ["All", "credit", "debit"];

type StatusColor = "success" | "warning" | "error" | "info" | "light";

const statusColor = (status: string): StatusColor => {
  switch (status?.toLowerCase()) {
    case "succeeded":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "error";
    case "refunded":
    case "partially_refunded":
      return "info";
    default:
      return "light";
  }
};

const prettify = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function TransactionHistoryTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<string>("All");
  const [type, setType] = useState<string>("All");
  const [direction, setDirection] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit,
      ...(status !== "All" && { status }),
      ...(type !== "All" && { type }),
      ...(direction !== "All" && { direction }),
    }),
    [page, limit, status, type, direction],
  );

  const { data, isLoading, isFetching, error } = usePaymentsQuery(params);
  const deleteMutation = useDeletePayment();

  const transactions = data?.transactions ?? [];
  const meta = data?.meta;

  // Reset to page 1 when filters change.
  useEffect(() => {
    setPage(1);
  }, [status, type, direction, limit]);

  // If the current page is past the new totalPages (e.g. after a delete), step back.
  useEffect(() => {
    if (meta && page > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  // Client-side date + free-text search on the current page.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (q) {
        const haystack = [
          tx.user?.fullName,
          tx.user?.username,
          tx.user?.email,
          tx.user?.phone,
          tx.stripePaymentIntentId,
          tx._id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (startDate || endDate) {
        const created = tx.createdAt ? new Date(tx.createdAt) : null;
        if (!created) return false;
        if (startDate && created < startDate) return false;
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (created > end) return false;
        }
      }
      return true;
    });
  }, [transactions, search, startDate, endDate]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMutation.mutateAsync(pendingDelete._id);
      toast.success("Transaction deleted");
      setPendingDelete(null);
    } catch (err) {
      if (isNotFoundError(err)) {
        toast.error("Delete isn't available — transaction not found.");
      } else {
        toast.error(getErrorMessage(err));
      }
    }
  };

  const clearFilters = () => {
    setStatus("All");
    setType("All");
    setDirection("All");
    setSearch("");
    setStartDate(null);
    setEndDate(null);
  };

  const hasActiveFilters =
    status !== "All" ||
    type !== "All" ||
    direction !== "All" ||
    search.trim() !== "" ||
    startDate !== null ||
    endDate !== null;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-end gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[220px]">
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Name, email, phone, payment intent…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All statuses" : prettify(s)}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All types" : prettify(t)}
                </option>
              ))}
            </select>
          </div>

          {/* Direction */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Direction
            </label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {DIRECTION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d === "All" ? "All" : prettify(d)}
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
              From
            </label>
            <DatePicker
              selected={startDate}
              onChange={(d: Date | null) => setStartDate(d)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start date"
              className="h-10 w-36 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
              To
            </label>
            <DatePicker
              selected={endDate}
              onChange={(d: Date | null) => setEndDate(d)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate ?? undefined}
              placeholderText="End date"
              className="h-10 w-36 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <LoadingSpinner fullPage label="Loading transactions…" />
      ) : error ? (
        <EmptyState
          title="Failed to load transactions"
          description={getErrorMessage(error)}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No matching transactions" : "No transactions yet"}
          description={
            hasActiveFilters
              ? "Try adjusting or clearing the filters."
              : "Transactions will appear here once customers start topping up or paying for rides."
          }
        />
      ) : (
        <div
          className={`overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] ${
            isFetching ? "opacity-70 transition" : ""
          }`}
        >
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[1100px]">
              <Table>
                <TableHeader className="border-b border-gray-100 bg-gray-50/50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Customer
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Type
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Direction
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Amount
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Payment Ref
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filtered.map((tx) => {
                    const isCredit = tx.direction === "credit";
                    const customerName =
                      tx.user?.fullName || tx.user?.username || "Unknown user";
                    return (
                      <TableRow
                        key={tx._id}
                        className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                      >
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
                              {tx.user?.image ? (
                                <img
                                  src={tx.user.image}
                                  alt={customerName}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <User className="size-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="block truncate font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {customerName}
                              </span>
                              {tx.user?.email && (
                                <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                                  {tx.user.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-gray-600 text-start text-theme-sm dark:text-gray-300">
                          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium dark:bg-white/5 dark:text-gray-300">
                            {prettify(String(tx.type))}
                          </span>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${
                              isCredit
                                ? "text-success-600 dark:text-success-500"
                                : "text-error-600 dark:text-error-500"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="size-3.5" />
                            ) : (
                              <ArrowUpRight className="size-3.5" />
                            )}
                            {prettify(tx.direction)}
                          </span>
                        </TableCell>

                        <TableCell
                          className={`px-5 py-4 text-end font-semibold text-theme-sm ${
                            isCredit
                              ? "text-success-600 dark:text-success-500"
                              : "text-error-600 dark:text-error-500"
                          }`}
                        >
                          {isCredit ? "+" : "-"}
                          {formatCurrency(
                            tx.amount,
                            (tx.currency || "usd").toUpperCase(),
                          )}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start">
                          <Badge size="sm" color={statusColor(String(tx.status))}>
                            {prettify(String(tx.status))}
                          </Badge>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start text-xs text-gray-500 dark:text-gray-400">
                          {tx.stripePaymentIntentId ? (
                            <span
                              title={tx.stripePaymentIntentId}
                              className="font-mono"
                            >
                              {tx.stripePaymentIntentId.slice(0, 14)}…
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {tx.createdAt ? formatDateTime(tx.createdAt) : "—"}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-end">
                          <button
                            type="button"
                            onClick={() => setPendingDelete(tx)}
                            aria-label="Delete transaction"
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10"
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {meta && meta.total > 0 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
          isLoading={isFetching}
        />
      )}

      <DeleteConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete this transaction?"
        description={
          pendingDelete
            ? `Transaction ${pendingDelete._id} will be permanently removed. This cannot be undone.`
            : ""
        }
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
