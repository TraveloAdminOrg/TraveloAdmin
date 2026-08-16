import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import TextArea from "../form/input/TextArea";

interface Props {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

// Force-cancels a ride regardless of its current status — the recovery path
// for a ride abandoned mid-flow (app crash, driver stuck waiting forever)
// that the normal rider/driver cancel endpoint can no longer touch.
export default function CancelRideDialog({
  isOpen,
  isLoading = false,
  onConfirm,
  onClose,
}: Props) {
  const [reason, setReason] = useState("");

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-error-50 text-error-500 dark:bg-error-500/10">
          <AlertTriangle className="size-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Force-cancel this ride?
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            This ends the ride regardless of its current status and frees the
            driver immediately. Use it for rides stuck mid-flow with no other
            way to close them out.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
          Reason (shown in the ride's history)
        </label>
        <TextArea
          placeholder="e.g. Ride abandoned mid-trip, driver stuck waiting"
          rows={3}
          value={reason}
          onChange={setReason}
          disabled={isLoading}
        />
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClose}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => onConfirm(reason.trim())}
          disabled={isLoading}
          className="!bg-error-500 hover:!bg-error-600"
        >
          {isLoading ? "Cancelling…" : "Force-Cancel Ride"}
        </Button>
      </div>
    </Modal>
  );
}
