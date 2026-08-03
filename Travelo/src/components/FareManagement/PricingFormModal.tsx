import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Copy } from "lucide-react";
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
import type {
  Pricing,
  PricingCreateInput,
  PricingUpdateInput,
} from "../../types/pricing";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pricing?: Pricing | null; // edit mode if provided — one fare record (region+rideType pair)
  defaultRegionId?: string; // pre-selects this region in create mode (region _id)
  // Ride type ids already priced for each region (region _id -> Set of ride type _ids).
  // Used in create mode to hide ride types that already have a fare record for
  // the selected region.
  existingRideTypeIdsByRegion?: Map<string, Set<string>>;
  // Regions where every active, applicable ride type already has a fare record —
  // nothing left to add there via Create.
  fullyPricedRegionIds?: Set<string>;
}

const emptyDefaults = (defaultRegionId?: string): PricingFormInput => ({
  region: defaultRegionId ?? "",
  rideType: "",
  weeklyFare: blankWeek(),
});

const resolver = zodResolver(pricingFormSchema);

export default function PricingFormModal({
  isOpen,
  onClose,
  pricing,
  defaultRegionId,
  existingRideTypeIdsByRegion,
  fullyPricedRegionIds,
}: Props) {
  const isEdit = Boolean(pricing);

  // Pull all ride types so we can populate the ride-type dropdown.
  // Fetch a generous page size so we don't have to paginate inside the form.
  const { data: rideTypesData } = useRideTypesQuery({ page: 1, limit: 100 });
  const allRideTypes = useMemo(
    () => rideTypesData?.rideTypes ?? [],
    [rideTypesData],
  );

  const { data: regions = [], isLoading: regionsLoading } = useRegionsQuery();

  // One fare set applied to every day, or expanded per-day rows. A record is
  // uniform unless explicitly toggled off — `?? true` is the default.
  const [sameForAll, setSameForAll] = useState(true);

  // Mirror day 0 across the week when uniform, BEFORE validating. In uniform
  // mode only day 0 is rendered, so validating the raw values would let a
  // stale value on a hidden day (1–6) block submit with an error nobody can
  // see or fix. RHF hands the resolver's output to onSubmit, so this is also
  // what gets sent to the backend.
  const uniformResolver = (
    values: PricingFormInput,
    context: unknown,
    options: Parameters<typeof resolver>[2],
  ) => {
    const normalised: PricingFormInput = sameForAll
      ? { ...values, weeklyFare: spreadAcrossWeek(normaliseWeek(values.weeklyFare)[0]) }
      : values;
    return resolver(normalised, context, options);
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PricingFormInput>({
    resolver: uniformResolver,
    mode: "onTouched",
    defaultValues: emptyDefaults(defaultRegionId),
  });

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
    if (pricing) {
      const week = normaliseWeek(pricing.weeklyFare);
      setSameForAll(isUniformWeek(pricing.weeklyFare));
      reset({
        region: regionRefId(pricing.region),
        rideType: refId(pricing.rideType),
        weeklyFare: week,
      });
    } else {
      setSameForAll(true);
      reset(emptyDefaults(defaultRegionId));
    }
  }, [isOpen, pricing, defaultRegionId, reset]);

  // Ride types valid for the chosen region. In create mode, ride types
  // already priced for that region are excluded — they're what makes adding
  // a new ride type to an already-priced region possible without colliding
  // with what's already there.
  const availableRideTypes = useMemo(() => {
    if (!watchedRegionId) return [];
    const alreadyPriced = !isEdit
      ? existingRideTypeIdsByRegion?.get(watchedRegionId)
      : undefined;
    return allRideTypes.filter(
      (rt) =>
        rt.allowedRegions.includes(watchedRegionId) &&
        !(alreadyPriced?.has(rt._id) ?? false),
    );
  }, [allRideTypes, watchedRegionId, isEdit, existingRideTypeIdsByRegion]);

  const createMutation = useCreatePricing();
  const updateMutation = useUpdatePricing();

  // Push day 0's values across the rest of the week.
  const copyFirstDayToAll = () => {
    const week = normaliseWeek(getValues("weeklyFare"));
    setValue("weeklyFare", spreadAcrossWeek(week[0]), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (values: PricingFormInput) => {
    try {
      if (isEdit && pricing) {
        const payload: PricingUpdateInput = { weeklyFare: values.weeklyFare };
        await updateMutation.mutateAsync({ id: pricing._id, data: payload });
        toast.success("Pricing updated");
      } else {
        const payload: PricingCreateInput = {
          region: values.region,
          rideType: values.rideType,
          weeklyFare: values.weeklyFare,
        };
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
      className="max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
    >
      <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
        {isEdit ? "Edit Pricing" : "Create Pricing"}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Set fare rules for one ride type in a region. Fares can vary by day of
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
                      // Disabled only once every applicable ride type already
                      // has a fare record for this region — otherwise it's
                      // still selectable to add the remaining ride type(s).
                      const fullyPriced =
                        !isEdit && fullyPricedRegionIds?.has(r._id);
                      return (
                        <option key={r._id} value={r._id} disabled={fullyPriced}>
                          {r.country} ({r.code})
                          {fullyPriced ? " — fully priced" : ""}
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
                  Each region+ride-type combination is its own fare record.
                  Ride types already priced for the selected region won't be
                  listed below.
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

          {/* Ride type */}
          <div>
            <Label>
              Ride type <span className="text-error-500">*</span>
            </Label>
            <Controller
              name="rideType"
              control={control}
              render={({ field }) => (
                <select
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={isEdit}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="">
                    {!watchedRegionId
                      ? "Pick a region first…"
                      : "Select ride type…"}
                  </option>
                  {availableRideTypes.map((rt) => (
                    <option key={rt._id} value={rt._id}>
                      {rt.title} ({rt.passengers}p)
                    </option>
                  ))}
                  {/* Always show the currently-selected option even if it's not in the filtered list (e.g. legacy data). */}
                  {field.value &&
                    !availableRideTypes.some((rt) => rt._id === field.value) && (
                      <option value={field.value}>
                        Existing assignment ({field.value.slice(0, 8)}…)
                      </option>
                    )}
                </select>
              )}
            />
            {errors.rideType && (
              <p className="mt-1 text-xs text-error-500">
                {errors.rideType.message as string}
              </p>
            )}
            {watchedRegionId && !isEdit && availableRideTypes.length === 0 && (
              <p className="mt-1 rounded-lg border border-dashed border-warning-200 bg-warning-50 p-2 text-xs text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-400">
                Every ride type available for{" "}
                <span className="capitalize">
                  {selectedRegion?.country ?? "this region"}
                </span>{" "}
                already has a fare record.
              </p>
            )}
          </div>

          {/* Weekly fare */}
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <Label className="mb-0">Fare</Label>
              <div className="flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={sameForAll}
                    onChange={(e) => setSameForAll(e.target.checked)}
                    className="size-3.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
                  />
                  Same fare for all days
                </label>
                {!sameForAll && (
                  <button
                    type="button"
                    onClick={copyFirstDayToAll}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
                  >
                    <Copy className="size-3" />
                    Copy Sun → all days
                  </button>
                )}
              </div>
            </div>

            {sameForAll ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                {FARE_FIELDS.map((f) => (
                  <NumberField
                    key={f.key}
                    control={control}
                    fareField={f}
                    name={`weeklyFare.0.${f.key}`}
                    label={f.label}
                    error={!!errors.weeklyFare?.[0]?.[f.key]}
                    errorMsg={errors.weeklyFare?.[0]?.[f.key]?.message}
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
                              name={`weeklyFare.${d.value}.${f.key}`}
                              hideLabel
                              label={`${d.long} ${f.label}`}
                              error={!!errors.weeklyFare?.[d.value]?.[f.key]}
                              errorMsg={errors.weeklyFare?.[d.value]?.[f.key]?.message}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {errors.weeklyFare &&
              !Array.isArray(errors.weeklyFare) &&
              "message" in errors.weeklyFare && (
                <p className="mt-2 text-xs text-error-500">
                  {errors.weeklyFare.message as string}
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
type FareFieldName = `weeklyFare.${number}.${FareFieldKey}`;

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
