import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import {
  rideTypeFormSchema,
  TITLE_MAX_LENGTH,
  type RideTypeFormInput,
} from "../../schemas/rideType.schema";
import { getErrorMessage } from "../../lib/error";
import {
  useCreateRideType,
  useUpdateRideType,
} from "../../hooks/queries/useRideTypes";
import { useRegionsQuery } from "../../hooks/queries/useRegions";
import type { RideType } from "../../types/rideType";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  rideType?: RideType | null; // edit mode if provided
  defaultRegionId?: string; // pre-selects this region in create mode (region _id)
}

const emptyDefaults = (defaultRegionId?: string): RideTypeFormInput => ({
  title: "",
  passengers: 1,
  allowedRegions: defaultRegionId ? [defaultRegionId] : [],
  isActive: true,
  icon: "",
});

export default function RideTypeFormModal({
  isOpen,
  onClose,
  rideType,
  defaultRegionId,
}: Props) {
  const isEdit = Boolean(rideType);

  const { data: regions = [], isLoading: regionsLoading } = useRegionsQuery();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RideTypeFormInput>({
    resolver: zodResolver(rideTypeFormSchema),
    mode: "onTouched",
    defaultValues: emptyDefaults(defaultRegionId),
  });

  // Reset form whenever modal opens or rideType changes.
  useEffect(() => {
    if (!isOpen) return;
    if (rideType) {
      reset({
        title: rideType.title,
        passengers: rideType.passengers,
        allowedRegions: rideType.allowedRegions,
        isActive: rideType.isActive,
        icon: rideType.icon ?? "",
      });
    } else {
      reset(emptyDefaults(defaultRegionId));
    }
  }, [isOpen, rideType, defaultRegionId, reset]);

  const createMutation = useCreateRideType();
  const updateMutation = useUpdateRideType();

  const onSubmit = async (values: RideTypeFormInput) => {
    try {
      const payload = {
        ...values,
        icon: values.icon || undefined,
      };

      if (isEdit && rideType) {
        await updateMutation.mutateAsync({ id: rideType._id, data: payload });
        toast.success("Ride type updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Ride type created");
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
      className="max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
    >
      <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
        {isEdit ? "Edit Ride Type" : "Create Ride Type"}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {isEdit
          ? "Update the details of this ride type."
          : "Add a new ride type and choose which regions it's available in."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={isSubmitting} className="space-y-5">
          <div>
            <Label>
              Title <span className="text-error-500">*</span>
            </Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  type="text"
                  name={field.name}
                  placeholder="e.g. Bike, Four seater, Economy"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  maxLength={TITLE_MAX_LENGTH}
                  autoFocus
                  required
                  error={!!errors.title}
                  aria-invalid={!!errors.title}
                />
              )}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-error-500">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label>
              Passengers <span className="text-error-500">*</span>
            </Label>
            <Controller
              name="passengers"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  name={field.name}
                  placeholder="4"
                  value={
                    field.value === undefined || Number.isNaN(field.value)
                      ? ""
                      : field.value
                  }
                  onChange={(e) => {
                    const raw = e.target.value;
                    field.onChange(raw === "" ? undefined : Number(raw));
                  }}
                  onBlur={field.onBlur}
                  inputMode="numeric"
                  required
                  error={!!errors.passengers}
                  aria-invalid={!!errors.passengers}
                />
              )}
            />
            {errors.passengers && (
              <p className="mt-1 text-xs text-error-500">
                {errors.passengers.message}
              </p>
            )}
          </div>

          <div>
            <Label>Icon URL</Label>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <Input
                  type="url"
                  name={field.name}
                  placeholder="https://…"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!errors.icon}
                  aria-invalid={!!errors.icon}
                />
              )}
            />
            {errors.icon && (
              <p className="mt-1 text-xs text-error-500">
                {errors.icon.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optional. Leave blank to use the default placeholder.
            </p>
          </div>

          <div>
            <Label>
              Allowed Regions <span className="text-error-500">*</span>
            </Label>
            <Controller
              name="allowedRegions"
              control={control}
              render={({ field }) => {
                const value = (field.value ?? []) as string[];
                return (
                  <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    {regionsLoading ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Loading regions…
                      </p>
                    ) : regions.length === 0 ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        No regions configured yet.
                      </p>
                    ) : (
                      regions.map((r) => (
                        <Checkbox
                          key={r._id}
                          label={`${r.country} (${r.code})`}
                          checked={value.includes(r._id)}
                          onChange={(checked) => {
                            field.onChange(
                              checked
                                ? [...value, r._id]
                                : value.filter((v) => v !== r._id),
                            );
                          }}
                        />
                      ))
                    )}
                    {/* Surface any pre-selected region _ids that aren't in the loaded list (e.g. stale or deactivated). */}
                    {value
                      .filter((id) => !regions.some((r) => r._id === id))
                      .map((id) => (
                        <Checkbox
                          key={id}
                          label={`Existing region (${id.slice(0, 8)}…)`}
                          checked
                          onChange={(checked) => {
                            field.onChange(
                              checked ? value : value.filter((v) => v !== id),
                            );
                          }}
                        />
                      ))}
                  </div>
                );
              }}
            />
            {errors.allowedRegions && (
              <p className="mt-1 text-xs text-error-500">
                {errors.allowedRegions.message as string}
              </p>
            )}
          </div>

          <div>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="Active"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
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
