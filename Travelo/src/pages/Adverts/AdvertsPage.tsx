import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ExternalLink,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
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
import { formatDateTime } from "../../lib/format";
import { getErrorMessage, isNotFoundError } from "../../lib/error";
import type { Advert } from "../../types/advert";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

const advertSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(80),
  description: z.string().trim().max(300).optional().or(z.literal("")),
  actionLink: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  altText: z.string().trim().max(120).optional().or(z.literal("")),
  priority: z.coerce.number().int().min(0).max(100),
  isActive: z.boolean(),
  image: z
    .instanceof(File)
    .optional()
    .refine(
      (f) => !f || f.size <= MAX_IMAGE_BYTES,
      "Image must be 5MB or smaller",
    )
    .refine(
      (f) => !f || f.type.startsWith("image/"),
      "File must be an image",
    ),
});
type AdvertFormValues = z.infer<typeof advertSchema>;

const inputClasses =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function AdvertsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all",
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Advert | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Advert | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return adverts.filter((a) => {
      if (statusFilter === "active" && !a.isActive) return false;
      if (statusFilter === "inactive" && a.isActive) return false;
      if (!q) return true;
      return [a.title, a.description, a.actionLink, a.altText, a._id]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [adverts, search, statusFilter]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AdvertFormValues>({
    resolver: zodResolver(advertSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      description: "",
      actionLink: "",
      altText: "",
      priority: 0,
      isActive: true,
      image: undefined,
    },
  });

  const watchedImage = watch("image");

  // Sync the live preview URL with the selected file (revoking the old object URL).
  useEffect(() => {
    if (!watchedImage) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(watchedImage);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [watchedImage]);

  const openCreate = () => {
    setEditing(null);
    reset({
      title: "",
      description: "",
      actionLink: "",
      altText: "",
      priority: 0,
      isActive: true,
      image: undefined,
    });
    setImagePreview(null);
    setIsFormOpen(true);
  };

  const openEdit = (a: Advert) => {
    setEditing(a);
    reset({
      title: a.title,
      description: a.description ?? "",
      actionLink: a.actionLink ?? "",
      altText: a.altText ?? "",
      priority: a.priority ?? 0,
      isActive: a.isActive,
      image: undefined,
    });
    setImagePreview(a.image || null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (values: AdvertFormValues) => {
    // Image is required when creating, optional when editing (keeps existing).
    if (!editing && !values.image) {
      toast.error("Please choose an image for the advert.");
      return;
    }
    try {
      const payload = {
        title: values.title,
        description: values.description || undefined,
        actionLink: values.actionLink || undefined,
        altText: values.altText || undefined,
        priority: values.priority,
        isActive: values.isActive,
        image: values.image,
      };
      if (editing) {
        await updateMut.mutateAsync({ id: editing._id, data: payload });
        toast.success("Advert updated");
      } else {
        await createMut.mutateAsync(payload);
        toast.success("Advert created");
      }
      closeForm();
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
        toast.error("Advert not found.");
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
            Adverts &amp; Banners
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {meta
              ? `${meta.total} advert${meta.total === 1 ? "" : "s"} · lower priority shows first.`
              : "In-app banners and promotional cards."}
          </p>
        </div>
        <Button size="sm" onClick={openCreate} startIcon={<Plus className="size-4" />}>
          New advert
        </Button>
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
                placeholder="Title, description, alt text, link…"
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
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "active" | "inactive")
              }
              className="h-10 appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-700 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 [&::-ms-expand]:hidden"
            >
              <option value="all">All</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>

          {(search || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage label="Loading adverts…" />
      ) : error ? (
        <EmptyState title="Failed to load" description={getErrorMessage(error)} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={adverts.length === 0 ? "No adverts yet" : "No matching adverts"}
          description={
            adverts.length === 0
              ? "Create your first banner to surface in the apps."
              : "Try adjusting or clearing the filters."
          }
          action={
            adverts.length === 0 && (
              <Button size="sm" onClick={openCreate} startIcon={<Plus className="size-4" />}>
                New advert
              </Button>
            )
          }
        />
      ) : (
        <>
          <div
            className={`grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 ${
              isFetching ? "opacity-70 transition" : ""
            }`}
          >
            {filtered.map((a) => (
              <div
                key={a._id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
              >
                <div className="relative aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
                  <img
                    src={a.image}
                    alt={a.altText || a.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                    className="h-full w-full object-cover"
                  />
                  <span
                    className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide backdrop-blur ${
                      a.isActive
                        ? "bg-success-500/90 text-white"
                        : "bg-gray-700/80 text-white"
                    }`}
                  >
                    {a.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur">
                    P{a.priority}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
                    {a.title}
                  </h3>
                  {a.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                      {a.description}
                    </p>
                  )}
                  {a.actionLink && (
                    <a
                      href={a.actionLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                    >
                      <ExternalLink className="size-3 shrink-0" />
                      <span className="truncate">{a.actionLink}</span>
                    </a>
                  )}
                  {a.updatedAt && (
                    <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                      Updated {formatDateTime(a.updatedAt)}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-end gap-1 border-t border-gray-100 pt-3 dark:border-gray-800">
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
        onClose={closeForm}
        className="max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          {editing ? "Edit advert" : "New advert"}
        </h2>
        <p className="mb-5 text-xs text-gray-500 dark:text-gray-400">
          {editing
            ? "Leave the image empty to keep the existing one."
            : "Upload an image, set the title and link, and save."}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Image uploader with live preview */}
          <div>
            <Label>
              Image{" "}
              {!editing && <span className="text-error-500">*</span>}
            </Label>
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 sm:w-56 dark:border-gray-700 dark:bg-white/[0.02]">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-gray-400">
                        <ImagePlus className="size-6" />
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-center gap-2">
                    <input
                      ref={(el) => {
                        fileInputRef.current = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      startIcon={<Upload className="size-3.5" />}
                    >
                      {field.value || (editing && imagePreview)
                        ? "Replace image"
                        : "Choose image"}
                    </Button>
                    {field.value && (
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {field.value.name} ·{" "}
                        {(field.value.size / 1024).toFixed(1)} KB
                      </p>
                    )}
                    {field.value && (
                      <button
                        type="button"
                        onClick={() => {
                          field.onChange(undefined);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                          if (editing) setImagePreview(editing.image);
                        }}
                        className="text-xs font-medium text-error-500 hover:underline"
                      >
                        Remove selection
                      </button>
                    )}
                  </div>
                </div>
              )}
            />
            {errors.image && (
              <p className="mt-1 text-xs text-error-500">
                {String(errors.image.message)}
              </p>
            )}
          </div>

          <div>
            <Label>
              Title <span className="text-error-500">*</span>
            </Label>
            <input className={inputClasses} {...register("title")} />
            {errors.title && (
              <p className="mt-1 text-xs text-error-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label>Description</Label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-error-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label>Action link</Label>
            <input
              type="url"
              placeholder="https://…"
              className={inputClasses}
              {...register("actionLink")}
            />
            {errors.actionLink && (
              <p className="mt-1 text-xs text-error-500">
                {errors.actionLink.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Alt text</Label>
              <input
                className={inputClasses}
                placeholder="Accessibility description"
                {...register("altText")}
              />
              {errors.altText && (
                <p className="mt-1 text-xs text-error-500">
                  {errors.altText.message}
                </p>
              )}
            </div>
            <div>
              <Label>Priority</Label>
              <input
                type="number"
                min={0}
                max={100}
                className={inputClasses}
                {...register("priority")}
              />
              <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                Lower numbers appear first.
              </p>
              {errors.priority && (
                <p className="mt-1 text-xs text-error-500">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          {/* Active toggle */}
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-white/[0.02]">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Active
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Inactive adverts are hidden from the apps.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  onClick={() => setValue("isActive", !field.value, { shouldDirty: true })}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                    field.value
                      ? "bg-brand-500"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`inline-block size-5 transform rounded-full bg-white shadow transition ${
                      field.value ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            )}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeForm}
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
