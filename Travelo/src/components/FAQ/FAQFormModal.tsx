import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";
import {
  faqFormSchema,
  QUESTION_MAX_LENGTH,
  ANSWER_MAX_LENGTH,
  type FaqFormInput,
} from "../../schemas/faq.schema";
import { getErrorMessage } from "../../lib/error";
import { useCreateFaq, useUpdateFaq } from "../../hooks/queries/useFaqs";
import type { Faq } from "../../types/faq";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  faq?: Faq | null; // edit mode if provided
  // Suggested order for new FAQs (typically max(existing.order) + 1).
  suggestedOrder?: number;
}

const emptyDefaults = (suggestedOrder = 1): FaqFormInput => ({
  question: "",
  answer: "",
  order: suggestedOrder,
});

export default function FAQFormModal({
  isOpen,
  onClose,
  faq,
  suggestedOrder,
}: Props) {
  const isEdit = Boolean(faq);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FaqFormInput>({
    resolver: zodResolver(faqFormSchema),
    mode: "onTouched",
    defaultValues: emptyDefaults(suggestedOrder),
  });

  useEffect(() => {
    if (!isOpen) return;
    if (faq) {
      reset({
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
      });
    } else {
      reset(emptyDefaults(suggestedOrder));
    }
  }, [isOpen, faq, suggestedOrder, reset]);

  const createMutation = useCreateFaq();
  const updateMutation = useUpdateFaq();

  const onSubmit = async (values: FaqFormInput) => {
    try {
      if (isEdit && faq) {
        await updateMutation.mutateAsync({ id: faq._id, data: values });
        toast.success("FAQ updated");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("FAQ created");
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
        {isEdit ? "Edit FAQ" : "Add FAQ"}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {isEdit
          ? "Update the question, answer, or display order."
          : "Write a clear question and a helpful answer that users can find in Help & Support."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={isSubmitting} className="space-y-5">
          <div>
            <Label>
              Question <span className="text-error-500">*</span>
            </Label>
            <Controller
              name="question"
              control={control}
              render={({ field }) => (
                <Input
                  type="text"
                  name={field.name}
                  placeholder="e.g. How do I reset my password?"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  maxLength={QUESTION_MAX_LENGTH}
                  autoFocus
                  required
                  error={!!errors.question}
                  aria-invalid={!!errors.question}
                />
              )}
            />
            {errors.question && (
              <p className="mt-1 text-xs text-error-500">
                {errors.question.message}
              </p>
            )}
          </div>

          <div>
            <Label>
              Answer <span className="text-error-500">*</span>
            </Label>
            <Controller
              name="answer"
              control={control}
              render={({ field }) => (
                <TextArea
                  placeholder="Step-by-step answer that resolves the question…"
                  value={field.value}
                  onChange={field.onChange}
                  rows={5}
                  error={!!errors.answer}
                />
              )}
            />
            {errors.answer && (
              <p className="mt-1 text-xs text-error-500">
                {errors.answer.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Max {ANSWER_MAX_LENGTH} characters.
            </p>
          </div>

          <div>
            <Label>
              Display order <span className="text-error-500">*</span>
            </Label>
            <Controller
              name="order"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  name={field.name}
                  placeholder="1"
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
                  error={!!errors.order}
                  aria-invalid={!!errors.order}
                />
              )}
            />
            {errors.order && (
              <p className="mt-1 text-xs text-error-500">
                {errors.order.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Lower numbers appear first in the list.
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
