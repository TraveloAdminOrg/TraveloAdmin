import type { SosParty, SosRide, SosSession, SosStatus } from "../types/sos";

// Populated refs come back as either an object or a bare id depending on the
// endpoint and the age of the record, so every read goes through these.
const asParty = (value: SosParty | string | null | undefined): SosParty | null =>
  value && typeof value === "object" ? value : null;

export const partyName = (
  value: SosParty | string | null | undefined,
  fallback = "Unknown",
): string => {
  const party = asParty(value);
  return party?.fullName || party?.username || fallback;
};

export const partyPhone = (
  value: SosParty | string | null | undefined,
): string | null => asParty(value)?.phone ?? null;

export const sosRide = (session: SosSession): SosRide | null =>
  session.ride && typeof session.ride === "object" ? session.ride : null;

export const sosRideId = (session: SosSession): string | null => {
  const ride = sosRide(session);
  if (ride?._id) return ride._id;
  return typeof session.ride === "string" ? session.ride : null;
};

/** Short, human-readable ride reference for the operator to read out loud. */
export const shortRideRef = (session: SosSession): string => {
  const id = sosRideId(session);
  return id ? `#${id.slice(-6).toUpperCase()}` : "—";
};

export const initiatorLabel = (session: SosSession): string =>
  session.initiatorType === "driver" ? "Driver" : "Customer";

/** The other person in the car — who the operator is not talking to. */
export const counterpartLabel = (
  session: SosSession,
): { label: string; name: string } => {
  const ride = sosRide(session);
  return session.initiatorType === "driver"
    ? { label: "Customer", name: partyName(ride?.userId) }
    : { label: "Driver", name: partyName(ride?.driverId, "Not assigned") };
};

export const rideTypeName = (session: SosSession): string | null => {
  const rideType = sosRide(session)?.rideType;
  if (rideType && typeof rideType === "object") return rideType.name ?? null;
  return null;
};

export const formatDuration = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const SOS_STATUS_LABEL: Record<SosStatus, string> = {
  ringing: "Ringing",
  accepted: "Answered",
  active: "In call",
  ended: "Ended",
  cancelled: "Cancelled",
  missed: "Missed",
  failed: "Failed",
};

// `missed` and `failed` are the ones an operator needs to notice after the fact,
// so they carry the alarming colours rather than the neutral "ended" grey.
export const SOS_STATUS_TONE: Record<SosStatus, string> = {
  ringing:
    "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400",
  accepted:
    "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400",
  active:
    "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400",
  ended: "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400",
  missed: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400",
  failed:
    "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400",
};
