import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import {
  EXTRA_CHARGE_CODES,
  EXTRA_CHARGE_HINTS,
  EXTRA_CHARGE_LABELS,
  extraChargeFormSchema,
  type ExtraChargeFormInput,
} from "../../schemas/extraCharge.schema";
import { getErrorMessage } from "../../lib/error";
import { regionRefId } from "../../lib/refs";
import {
  useCreateExtraCharge,
  useUpdateExtraCharge,
} from "../../hooks/queries/useExtraCharges";
import { useRegionsQuery } from "../../hooks/queries/useRegions";
import type { ExtraChargeConfig } from "../../types/extraCharge";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config?: ExtraChargeConfig | null; // edit mode if provided
  defaultRegionId?: string;
  // Regions that already have a config — hidden from the create dropdown
  // (one config per region, enforced server-side too).
  configuredRegionIds?: Set<string>;
}

// The form always carries all six predefined rows, in vocabulary order.
const fullRows = (config?: ExtraChargeConfig | null) => {
  const byCode = new Map(
    (config?.charges ?? []).map((c) => [c.code, c] as const),
  );
  return EXTRA_CHARGE_CODES.map((code) => ({
    code,
    amount: byCode.get(code)?.amount ?? 0,
    isActive: byCode.get(code)?.isActive ?? false,
  }));
};

const emptyDefaults = (defaultRegionId?: string): ExtraChargeFormInput => ({
  region: defaultRegionId ?? "",
  charges: fullRows(),
});

export default function ExtraChargeFormModal({
  isOpen,
  onClose,
  config,
  defaultRegionId,
  configuredRegionIds,
}: Props) {
  const isEdit = Boolean(config);

  const { data: regions = [], isLoading: regionsLoading } = useRegionsQuery();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExtraChargeFormInput>({
    resolver: zodResolver(extraChargeFormSchema),
    mode: "onTouched",
    defaultValues: emptyDefaults(defaultRegionId),
  });

  const watchedRegionId = watch("region");
  const watchedCharges = watch("charges");

  const selectedRegion = useMemo(
    () => regions.find((r) => r._id === watchedRegionId),
    [regions, watchedRegionId],
  );

  // Create mode only offers regions that don't have a config yet; edit mode
  // pins the region.
  const selectableRegions = useMemo(
    () =>
      isEdit
        ? regions
        : regions.filter((r) => !configuredRegionIds?.has(r._id)),
    [regions, isEdit, configuredRegionIds],
  );

  useEffect(() => {
    if (!isOpen) return;
    if (config) {
      reset({ region: regionRefId(config.region), charges: fullRows(config) });
    } else {
      reset(emptyDefaults(defaultRegionId));
    }
  }, [isOpen, config, defaultRegionId, reset]);

  const createMutation = useCreateExtraCharge();
  const updateMutation = useUpdateExtraCharge();

  const onSubmit = async (values: ExtraChargeFormInput) => {
    try {
      const payload = {
        region: values.region,
        charges: values.charges,
      };

      if (isEdit && config) {
        await updateMutation.mutateAsync({ id: config._id, data: payload });
        toast.success("Extra charges updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Extra charges created");
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
        {isEdit ? "Edit Extra Charges" : "Create Extra Charges"}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Fixed surcharges drivers can apply on the finish-ride screen. Drivers
        only tick a box — the amounts set here are what riders pay.
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
                    {selectableRegions.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.country} ({r.code})
                      </option>
                    ))}
                    {field.value &&
                      !selectableRegions.some((r) => r._id === field.value) && (
                        <option value={field.value}>
                          {selectedRegion
                            ? `${selectedRegion.country} (${selectedRegion.code})`
                            : `Existing region (${field.value.slice(0, 8)}…)`}
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
                value={selectedRegion?.currency ?? config?.currency ?? ""}
                placeholder="—"
                readOnly
                disabled
              />
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Set automatically from the selected region.
              </p>
            </div>
          </div>

          {/* Fixed charge rows */}
          <div className="space-y-3">
            <Label>Charges</Label>
            {EXTRA_CHARGE_CODES.map((code, index) => {
              const rowError = errors.charges?.[index]?.amount;
              const isActive = !!watchedCharges?.[index]?.isActive;
              return (
                <div
                  key={code}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-white/[0.02]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {EXTRA_CHARGE_LABELS[code]}
                      </p>
                      {EXTRA_CHARGE_HINTS[code] && (
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {EXTRA_CHARGE_HINTS[code]}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-28">
                        <Controller
                          name={`charges.${index}.amount`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              name={field.name}
                              value={
                                field.value === undefined ||
                                Number.isNaN(field.value as number)
                                  ? ""
                                  : (field.value as number)
                              }
                              onChange={(e) => {
                                const raw = e.target.value;
                                field.onChange(
                                  raw === "" ? undefined : Number(raw),
                                );
                              }}
                              onBlur={field.onBlur}
                              inputMode="decimal"
                              step={0.01}
                              min="0"
                              error={!!rowError}
                              aria-invalid={!!rowError}
                            />
                          )}
                        />
                      </div>

                      <Controller
                        name={`charges.${index}.isActive`}
                        control={control}
                        render={({ field }) => (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={field.value}
                            aria-label={`${EXTRA_CHARGE_LABELS[code]} active`}
                            onClick={() =>
                              setValue(
                                `charges.${index}.isActive`,
                                !field.value,
                                { shouldDirty: true, shouldValidate: true },
                              )
                            }
                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                              field.value
                                ? "bg-brand-500"
                                : "bg-gray-300 dark:bg-gray-700"
                            }`}
                          >
                            <span
                              className={`inline-block size-5 transform rounded-full bg-white shadow transition ${
                                field.value
                                  ? "translate-x-5"
                                  : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        )}
                      />
                    </div>
                  </div>
                  {rowError && (
                    <p className="mt-1 text-xs text-error-500">
                      {rowError.message as string}
                    </p>
                  )}
                  {!rowError && isActive && (
                    <p className="mt-1 text-[11px] text-success-700 dark:text-success-400">
                      Offered to drivers at ride completion.
                    </p>
                  )}
                </div>
              );
            })}
            {errors.charges &&
              !Array.isArray(errors.charges) &&
              errors.charges.message && (
                <p className="text-xs text-error-500">
                  {errors.charges.message as string}
                </p>
              )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEdit ? "Save Changes" : "Create"}
            </Button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
