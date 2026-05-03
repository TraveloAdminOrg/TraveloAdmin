import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { REGIONS, regionCurrency, type RegionCode } from "../../lib/regions";
import {
  pricingFormSchema,
  type PricingFormInput,
} from "../../schemas/pricing.schema";
import { getErrorMessage } from "../../lib/error";
import {
  useCreatePricing,
  useUpdatePricing,
} from "../../hooks/queries/usePricings";
import { useRideTypesQuery } from "../../hooks/queries/useRideTypes";
import type { Pricing } from "../../types/pricing";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pricing?: Pricing | null; // edit mode if provided
  defaultRegion?: RegionCode; // pre-selects this region in create mode
}

const blankRow = () => ({
  rideType: "",
  baseFare: 0,
  pricePerKm: 0,
  pricePerMinute: 0,
  minimumFare: 0,
  cancellationFee: 0,
});

const emptyDefaults = (defaultRegion?: RegionCode): PricingFormInput => {
  const region = defaultRegion ?? "PK";
  return {
    countryCode: region,
    currency: regionCurrency(region),
    rideTypes: [blankRow()],
  };
};

export default function PricingFormModal({
  isOpen,
  onClose,
  pricing,
  defaultRegion,
}: Props) {
  const isEdit = Boolean(pricing);

  // Pull all ride types so we can populate the per-row dropdown.
  // Fetch a generous page size so we don't have to paginate inside the form.
  const { data: rideTypesData } = useRideTypesQuery({ page: 1, limit: 100 });
  const allRideTypes = rideTypesData?.rideTypes ?? [];

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PricingFormInput>({
    resolver: zodResolver(pricingFormSchema),
    mode: "onTouched",
    defaultValues: emptyDefaults(defaultRegion),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rideTypes",
  });

  const watchedCountry = watch("countryCode") as RegionCode;

  // Reset on open or pricing change.
  useEffect(() => {
    if (!isOpen) return;
    if (pricing) {
      reset({
        countryCode: pricing.countryCode,
        currency: pricing.currency,
        rideTypes: pricing.rideTypes.map((rt) => ({
          rideType: rt.rideType,
          baseFare: rt.baseFare,
          pricePerKm: rt.pricePerKm,
          pricePerMinute: rt.pricePerMinute,
          minimumFare: rt.minimumFare,
          cancellationFee: rt.cancellationFee,
        })),
      });
    } else {
      reset(emptyDefaults(defaultRegion));
    }
  }, [isOpen, pricing, defaultRegion, reset]);

  // Auto-fill currency when country changes (only if user hasn't typed something custom).
  useEffect(() => {
    if (!isOpen) return;
    if (!watchedCountry) return;
    const auto = regionCurrency(watchedCountry);
    if (auto) setValue("currency", auto, { shouldDirty: true });
  }, [watchedCountry, isOpen, setValue]);

  // Ride types valid for the chosen country.
  const availableRideTypes = useMemo(
    () =>
      allRideTypes.filter((rt) =>
        rt.allowedRegions.includes(watchedCountry as RegionCode),
      ),
    [allRideTypes, watchedCountry],
  );

  const createMutation = useCreatePricing();
  const updateMutation = useUpdatePricing();

  const onSubmit = async (values: PricingFormInput) => {
    try {
      const payload = {
        countryCode: values.countryCode as RegionCode,
        currency: values.currency,
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
      className="max-w-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
    >
      <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
        {isEdit ? "Edit Pricing" : "Create Pricing"}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Set fare rules for each ride type in a region.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={isSubmitting} className="space-y-5">
          {/* Country + currency */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>
                Country <span className="text-error-500">*</span>
              </Label>
              <Controller
                name="countryCode"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isEdit /* don't move existing pricing across regions */}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    {REGIONS.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.label} ({r.code})
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.countryCode && (
                <p className="mt-1 text-xs text-error-500">
                  {errors.countryCode.message as string}
                </p>
              )}
            </div>

            <div>
              <Label>
                Currency <span className="text-error-500">*</span>
              </Label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    name={field.name}
                    placeholder="PKR"
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                    onBlur={field.onBlur}
                    maxLength={8}
                    error={!!errors.currency}
                    aria-invalid={!!errors.currency}
                  />
                )}
              />
              {errors.currency && (
                <p className="mt-1 text-xs text-error-500">
                  {errors.currency.message}
                </p>
              )}
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
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
              >
                <Plus className="size-3.5" />
                Add ride type
              </button>
            </div>

            {availableRideTypes.length === 0 && (
              <p className="mb-2 rounded-lg border border-dashed border-warning-200 bg-warning-50 p-2 text-xs text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-400">
                No ride types are available for{" "}
                {REGIONS.find((r) => r.code === watchedCountry)?.label}. Create
                one in the Ride Types page first.
              </p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => (
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

                  {errors.rideTypes?.[index]?.rideType && (
                    <p className="mb-2 text-xs text-error-500">
                      {errors.rideTypes[index]?.rideType?.message}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    <NumberField
                      control={control}
                      name={`rideTypes.${index}.baseFare`}
                      label="Base"
                      error={!!errors.rideTypes?.[index]?.baseFare}
                      errorMsg={errors.rideTypes?.[index]?.baseFare?.message}
                    />
                    <NumberField
                      control={control}
                      name={`rideTypes.${index}.pricePerKm`}
                      label="Per km"
                      error={!!errors.rideTypes?.[index]?.pricePerKm}
                      errorMsg={errors.rideTypes?.[index]?.pricePerKm?.message}
                    />
                    <NumberField
                      control={control}
                      name={`rideTypes.${index}.pricePerMinute`}
                      label="Per min"
                      error={!!errors.rideTypes?.[index]?.pricePerMinute}
                      errorMsg={
                        errors.rideTypes?.[index]?.pricePerMinute?.message
                      }
                    />
                    <NumberField
                      control={control}
                      name={`rideTypes.${index}.minimumFare`}
                      label="Min fare"
                      error={!!errors.rideTypes?.[index]?.minimumFare}
                      errorMsg={errors.rideTypes?.[index]?.minimumFare?.message}
                    />
                    <NumberField
                      control={control}
                      name={`rideTypes.${index}.cancellationFee`}
                      label="Cancel fee"
                      error={!!errors.rideTypes?.[index]?.cancellationFee}
                      errorMsg={
                        errors.rideTypes?.[index]?.cancellationFee?.message
                      }
                    />
                  </div>
                </div>
              ))}
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
            <Button type="submit" size="sm" disabled={isSubmitting}>
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
interface NumberFieldProps {
  control: ReturnType<typeof useForm<PricingFormInput>>["control"];
  name:
    | `rideTypes.${number}.baseFare`
    | `rideTypes.${number}.pricePerKm`
    | `rideTypes.${number}.pricePerMinute`
    | `rideTypes.${number}.minimumFare`
    | `rideTypes.${number}.cancellationFee`;
  label: string;
  error: boolean;
  errorMsg?: string;
}

function NumberField({ control, name, label, error, errorMsg }: NumberFieldProps) {
  return (
    <div>
      <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </span>
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
            error={error}
            aria-invalid={error}
          />
        )}
      />
      {errorMsg && <p className="mt-0.5 text-[10px] text-error-500">{errorMsg}</p>}
    </div>
  );
}
