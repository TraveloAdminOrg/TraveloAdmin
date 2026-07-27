import { Modal } from "../ui/modal";
import LoadingSpinner from "../common/LoadingSpinner";
import RideStatusBadge from "./RideStatusBadge";
import { useRideQuery } from "../../hooks/queries/useRides";
import { formatCurrency, formatDateTime } from "../../lib/format";
import { getErrorMessage } from "../../lib/error";
import type { RidePerson, RideRideTypeRef } from "../../types/ride";

interface Props {
  rideId: string | null;
  onClose: () => void;
}

const personName = (p: RidePerson | string | null | undefined): string => {
  if (!p) return "—";
  if (typeof p === "string") return p.slice(0, 8) + "…";
  return p.fullName || p.username || p.email || "—";
};

// The receipt is the settled record; every line renders only when it billed
// something, mirroring the rider's bill and the driver's summary exactly.
export default function RideDetailsModal({ rideId, onClose }: Props) {
  const { data: ride, isLoading, error } = useRideQuery(rideId ?? "");

  const receipt = ride?.receipt;
  const currency = receipt?.currency || ride?.currency || "USD";

  const money = (amount?: number) =>
    formatCurrency(Number(amount ?? 0), currency);

  const lines: { label: string; amount: number }[] = [];
  if (receipt) {
    if (Number(receipt.baseFare ?? 0) >= 0) {
      lines.push({ label: "Fare", amount: Number(receipt.baseFare ?? 0) });
    }
    if (Number(receipt.stopCharges ?? 0) > 0) {
      lines.push({ label: "Stops", amount: Number(receipt.stopCharges) });
    }
    if (Number(receipt.waitingCharges ?? 0) > 0) {
      lines.push({
        label: "Waiting Time",
        amount: Number(receipt.waitingCharges),
      });
    }
    if (Number(receipt.cleaningCharges ?? 0) > 0) {
      lines.push({
        label: "Cleaning Service",
        amount: Number(receipt.cleaningCharges),
      });
    }
    if (Number(receipt.tollCharges ?? 0) > 0) {
      lines.push({ label: "Tolls", amount: Number(receipt.tollCharges) });
    }
    for (const extra of receipt.extraCharges ?? []) {
      if (Number(extra?.amount ?? 0) > 0) {
        lines.push({
          label: extra.label || extra.code || "Extra Charge",
          amount: Number(extra.amount),
        });
      }
    }
    if (Number(receipt.petCharge ?? 0) > 0) {
      lines.push({ label: "Pet Charge", amount: Number(receipt.petCharge) });
    }
    if (Number(receipt.tip ?? 0) > 0) {
      lines.push({ label: "Tip", amount: Number(receipt.tip) });
    }
  }

  return (
    <Modal
      isOpen={!!rideId}
      onClose={onClose}
      className="max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        Ride Details
      </h2>

      {isLoading ? (
        <LoadingSpinner label="Loading ride…" />
      ) : error ? (
        <p className="text-sm text-error-500">{getErrorMessage(error)}</p>
      ) : !ride ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ride not found.
        </p>
      ) : (
        <div className="space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rider</p>
              <p className="font-medium text-gray-800 dark:text-white/90">
                {personName(ride.userId)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Driver</p>
              <p className="font-medium text-gray-800 dark:text-white/90">
                {personName(ride.driverId)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ride type
              </p>
              <p className="font-medium capitalize text-gray-800 dark:text-white/90">
                {typeof ride.rideType === "object" && ride.rideType
                  ? (ride.rideType as RideRideTypeRef).title
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
              <RideStatusBadge status={ride.status} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Payment
              </p>
              <p className="font-medium capitalize text-gray-800 dark:text-white/90">
                {ride.paymentMethod} · {ride.paymentStatus}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Completed
              </p>
              <p className="font-medium text-gray-800 dark:text-white/90">
                {ride.completedAt ? formatDateTime(ride.completedAt) : "—"}
              </p>
            </div>
          </div>

          {/* Charge breakdown */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="border-b border-gray-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
              Charge Breakdown
            </p>
            {receipt ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {lines.map((line) => (
                  <div
                    key={line.label}
                    className="flex items-center justify-between px-4 py-2 text-sm"
                  >
                    <span className="text-gray-600 dark:text-gray-300">
                      {line.label}
                    </span>
                    <span className="tabular-nums text-gray-800 dark:text-white/90">
                      {money(line.amount)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold">
                  <span className="text-gray-800 dark:text-white/90">
                    Total
                  </span>
                  <span className="tabular-nums text-gray-800 dark:text-white/90">
                    {money(
                      receipt.total ??
                        (Number(receipt.subtotal ?? 0) +
                          Number(receipt.tip ?? 0)),
                    )}
                  </span>
                </div>
              </div>
            ) : (
              // Pre-completion (or pre-feature) rides have no settled receipt.
              <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  {ride.isCompleted ? "Fare" : "Estimated fare"}
                </span>
                <span className="tabular-nums text-gray-800 dark:text-white/90">
                  {money(ride.fare ?? ride.estimatedFare)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
