import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import DeleteConfirmDialog from "../../components/common/DeleteConfirmDialog";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import {
  useAdvertsQuery,
  useCreateAdvert,
  useUpdateAdvert,
  useDeleteAdvert,
} from "../../hooks/queries/useAdverts";
import { REGIONS } from "../../lib/regions";
import { formatDate } from "../../lib/format";
import { getErrorMessage, isNotFoundError } from "../../lib/error";
import type {
  Advert,
  AdvertAudience,
  AdvertPlacement,
} from "../../types/advert";

const PLACEMENT_OPTIONS: { value: AdvertPlacement; label: string }[] = [
  { value: "home_banner", label: "Home banner" },
  { value: "ride_complete", label: "Ride complete" },
  { value: "splash", label: "Splash" },
  { value: "side_drawer", label: "Side drawer" },
  { value: "promo_card", label: "Promo card" },
  { value: "other", label: "Other" },
];

const AUDIENCE_OPTIONS: { value: AdvertAudience; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "users", label: "Users only" },
  { value: "drivers", label: "Drivers only" },
];

const advertSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(80),
  description: z.string().trim().max(300).optional().or(z.literal("")),
  imageUrl: z.string().trim().min(1, "Image URL required"),
  ctaUrl: z.string().trim().optional().or(z.literal("")),
  ctaLabel: z.string().trim().max(40).optional().or(z.literal("")),
  placement: z.enum([
    "home_banner",
    "ride_complete",
    "splash",
    "side_drawer",
    "promo_card",
    "other",
  ]),
  audience: z.enum(["all", "users", "drivers"]),
  countryCode: z.enum(["PK", "MT", "GB"]).optional().or(z.literal("")),
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
  priority: z.number().min(0).max(100).optional(),
});
type AdvertInput = z.infer<typeof advertSchema>;

const inputClasses =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function AdvertsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Advert | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Advert | null>(null);

  const { data, isLoading, isFetching, error } = useAdvertsQuery({
    page,
    limit,
  });
  const createMut = useCreateAdvert();
  const updateMut = useUpdateAdvert();
  const deleteMut = useDeleteAdvert();

  const adverts = data?.adverts ?? [];
  const meta = data?.meta;

  useEffect(() => {
    if (meta && page > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdvertInput>({
    resolver: zodResolver(advertSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      ctaUrl: "",
      ctaLabel: "",
      placement: "home_banner",
      audience: "all",
      countryCode: "",
      startsAt: "",
      endsAt: "",
      isActive: true,
      priority: 0,
    },
  });

  const openCreate = () => {
    setEditing(null);
    reset();
    setIsFormOpen(true);
  };

  const openEdit = (a: Advert) => {
    setEditing(a);
    reset({
      title: a.title,
      description: a.description ?? "",
      imageUrl: a.imageUrl,
      ctaUrl: a.ctaUrl ?? "",
      ctaLabel: a.ctaLabel ?? "",
      placement: a.placement,
      audience: a.audience,
      countryCode: a.countryCode ?? "",
      startsAt: a.startsAt ? a.startsAt.slice(0, 16) : "",
      endsAt: a.endsAt ? a.endsAt.slice(0, 16) : "",
      isActive: a.isActive,
      priority: a.priority ?? 0,
    });
    setIsFormOpen(true);
  };

  const onSubmit = async (values: AdvertInput) => {
    try {
      const payload = {
        ...values,
        countryCode: values.countryCode || undefined,
        startsAt: values.startsAt || undefined,
        endsAt: values.endsAt || undefined,
        description: values.description || undefined,
        ctaUrl: values.ctaUrl || undefined,
        ctaLabel: values.ctaLabel || undefined,
      };
      if (editing) {
        await updateMut.mutateAsync({ id: editing._id, data: payload });
        toast.success("Advert updated");
      } else {
        await createMut.mutateAsync(payload);
        toast.success("Advert created");
      }
      setIsFormOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMut.mutateAsync(pendingDelete._id);
      toast.success("Advert deleted");
      setPendingDelete(null);
    } catch (err) {
      if (isNotFoundError(err)) {
        toast.error("Delete isn't available yet — backend endpoint not implemented.");
      } else {
        toast.error(getErrorMessage(err));
      }
    }
  };

  return (
    <>
      <PageMeta
        title="Adverts | Travelo Admin"
        description="Manage in-app banners and promotions."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Adverts & Banners
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {meta
              ? `${meta.total} advert${meta.total === 1 ? "" : "s"}.`
              : "In-app banners and promotional cards."}
          </p>
        </div>
        <Button size="sm" onClick={openCreate} startIcon={<Plus className="size-4" />}>
          New advert
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage label="Loading adverts…" />
      ) : error ? (
        <EmptyState title="Failed to load" description={getErrorMessage(error)} />
      ) : adverts.length === 0 ? (
        <EmptyState
          title="No adverts yet"
          description="Create your first banner to surface in the apps."
          action={
            <Button size="sm" onClick={openCreate} startIcon={<Plus className="size-4" />}>
              New advert
            </Button>
          }
        />
      ) : (
        <>
          <div
            className={`grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 ${
              isFetching ? "opacity-70 transition" : ""
            }`}
          >
            {adverts.map((a) => (
              <div
                key={a._id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="relative h-36 bg-gray-100 dark:bg-gray-800">
                  <img
                    src={a.imageUrl}
                    alt={a.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                    className="h-full w-full object-cover"
                  />
                  <span
                    className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                      a.isActive
                        ? "bg-success-500/90 text-white"
                        : "bg-gray-500/90 text-white"
                    }`}
                  >
                    {a.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
                    {a.title}
                  </h3>
                  {a.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                      {a.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                      {a.placement.replace(/_/g, " ")}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {a.audience}
                    </span>
                    {a.countryCode && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {a.countryCode}
                      </span>
                    )}
                  </div>
                  {(a.startsAt || a.endsAt) && (
                    <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                      {a.startsAt && `From ${formatDate(a.startsAt)}`}
                      {a.startsAt && a.endsAt && " · "}
                      {a.endsAt && `Until ${formatDate(a.endsAt)}`}
                    </p>
                  )}
                  {(a.impressions !== undefined || a.clicks !== undefined) && (
                    <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                      {a.impressions ?? 0} impressions · {a.clicks ?? 0} clicks
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => openEdit(a)}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(a)}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </button>
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

      {/* Form modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        className="max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          {editing ? "Edit advert" : "New advert"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-4">
          <div>
            <Label>Title <span className="text-error-500">*</span></Label>
            <input className={inputClasses} {...register("title")} />
            {errors.title && <p className="mt-1 text-xs text-error-500">{errors.title.message}</p>}
          </div>
          <div>
            <Label>Description</Label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              {...register("description")}
            />
          </div>
          <div>
            <Label>Image URL <span className="text-error-500">*</span></Label>
            <input className={inputClasses} {...register("imageUrl")} />
            {errors.imageUrl && (
              <p className="mt-1 text-xs text-error-500">{errors.imageUrl.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>CTA label</Label>
              <input className={inputClasses} {...register("ctaLabel")} />
            </div>
            <div>
              <Label>CTA URL</Label>
              <input className={inputClasses} {...register("ctaUrl")} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label>Placement</Label>
              <select className={inputClasses} {...register("placement")}>
                {PLACEMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Audience</Label>
              <select className={inputClasses} {...register("audience")}>
                {AUDIENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Region (optional)</Label>
              <select className={inputClasses} {...register("countryCode")}>
                <option value="">All regions</option>
                {REGIONS.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Starts at</Label>
              <input
                type="datetime-local"
                className={inputClasses}
                {...register("startsAt")}
              />
            </div>
            <div>
              <Label>Ends at</Label>
              <input
                type="datetime-local"
                className={inputClasses}
                {...register("endsAt")}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              {...register("isActive")}
              className="size-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            <label
              htmlFor="isActive"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Active
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFormOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting
                ? editing
                  ? "Saving…"
                  : "Creating…"
                : editing
                  ? "Save changes"
                  : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete this advert?"
        description={
          pendingDelete ? `"${pendingDelete.title}" will be removed.` : ""
        }
        isLoading={deleteMut.isPending}
        onConfirm={onConfirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
