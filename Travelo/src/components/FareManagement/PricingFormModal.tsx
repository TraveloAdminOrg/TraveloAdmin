import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Copy, Plus, Trash2 } from "lucide-react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import {
  pricingFormSchema,
  type PricingFormInput,
} from "../../schemas/pricing.schema";
import { getErrorMessage } from "../../lib/error";
import { refId, regionRefId } from "../../lib/refs";
import {
  DAYS,
  FARE_FIELDS,
  blankWeek,
  isUniformWeek,
  normaliseWeek,
  spreadAcrossWeek,
  type FareField,
  type FareFieldKey,
} from "../../lib/pricing";
import {
  useCreatePricing,
  useUpdatePricing,
} from "../../hooks/queries/usePricings";
import { useRideTypesQuery } from "../../hooks/queries/useRideTypes";
import { useRegionsQuery } from "../../hooks/queries/useRegions";
import type { Pricing, PricingCreateInput } from "../../types/pricing";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pricing?: Pricing | null; // edit mode if provided
  defaultRegionId?: string; // pre-selects this region in create mode (region _id)
  // Regions that already have a fare. The backend permits one fare document per
  // region, so these can't be created again — they have to be edited.
  pricedRegionIds?: Set<string>;
}

const blankRow = () => ({ rideType: "", weeklyFare: blankWeek() });

const emptyDefaults = (defaultRegionId?: string): PricingFormInput => ({
  region: defaultRegionId ?? "",
  rideTypes: [blankRow()],
});

const baseResolver = zodResolver(pricingFormSchema);

export default function PricingFormModal({
  isOpen,
  onClose,
  pricing,
  defaultRegionId,
  pricedRegionIds,
}: Props) {
  const isEdit = Boolean(pricing);

  // Pull all ride types so we can populate the per-row dropdown.
  // Fetch a generous page size so we don't have to paginate inside the form.
  const { data: rideTypesData } = useRideTypesQuery({ page: 1, limit: 100 });
  const allRideTypes = useMemo(
    () => rideTypesData?.rideTypes ?? [],
    [rideTypesData],
  );

  const { data: regions = [], isLoading: regionsLoading } = useRegionsQuery();

  // Per-row UI state: one fare set applied to every day, or expanded per-day
  // rows. Keyed by the field-array's stable id. A row is uniform unless it has
  // been explicitly toggled off — `?? true` is the single source of that default.
  const [sameForAll, setSameForAll] = useState<Record<string, boolean>>({});

  // The resolver runs outside of render, so it reads these refs rather than
  // closing over state (which would also make it depend on `fields`, and
  // `fields` doesn't exist until after useForm).
  const sameForAllRef = useRef<Record<string, boolean>>({});
  const fieldIdsRef = useRef<string[]>([]);

  const rowIsUniform = useCallback((rowIndex: number): boolean => {
    const id = fieldIdsRef.current[rowIndex];
    return id ? (sameForAllRef.current[id] ?? true) : true;
  }, []);

  // Mirror day 0 across the week for uniform rows BEFORE validating. In uniform
  // mode only day 0 is rendered, so validating the raw values would let a stale
  // value on a hidden day (1–6) block submit with an error nobody can see or
  // fix. RHF hands the resolver's output to onSubmit, so this is also what gets
  // sent to the backend.
  const resolver = useCallback<Resolver<PricingFormInput>>(
    (values, context, options) => {
      const normalised: PricingFormInput = {
        ...values,
        rideTypes: (values.rideTypes ?? []).map((row, idx) => {
          if (!rowIsUniform(idx)) return row;
          const [first] = normaliseWeek(row.weeklyFare);
          return { ...row, weeklyFare: spreadAcrossWeek(first) };
        }),
      };
      return baseResolver(normalised, context, options);
    },
    [rowIsUniform],
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PricingFormInput>({
    resolver,
    mode: "onTouched",
    defaultValues: emptyDefaults(defaultRegionId),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rideTypes",
  });

  // Keep the refs the resolver reads in step with render state.
  useEffect(() => {
    sameForAllRef.current = sameForAll;
    fieldIdsRef.current = fields.map((f) => f.id);
  }, [sameForAll, fields]);

  const watchedRegionId = watch("region");

  // Selected region — drives the read-only currency and filters ride types by
  // their `allowedRegions` (a list of region _ids).
  const selectedRegion = useMemo(
    () => regions.find((r) => r._id === watchedRegionId),
    [regions, watchedRegionId],
  );

  // Reset on open or pricing change.
  useEffect(() => {
    if (!isOpen) return;
    setSameForAll({});
    if (pricing) {
      // Drop rows whose ride type was deleted — they'd load as an empty select
      // and block save with "Select a ride type" for no visible reason.
      const rows = pricing.rideTypes
        .filter((rt) => !!rt.rideType)
        .map((rt) => ({
          rideType: refId(rt.rideType),
          weeklyFare: normaliseWeek(rt.weeklyFare),
        }));
      reset({
        region: regionRefId(pricing.region),
        rideTypes: rows.length > 0 ? rows : [blankRow()],
      });
    } else {
      reset(emptyDefaults(defaultRegionId));
    }
  }, [isOpen, pricing, defaultRegionId, reset]);

  // Once fields populate (edit mode), default each row's toggle from whether
  // the loaded week is actually uniform.
  useEffect(() => {
    if (!isOpen) return;
    setSameForAll((prev) => {
      const next = { ...prev };
      fields.forEach((f, idx) => {
        if (next[f.id] !== undefined) return;
        next[f.id] = isUniformWeek(getValues(`rideTypes.${idx}.weeklyFare`));
      });
      return next;
    });
  }, [fields, isOpen, getValues]);

  // Ride types valid for the chosen region.
  const availableRideTypes = useMemo(
    () =>
      watchedRegionId
        ? allRideTypes.filter((rt) =>
            rt.allowedRegions.includes(watchedRegionId),
          )
        : [],
    [allRideTypes, watchedRegionId],
  );

  const createMutation = useCreatePricing();
  const updateMutation = useUpdatePricing();

  // Push day 0's values across the rest of the week for a given row.
  const copyFirstDayToAll = (rowIndex: number) => {
    const week = normaliseWeek(getValues(`rideTypes.${rowIndex}.weeklyFare`));
    setValue(`rideTypes.${rowIndex}.weeklyFare`, spreadAcrossWeek(week[0]), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (values: PricingFormInput) => {
    try {
      // Currency is server-derived from the region, but the update path expects
      // it echoed back. Fall back to the existing pricing's currency so the
      // payload shape doesn't depend on whether `regions` has resolved yet.
      const currency = selectedRegion?.currency ?? pricing?.currency;

      const payload: PricingCreateInput = {
        region: values.region,
        ...(currency ? { currency } : {}),
        // The resolver already mirrored day 0 across the week for uniform rows.
        rideTypes: values.rideTypes,
      };

      if (isEdit && pricing) {
        await updateMutation.mutateAsync({ id: pricing._id, data: payload });
        toast.success("Pricing updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Pricing created");
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
      className="max-w-4xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
    >
      <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
        {isEdit ? "Edit Pricing" : "Create Pricing"}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Set fare rules for each ride type in a region. Fares can vary by day of
        the week.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={isSubmitting} className="space-y-5">
          {/* Region + currency (currency is read-only, derived from region) */}
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
                    {regions.map((r) => {
                      // One fare document per region — an already-priced region
                      // can only be edited, not created again.
                      const priced = !isEdit && pricedRegionIds?.has(r._id);
                      return (
                        <option key={r._id} value={r._id} disabled={priced}>
                          {r.country} ({r.code})
                          {priced ? " — already priced" : ""}
                        </option>
                      );
                    })}
                    {/* Keep the loaded value visible if the regions list hasn't returned yet (edit mode). */}
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
              {!isEdit && (
                <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                  Each region has one fare. To add a ride type to a region
                  that's already priced, edit its pricing instead.
                </p>
              )}
            </div>

            <div>
              <Label>Currency</Label>
              <Input
                type="text"
                value={selectedRegion?.currency ?? pricing?.currency ?? ""}
                placeholder="—"
                readOnly
                disabled
              />
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Set automatically from the selected region.
              </p>
            </div>
          </div>

          {/* Ride type rows */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>
                Ride types <span className="text-error-500">*</span>
              </Label>
              <button
                type="button"
                onClick={() => append(blankRow())}
                disabled={!watchedRegionId}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-brand-400 dark:hover:bg-brand-500/10"
              >
                <Plus className="size-3.5" />
                Add ride type
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
                const uniform = sameForAll[field.id] ?? true;
                const rowErr = errors.rideTypes?.[index];
                return (
                  <div
                    key={field.id}
                    className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <Controller
                        name={`rideTypes.${index}.rideType`}
                        control={control}
                        render={({ field: f }) => (
                          <select
                            value={f.value}
                            onChange={f.onChange}
                            onBlur={f.onBlur}
                            className="h-9 flex-1 rounded-lg border border-gray-300 bg-transparent px-2 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                          >
                            <option value="">Select ride type…</option>
                            {availableRideTypes.map((rt) => (
                              <option key={rt._id} value={rt._id}>
                                {rt.title} ({rt.passengers}p)
                              </option>
                            ))}
                            {/* Always show the currently-selected option even if it's not valid for the region (e.g. legacy data). */}
                            {f.value &&
                              !availableRideTypes.some(
                                (rt) => rt._id === f.value,
                              ) && (
                                <option value={f.value}>
                                  Existing assignment ({f.value.slice(0, 8)}…)
                                </option>
                              )}
                          </select>
                        )}
                      />
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

                    {rowErr?.rideType && (
                      <p className="mb-2 text-xs text-error-500">
                        {rowErr.rideType?.message}
                      </p>
                    )}

                    {/* Same-for-all toggle */}
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={uniform}
                          onChange={(e) =>
                            setSameForAll((prev) => ({
                              ...prev,
                              [field.id]: e.target.checked,
                            }))
                          }
                          className="size-3.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
                        />
                        Same fare for all days
                      </label>
                      {!uniform && (
                        <button
                          type="button"
                          onClick={() => copyFirstDayToAll(index)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
                        >
                          <Copy className="size-3" />
                          Copy Sun → all days
                        </button>
                      )}
                    </div>

                    {uniform ? (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                        {FARE_FIELDS.map((f) => (
                          <NumberField
                            key={f.key}
                            control={control}
                            fareField={f}
                            name={`rideTypes.${index}.weeklyFare.0.${f.key}`}
                            label={f.label}
                            error={!!rowErr?.weeklyFare?.[0]?.[f.key]}
                            errorMsg={rowErr?.weeklyFare?.[0]?.[f.key]?.message}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            <tr>
                              <th className="px-1 py-1 font-medium">Day</th>
                              {FARE_FIELDS.map((f) => (
                                <th key={f.key} className="px-1 py-1 font-medium">
                                  {f.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {DAYS.map((d) => (
                              <tr
                                key={d.value}
                                className="border-t border-gray-100 dark:border-gray-800"
                              >
                                <td className="px-1 py-1.5 font-medium text-gray-700 dark:text-gray-200">
                                  {d.short}
                                </td>
                                {FARE_FIELDS.map((f) => (
                                  <td key={f.key} className="px-1 py-1.5">
                                    <NumberField
                                      control={control}
                                      fareField={f}
                                      name={`rideTypes.${index}.weeklyFare.${d.value}.${f.key}`}
                                      hideLabel
                                      label={`${d.long} ${f.label}`}
                                      error={
                                        !!rowErr?.weeklyFare?.[d.value]?.[f.key]
                                      }
                                      errorMsg={
                                        rowErr?.weeklyFare?.[d.value]?.[f.key]
                                          ?.message
                                      }
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {errors.rideTypes &&
              !Array.isArray(errors.rideTypes) &&
              "message" in errors.rideTypes && (
                <p className="mt-2 text-xs text-error-500">
                  {errors.rideTypes.message as string}
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
            <Button type="submit" size="sm" loading={isSubmitting}>
              {isSubmitting
                ? isEdit
                  ? "Saving…"
                  : "Creating…"
                : isEdit
                  ? "Save changes"
                  : "Create"}
            </Button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}

// Tiny field wrapper used only inside this modal — keeps the JSX above readable.
type FareFieldName =
  `rideTypes.${number}.weeklyFare.${number}.${FareFieldKey}`;

interface NumberFieldProps {
  control: ReturnType<typeof useForm<PricingFormInput>>["control"];
  name: FareFieldName;
  fareField: FareField;
  label: string;
  hideLabel?: boolean;
  error: boolean;
  errorMsg?: string;
}

function NumberField({
  control,
  name,
  fareField,
  label,
  hideLabel,
  error,
  errorMsg,
}: NumberFieldProps) {
  const isMultiplier = fareField.kind === "multiplier";
  return (
    <div>
      {!hideLabel && (
        <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </span>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            type="number"
            name={field.name}
            value={
              field.value === undefined || Number.isNaN(field.value as number)
                ? ""
                : (field.value as number)
            }
            onChange={(e) => {
              const raw = e.target.value;
              field.onChange(raw === "" ? undefined : Number(raw));
            }}
            onBlur={field.onBlur}
            inputMode="decimal"
            // Money takes cents; surge is a multiplier floored at 1× (0 would
            // make the ride free).
            step={isMultiplier ? 0.1 : 0.01}
            min={isMultiplier ? "1" : "0"}
            error={error}
            aria-invalid={error}
          />
        )}
      />
      {errorMsg && (
        <p className="mt-0.5 text-[10px] text-error-500">{errorMsg}</p>
      )}
    </div>
  );
}
