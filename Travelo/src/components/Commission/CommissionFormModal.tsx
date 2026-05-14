import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  BOOKING_TYPES,
  COMMISSION_TYPES,
  commissionFormSchema,
  type CommissionFormInput,
} from "../../schemas/commission.schema";
import { getErrorMessage } from "../../lib/error";
import {
  useCreateCommission,
  useUpdateCommission,
} from "../../hooks/queries/useCommissions";
import { useRideTypesQuery } from "../../hooks/queries/useRideTypes";
import { useRegionsQuery } from "../../hooks/queries/useRegions";
import type { Commission, CommissionEntry } from "../../types/commission";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  commission?: Commission | null; // edit mode if provided
  defaultRegionId?: string;
}

// Human-readable labels for the discriminator unions.
const BOOKING_LABELS: Record<(typeof BOOKING_TYPES)[number], string> = {
  auto_accept: "Auto-accept",
  scheduled_ride: "Scheduled ride",
  bid_for_ride: "Bid for ride",
};

const COMMISSION_TYPE_LABELS: Record<
  (typeof COMMISSION_TYPES)[number],
  string
> = {
  percentage: "Percentage",
  fixed: "Fixed amount",
};

const blankRow = () => ({
  rideType: "",
  bookingType: BOOKING_TYPES[0],
  commissionType: COMMISSION_TYPES[0],
  commission: 0,
});

const emptyDefaults = (defaultRegionId?: string): CommissionFormInput => ({
  region: defaultRegionId ?? "",
  commissions: [blankRow()],
});

// Read the populated rideType _id whether the API returned an object, a
// string, or null.
const rideTypeId = (
  r: CommissionEntry["rideType"] | null | undefined,
): string => {
  if (!r) return "";
  return typeof r === "string" ? r : r._id ?? "";
};

const regionRefId = (r: Commission["region"] | null | undefined): string => {
  if (!r) return "";
  return typeof r === "string" ? r : r._id ?? "";
};

export default function CommissionFormModal({
  isOpen,
  onClose,
  commission,
  defaultRegionId,
}: Props) {
  const isEdit = Boolean(commission);

  const { data: rideTypesData } = useRideTypesQuery({ page: 1, limit: 100 });
  const allRideTypes = rideTypesData?.rideTypes ?? [];

  const { data: regions = [], isLoading: regionsLoading } = useRegionsQuery();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CommissionFormInput>({
    resolver: zodResolver(commissionFormSchema),
    mode: "onTouched",
    defaultValues: emptyDefaults(defaultRegionId),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "commissions",
  });

  const watchedRegionId = watch("region");
  const watchedRows = watch("commissions");

  const selectedRegion = useMemo(
    () => regions.find((r) => r._id === watchedRegionId),
    [regions, watchedRegionId],
  );

  useEffect(() => {
    if (!isOpen) return;
    if (commission) {
      reset({
        region: regionRefId(commission.region),
        // Cast through the strict union — if the backend sends a value the
        // form doesn't know, the dropdown will fall back to the first option
        // on render and the Zod schema rejects unknowns on save.
        commissions: commission.commissions
          .filter((c) => !!c.rideType)
          .map((c) => ({
            rideType: rideTypeId(c.rideType),
            bookingType: c.bookingType as (typeof BOOKING_TYPES)[number],
            commissionType: c.commissionType,
            commission: c.commission,
          })),
      });
    } else {
      reset(emptyDefaults(defaultRegionId));
    }
  }, [isOpen, commission, defaultRegionId, reset]);

  const availableRideTypes = useMemo(
    () =>
      watchedRegionId
        ? allRideTypes.filter((rt) =>
            rt.allowedRegions.includes(watchedRegionId),
          )
        : [],
    [allRideTypes, watchedRegionId],
  );

  const createMutation = useCreateCommission();
  const updateMutation = useUpdateCommission();

  const onSubmit = async (values: CommissionFormInput) => {
    try {
      const payload = {
        region: values.region,
        commissions: values.commissions,
      };

      if (isEdit && commission) {
        await updateMutation.mutateAsync({
          id: commission._id,
          data: payload,
        });
        toast.success("Commission updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Commission created");
      }
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
    >
      <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
        {isEdit ? "Edit Commission" : "Create Commission"}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Set the commission per ride type and booking flow for a region.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={isSubmitting} className="space-y-5">
          {/* Region + currency */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>
                Region <span className="text-error-500">*</span>
              </Label>
              <Controller
                name="region"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isEdit || regionsLoading}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm capitalize text-gray-800 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="">
                      {regionsLoading ? "Loading regions…" : "Select region…"}
                    </option>
                    {regions.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.country} ({r.code})
                      </option>
                    ))}
                    {field.value &&
                      !regions.some((r) => r._id === field.value) && (
                        <option value={field.value}>
                          Existing region ({field.value.slice(0, 8)}…)
                        </option>
                      )}
                  </select>
                )}
              />
              {errors.region && (
                <p className="mt-1 text-xs text-error-500">
                  {errors.region.message as string}
                </p>
              )}
            </div>

            <div>
              <Label>Currency</Label>
              <Input
                type="text"
                value={selectedRegion?.currency ?? ""}
                placeholder="—"
                readOnly
                disabled
              />
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Set automatically from the selected region.
              </p>
            </div>
          </div>

          {/* Commission rows */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>
                Commissions <span className="text-error-500">*</span>
              </Label>
              <button
                type="button"
                onClick={() => append(blankRow())}
                disabled={!watchedRegionId}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-brand-400 dark:hover:bg-brand-500/10"
              >
                <Plus className="size-3.5" />
                Add row
              </button>
            </div>

            {!watchedRegionId ? (
              <p className="mb-2 rounded-lg border border-dashed border-gray-200 p-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                Pick a region first to see the ride types you can price.
              </p>
            ) : availableRideTypes.length === 0 ? (
              <p className="mb-2 rounded-lg border border-dashed border-warning-200 bg-warning-50 p-2 text-xs text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-400">
                No ride types are available for{" "}
                <span className="capitalize">
                  {selectedRegion?.country ?? "this region"}
                </span>
                . Create one in the Ride Types page first.
              </p>
            ) : null}

            <div className="space-y-3">
              {fields.map((field, index) => {
                const rowErr = errors.commissions?.[index];
                const commissionType = watchedRows?.[index]?.commissionType;
                const isPct = commissionType === "percentage";
                return (
                  <div
                    key={field.id}
                    className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                      {/* Ride type */}
                      <div className="sm:col-span-4">
                        <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Ride type
                        </span>
                        <Controller
                          name={`commissions.${index}.rideType`}
                          control={control}
                          render={({ field: f }) => (
                            <select
                              value={f.value}
                              onChange={f.onChange}
                              onBlur={f.onBlur}
                              className="h-9 w-full rounded-lg border border-gray-300 bg-transparent px-2 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            >
                              <option value="">Select…</option>
                              {availableRideTypes.map((rt) => (
                                <option key={rt._id} value={rt._id}>
                                  {rt.title} ({rt.passengers}p)
                                </option>
                              ))}
                              {f.value &&
                                !availableRideTypes.some(
                                  (rt) => rt._id === f.value,
                                ) && (
                                  <option value={f.value}>
                                    Existing ({f.value.slice(0, 8)}…)
                                  </option>
                                )}
                            </select>
                          )}
                        />
                        {rowErr?.rideType && (
                          <p className="mt-1 text-[10px] text-error-500">
                            {rowErr.rideType?.message}
                          </p>
                        )}
                      </div>

                      {/* Booking type */}
                      <div className="sm:col-span-3">
                        <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Booking type
                        </span>
                        <Controller
                          name={`commissions.${index}.bookingType`}
                          control={control}
                          render={({ field: f }) => (
                            <select
                              value={f.value}
                              onChange={f.onChange}
                              onBlur={f.onBlur}
                              className="h-9 w-full rounded-lg border border-gray-300 bg-transparent px-2 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            >
                              {BOOKING_TYPES.map((bt) => (
                                <option key={bt} value={bt}>
                                  {BOOKING_LABELS[bt]}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                      </div>

                      {/* Commission type */}
                      <div className="sm:col-span-2">
                        <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Type
                        </span>
                        <Controller
                          name={`commissions.${index}.commissionType`}
                          control={control}
                          render={({ field: f }) => (
                            <select
                              value={f.value}
                              onChange={f.onChange}
                              onBlur={f.onBlur}
                              className="h-9 w-full rounded-lg border border-gray-300 bg-transparent px-2 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            >
                              {COMMISSION_TYPES.map((ct) => (
                                <option key={ct} value={ct}>
                                  {COMMISSION_TYPE_LABELS[ct]}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                      </div>

                      {/* Commission value */}
                      <div className="sm:col-span-2">
                        <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Value
                        </span>
                        <div className="relative">
                          <Controller
                            name={`commissions.${index}.commission`}
                            control={control}
                            render={({ field: f }) => (
                              <Input
                                type="number"
                                name={f.name}
                                value={
                                  f.value === undefined ||
                                  Number.isNaN(f.value as number)
                                    ? ""
                                    : (f.value as number)
                                }
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  f.onChange(
                                    raw === "" ? undefined : Number(raw),
                                  );
                                }}
                                onBlur={f.onBlur}
                                inputMode="decimal"
                                error={!!rowErr?.commission}
                                aria-invalid={!!rowErr?.commission}
                              />
                            )}
                          />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                            {isPct ? "%" : selectedRegion?.currency ?? ""}
                          </span>
                        </div>
                        {rowErr?.commission && (
                          <p className="mt-1 text-[10px] text-error-500">
                            {rowErr.commission?.message}
                          </p>
                        )}
                      </div>

                      {/* Remove */}
                      <div className="flex items-end justify-end sm:col-span-1">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 1}
                          aria-label="Remove row"
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-error-500 transition hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-error-500/10"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {errors.commissions &&
              !Array.isArray(errors.commissions) &&
              "message" in errors.commissions && (
                <p className="mt-2 text-xs text-error-500">
                  {errors.commissions.message as string}
                </p>
              )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  {isEdit ? "Saving…" : "Creating…"}
                </span>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
