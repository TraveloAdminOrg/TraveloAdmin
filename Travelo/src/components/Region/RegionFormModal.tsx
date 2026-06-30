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
  regionFormSchema,
  COUNTRY_MAX_LENGTH,
  type RegionFormInput,
} from "../../schemas/region.schema";
import { getErrorMessage } from "../../lib/error";
import {
  useCreateRegion,
  useUpdateRegion,
} from "../../hooks/queries/useRegions";
import type { Region } from "../../types/region";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  region?: Region | null; // edit mode if provided
}

const emptyDefaults = (): RegionFormInput => ({
  country: "",
  code: "",
  currency: "",
  isActive: true,
});

export default function RegionFormModal({ isOpen, onClose, region }: Props) {
  const isEdit = Boolean(region);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegionFormInput>({
    resolver: zodResolver(regionFormSchema),
    mode: "onTouched",
    defaultValues: emptyDefaults(),
  });

  // Reset form whenever modal opens or region changes.
  useEffect(() => {
    if (!isOpen) return;
    if (region) {
      reset({
        country: region.country,
        code: region.code,
        currency: region.currency,
        isActive: region.isActive,
      });
    } else {
      reset(emptyDefaults());
    }
  }, [isOpen, region, reset]);

  const createMutation = useCreateRegion();
  const updateMutation = useUpdateRegion();

  const onSubmit = async (values: RegionFormInput) => {
    try {
      const payload = {
        country: values.country.trim(),
        code: values.code.trim().toUpperCase(),
        currency: values.currency.trim().toUpperCase(),
        isActive: values.isActive,
      };

      if (isEdit && region) {
        await updateMutation.mutateAsync({ id: region._id, data: payload });
        toast.success("Region updated");
      } else {
        // Preserve existing cities; new regions start with none.
        await createMutation.mutateAsync({ ...payload, cities: [] });
        toast.success("Region created");
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
        {isEdit ? "Edit Region" : "Create Region"}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {isEdit
          ? "Update the details of this region."
          : "Add a new operating region with its country, code, and currency."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={isSubmitting} className="space-y-5">
          <div>
            <Label>
              Country <span className="text-error-500">*</span>
            </Label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Input
                  type="text"
                  name={field.name}
                  placeholder="e.g. United Kingdom"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  maxLength={COUNTRY_MAX_LENGTH}
                  autoFocus
                  required
                  error={!!errors.country}
                  aria-invalid={!!errors.country}
                />
              )}
            />
            {errors.country && (
              <p className="mt-1 text-xs text-error-500">
                {errors.country.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>
                Code <span className="text-error-500">*</span>
              </Label>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    name={field.name}
                    placeholder="e.g. GB"
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                    onBlur={field.onBlur}
                    maxLength={3}
                    className="uppercase"
                    required
                    error={!!errors.code}
                    aria-invalid={!!errors.code}
                  />
                )}
              />
              {errors.code && (
                <p className="mt-1 text-xs text-error-500">
                  {errors.code.message}
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
                    placeholder="e.g. GBP"
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                    onBlur={field.onBlur}
                    maxLength={3}
                    className="uppercase"
                    required
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
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Inactive regions stay configured but are hidden from new rides.
            </p>
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
