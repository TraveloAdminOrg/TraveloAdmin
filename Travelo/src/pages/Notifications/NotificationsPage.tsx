import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bell, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../components/common/PageHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import {
  useNotificationsQuery,
  useSendNotification,
} from "../../hooks/queries/useNotifications";
import { REGIONS, type RegionCode } from "../../lib/regions";
import { formatDateTime } from "../../lib/format";
import { getErrorMessage } from "../../lib/error";
import type {
  NotificationAudience,
  NotificationStatus,
} from "../../types/notification";

const AUDIENCE_OPTIONS: { value: NotificationAudience; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "all_users", label: "All users" },
  { value: "all_drivers", label: "All drivers" },
  { value: "users_in_region", label: "Users in a region" },
  { value: "drivers_in_region", label: "Drivers in a region" },
];

const composeSchema = z
  .object({
    title: z.string().trim().min(2, "Title is too short").max(80, "Too long"),
    body: z.string().trim().min(2, "Body is too short").max(500, "Too long"),
    imageUrl: z.string().trim().optional().or(z.literal("")),
    audience: z.enum([
      "all",
      "all_users",
      "all_drivers",
      "users_in_region",
      "drivers_in_region",
      "specific_users",
      "specific_drivers",
    ]),
    countryCode: z.enum(["PK", "MT", "GB"]).optional(),
    scheduledAt: z.string().optional().or(z.literal("")),
  })
  .refine(
    (d) =>
      !d.audience.includes("region") ? true : !!d.countryCode,
    { message: "Pick a region", path: ["countryCode"] },
  );

type ComposeInput = z.infer<typeof composeSchema>;

const STATUS_TONE: Record<NotificationStatus, string> = {
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  scheduled:
    "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400",
  sending: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
  sent:
    "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400",
  failed:
    "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400",
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const { data, isLoading, isFetching, error } = useNotificationsQuery({
    page,
    limit,
  });
  const sendMutation = useSendNotification();

  const notifications = data?.notifications ?? [];
  const meta = data?.meta;

  useEffect(() => {
    if (meta && page > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComposeInput>({
    resolver: zodResolver(composeSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      body: "",
      imageUrl: "",
      audience: "all",
      countryCode: undefined,
      scheduledAt: "",
    },
  });

  const audience = watch("audience");
  const showRegion =
    audience === "users_in_region" || audience === "drivers_in_region";

  const onSubmit = async (values: ComposeInput) => {
    try {
      await sendMutation.mutateAsync({
        title: values.title,
        body: values.body,
        imageUrl: values.imageUrl || undefined,
        audience: values.audience,
        countryCode: showRegion ? (values.countryCode as RegionCode) : undefined,
        scheduledAt: values.scheduledAt || undefined,
      });
      toast.success(values.scheduledAt ? "Notification scheduled" : "Notification sent");
      reset();
      setIsComposeOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const inputClasses =
    "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

  return (
    <>
      <PageMeta
        title="Notifications | Travelo Admin"
        description="Send and review push notifications."
      />

      <PageHeader
        title="Notifications"
        description={
          meta
            ? `${meta.total} notification${meta.total === 1 ? "" : "s"} sent across all regions.`
            : "Send and review push notifications."
        }
        icon={<Bell size={22} />}
        actions={
          <Button
            size="md"
            onClick={() => setIsComposeOpen(true)}
            startIcon={<Plus className="size-4" />}
          >
            New notification
          </Button>
        }
      />

      {isLoading ? (
        <LoadingSpinner fullPage label="Loading…" />
      ) : error ? (
        <EmptyState title="Failed to load" description={getErrorMessage(error)} />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="Send your first push to engage users or drivers."
          action={
            <Button
              size="sm"
              onClick={() => setIsComposeOpen(true)}
              startIcon={<Plus className="size-4" />}
            >
              New notification
            </Button>
          }
        />
      ) : (
        <>
          <div
            className={`space-y-3 ${isFetching ? "opacity-70 transition" : ""}`}
          >
            {notifications.map((n) => (
              <div
                key={n._id}
                className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                        {n.title}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_TONE[n.status]}`}
                      >
                        {n.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {n.body}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                      <span>To: {n.audience.replace(/_/g, " ")}</span>
                      {n.countryCode && <span>· {n.countryCode}</span>}
                      {n.sentAt && <span>· Sent {formatDateTime(n.sentAt)}</span>}
                      {n.scheduledAt && !n.sentAt && (
                        <span>· Scheduled {formatDateTime(n.scheduledAt)}</span>
                      )}
                      {n.deliveredCount !== undefined && (
                        <span>· {n.deliveredCount} delivered</span>
                      )}
                      {n.openRate !== undefined && (
                        <span>· {(n.openRate * 100).toFixed(1)}% opened</span>
                      )}
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

      {/* Compose modal */}
      <Modal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        className="max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          New notification
        </h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Compose a push notification — send now or schedule.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <Label>Title <span className="text-error-500">*</span></Label>
            <input className={inputClasses} {...register("title")} />
            {errors.title && (
              <p className="mt-1 text-xs text-error-500">{errors.title.message}</p>
            )}
          </div>
          <div>
            <Label>Body <span className="text-error-500">*</span></Label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              {...register("body")}
            />
            {errors.body && (
              <p className="mt-1 text-xs text-error-500">{errors.body.message}</p>
            )}
          </div>
          <div>
            <Label>Image URL</Label>
            <input
              type="url"
              placeholder="https://…"
              className={inputClasses}
              {...register("imageUrl")}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Audience <span className="text-error-500">*</span></Label>
              <select className={inputClasses} {...register("audience")}>
                {AUDIENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {showRegion && (
              <div>
                <Label>Region <span className="text-error-500">*</span></Label>
                <select className={inputClasses} {...register("countryCode")}>
                  <option value="">Pick a region</option>
                  {REGIONS.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.label}
                    </option>
                  ))}
                </select>
                {errors.countryCode && (
                  <p className="mt-1 text-xs text-error-500">
                    {errors.countryCode.message as string}
                  </p>
                )}
              </div>
            )}
          </div>
          <div>
            <Label>Schedule (optional)</Label>
            <input
              type="datetime-local"
              className={inputClasses}
              {...register("scheduledAt")}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Leave blank to send immediately.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsComposeOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              startIcon={<Send className="size-4" />}
            >
              {isSubmitting ? "Sending…" : "Send"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
