import { PhoneCall, Siren, X } from "lucide-react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { useSos } from "../../context/SosContext";
import {
  counterpartLabel,
  initiatorLabel,
  partyName,
  partyPhone,
  rideTypeName,
  shortRideRef,
  sosRide,
} from "../../lib/sos";
import { regionLabel, type RegionCode } from "../../lib/regions";

/**
 * The emergency alert. Deliberately blocking and deliberately not dismissable by
 * the backdrop or Escape — an operator has to make an explicit choice.
 *
 * Only the oldest ringing SOS is shown at a time; the rest stay queued so a
 * second emergency cannot bury the first.
 */
export default function SosIncomingOverlay() {
  const { queue, activeSession, answer, dismiss, isAnswering } = useSos();

  // Never interrupt a call in progress with a new alert — the queue holds it and
  // the badge in the sidebar shows the count.
  const session = activeSession ? null : queue[queue.length - 1];
  if (!session) return null;

  const ride = sosRide(session);
  const counterpart = counterpartLabel(session);
  const initiatorPhone = partyPhone(session.initiator);

  const rows: Array<{ label: string; value: string }> = [
    { label: "Ride", value: shortRideRef(session) },
    { label: initiatorLabel(session), value: partyName(session.initiator) },
    { label: counterpart.label, value: counterpart.name },
  ];

  if (initiatorPhone) rows.push({ label: "Phone", value: initiatorPhone });
  const type = rideTypeName(session);
  if (type) rows.push({ label: "Ride type", value: type });
  if (session.region) {
    rows.push({
      label: "Region",
      value: regionLabel(session.region as RegionCode) ?? session.region,
    });
  }
  if (ride?.status) rows.push({ label: "Ride status", value: ride.status });

  return (
    <Modal
      isOpen
      onClose={() => undefined}
      showCloseButton={false}
      className="max-w-lg p-6 sm:p-8"
    >
      <div className="flex items-start gap-4">
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-error-500 text-white">
          <span className="absolute inset-0 animate-ping rounded-full bg-error-500/60" />
          <Siren className="relative size-6" />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-error-600 dark:text-error-400">
            Emergency SOS
          </p>
          <h3 className="mt-0.5 text-lg font-semibold text-gray-800 dark:text-white/90">
            {partyName(session.initiator)} needs help
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Raised by the {initiatorLabel(session).toLowerCase()} during an
            in-progress ride.
          </p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-2 dark:bg-white/[0.03]">
        {rows.map((row) => (
          <div key={row.label} className="min-w-0">
            <dt className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
              {row.label}
            </dt>
            <dd className="mt-0.5 truncate text-sm font-medium text-gray-800 dark:text-white/90">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {queue.length > 1 && (
        <p className="mt-3 text-xs font-medium text-error-600 dark:text-error-400">
          {queue.length - 1} more emergency{queue.length - 1 === 1 ? "" : " calls"} waiting.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="md"
          startIcon={<X className="size-4" />}
          onClick={() => dismiss(session._id)}
          disabled={isAnswering}
        >
          Dismiss
        </Button>
        <Button
          type="button"
          variant="danger"
          size="md"
          startIcon={<PhoneCall className="size-4" />}
          loading={isAnswering}
          onClick={() => void answer(session._id)}
        >
          Answer SOS
        </Button>
      </div>

      <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
        Dismissing only hides this alert for you — other operators can still answer.
      </p>
    </Modal>
  );
}
