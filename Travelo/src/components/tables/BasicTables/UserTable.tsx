import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Globe,
  Mail,
  Phone,
  Search,
  ShieldOff,
  User as UserIcon,
  Users as UsersIcon,
  XCircle,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import LoadingSpinner from "../../common/LoadingSpinner";
import EmptyState from "../../common/EmptyState";
import Pagination from "../../common/Pagination";
import {
  useCustomerRegionCountsQuery,
  useUsersQuery,
} from "../../../hooks/queries/useUsers";
import { REGIONS, regionLabel, type RegionCode } from "../../../lib/regions";
import { formatDateTime } from "../../../lib/format";
import { getErrorMessage } from "../../../lib/error";

const FALLBACK_AVATAR = "/images/user/owner.jpg";

type RegionFilter = "all" | RegionCode;
type StatusFilter = "all" | "active" | "inactive" | "blocked";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "blocked", label: "Blocked" },
];

export default function UserTable() {
  const navigate = useNavigate();
  const [region, setRegion] = useState<RegionFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const params = useMemo(
    () => ({
      page,
      limit,
      ...(region !== "all" && { region: region.toLowerCase() }),
    }),
    [page, limit, region],
  );

  const { data, isLoading, isFetching, error } = useUsersQuery(params);
  const regionCountsQ = useCustomerRegionCountsQuery();

  const customers = data?.users ?? [];
  const meta = data?.meta;

  // Reset to page 1 when filters change.
  useEffect(() => {
    setPage(1);
  }, [region, status, limit]);

  // If we land past the last page (e.g. filter narrowed results), step back.
  useEffect(() => {
    if (meta && page > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  // Client-side search + status filter on the current page.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      if (status === "blocked" && !c.isBlocked) return false;
      if (status === "active" && (!c.isActive || c.isBlocked)) return false;
      if (status === "inactive" && (c.isActive || c.isBlocked)) return false;
      if (!q) return true;
      const haystack = [
        c.fullName,
        c.username,
        c.email,
        c.phone,
        c.city,
        c._id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [customers, status, search]);

  const totalCustomers = regionCountsQ.data?.total ?? meta?.total ?? 0;
  const regionCounts = regionCountsQ.data?.regions ?? [];

  const hasActiveFilters =
    region !== "all" || status !== "all" || search.trim() !== "";

  return (
    <div className="space-y-5">
      {/* Region tabs + total */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <RegionTabs
          region={region}
          counts={regionCounts}
          totalCount={totalCustomers}
          onChange={setRegion}
        />
        <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          <UsersIcon className="size-3.5" />
          {totalCustomers.toLocaleString()} total customer
          {totalCustomers === 1 ? "" : "s"}
        </div>
      </div>

      {/* Region stat cards */}
      {regionCounts.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {regionCounts.map((r) => (
            <button
              key={r.code}
              type="button"
              onClick={() => setRegion(r.code as RegionCode)}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left transition hover:border-brand-300 hover:shadow-theme-xs dark:hover:border-gray-700 ${
                region === r.code
                  ? "border-brand-500 bg-brand-50/40 dark:border-brand-500 dark:bg-brand-500/10"
                  : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              }`}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {r.code} · {r.country}
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
                  {r.count.toLocaleString()}
                </p>
                <p className="text-[11px] text-gray-500">
                  Currency: {r.currency}
                </p>
              </div>
              <div className="rounded-xl bg-brand-50 p-2 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <UserIcon className="size-5" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Name, email, phone, city, id…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="h-10 appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 [&::-ms-expand]:hidden"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setRegion("all");
                setStatus("all");
                setSearch("");
              }}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <LoadingSpinner fullPage label="Loading customers…" />
      ) : error ? (
        <EmptyState
          title="Failed to load customers"
          description={getErrorMessage(error)}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={
            hasActiveFilters ? "No matching customers" : "No customers yet"
          }
          description={
            hasActiveFilters
              ? "Try adjusting or clearing the filters."
              : "Customers will appear here once they sign up."
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
                      Contact
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Region
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      City
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
                      Last active
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filtered.map((c) => {
                    const name = c.fullName || c.username || "Unknown";
                    return (
                      <TableRow
                        key={c._id}
                        onClick={() =>
                          navigate(`/UserProfile/${c._id}`, {
                            state: { user: c },
                          })
                        }
                        className="cursor-pointer hover:bg-gray-50/60 dark:hover:bg-white/[0.02]"
                      >
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
                              {c.image ? (
                                <img
                                  src={c.image}
                                  alt={name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src =
                                      FALLBACK_AVATAR;
                                  }}
                                />
                              ) : (
                                <UserIcon className="size-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="block truncate font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {name}
                              </span>
                              {c.username && c.fullName !== c.username && (
                                <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                                  @{c.username}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <div className="space-y-0.5">
                            {c.email && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                                <Mail className="size-3.5 shrink-0 text-gray-400" />
                                <span className="truncate">{c.email}</span>
                              </div>
                            )}
                            {c.phone && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                <Phone className="size-3.5 shrink-0 text-gray-400" />
                                <span className="font-mono">{c.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-600 dark:text-gray-300">
                          <div className="inline-flex items-center gap-1.5">
                            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              {c.country}
                            </span>
                            {c.country && (
                              <span className="text-xs">
                                {regionLabel(c.country as RegionCode)}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-600 dark:text-gray-300">
                          {c.city || "—"}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start">
                          <StatusBadge user={c} />
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start text-xs text-gray-500 dark:text-gray-400">
                          {c.lastActive ? formatDateTime(c.lastActive) : "—"}
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
    </div>
  );
}

function StatusBadge({
  user,
}: {
  user: { isActive?: boolean; isBlocked?: boolean };
}) {
  if (user.isBlocked) {
    return (
      <Badge size="sm" color="error" startIcon={<ShieldOff className="size-3" />}>
        Blocked
      </Badge>
    );
  }
  if (user.isActive) {
    return (
      <Badge
        size="sm"
        color="success"
        startIcon={<CheckCircle2 className="size-3" />}
      >
        Active
      </Badge>
    );
  }
  return (
    <Badge size="sm" color="light" startIcon={<XCircle className="size-3" />}>
      Inactive
    </Badge>
  );
}

function RegionTabs({
  region,
  counts,
  totalCount,
  onChange,
}: {
  region: RegionFilter;
  counts: { code: string; count: number }[];
  totalCount: number;
  onChange: (r: RegionFilter) => void;
}) {
  const tabs: {
    value: RegionFilter;
    label: string;
    count: number;
    flag?: string;
  }[] = [
    { value: "all", label: "All regions", count: totalCount },
    ...REGIONS.map((r) => ({
      value: r.code as RegionFilter,
      label: r.label,
      flag: r.code,
      count:
        counts.find((c) => c.code?.toUpperCase() === r.code)?.count ?? 0,
    })),
  ];
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
      {tabs.map((t) => {
        const active = region === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              active
                ? "bg-brand-500 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {t.value === "all" ? (
              <Globe className="size-3.5" />
            ) : (
              <span className="font-mono text-[10px] tracking-wide">
                {t.flag}
              </span>
            )}
            {t.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                active
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {t.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
