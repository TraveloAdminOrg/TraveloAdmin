import { AlertTriangle } from "lucide-react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

interface Props {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Delete",
  isLoading = false,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md p-6 sm:p-8"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-error-50 text-error-500 dark:bg-error-500/10">
          <AlertTriangle className="size-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onConfirm}
          disabled={isLoading}
          className="!bg-error-500 hover:!bg-error-600"
        >
          {isLoading ? "Deleting…" : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
