// Emergency SOS sessions raised by a rider or driver during an in-progress ride.
// Mirrors the backend `SosSession` model and `src/constants/SOS.ts`.

export type SosStatus =
  | "ringing"
  | "accepted"
  | "active"
  | "ended"
  | "cancelled"
  | "missed"
  | "failed";

export type SosInitiatorType = "customer" | "driver";

export const SOS_OPEN_STATUSES: SosStatus[] = ["ringing", "accepted", "active"];

// Populated shapes are partial — the backend selects only what the operator
// needs to answer intelligently, and any of it may be missing on older records.
export interface SosParty {
  _id?: string;
  username?: string;
  fullName?: string;
  phone?: string;
  image?: string;
}

export interface SosRide {
  _id?: string;
  status?: string;
  region?: string;
  currency?: string;
  createdAt?: string;
  userId?: SosParty | string | null;
  driverId?: SosParty | string | null;
  rideType?: { _id?: string; name?: string } | string | null;
}

export interface SosSession {
  _id: string;
  ride?: SosRide | string | null;
  initiator?: SosParty | string | null;
  initiatorType: SosInitiatorType;
  admin?: { _id?: string; email?: string; image?: string } | string | null;
  status: SosStatus;
  region?: string;
  endReason?: string | null;
  ringingAt?: string;
  acceptedAt?: string | null;
  connectedAt?: string | null;
  endedAt?: string | null;
  durationSeconds?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SosListParams {
  page?: number;
  limit?: number;
  status?: SosStatus;
  region?: string;
}

// ---- socket payloads ----------------------------------------------------

export interface SosIncomingPayload {
  sos: SosSession;
}

export interface SosClaimedPayload {
  sosId: string;
  adminId: string;
}

export interface SosCancelledPayload {
  sosId: string;
  reason?: string;
}

export interface SosEndedPayload {
  sosId: string;
  reason?: string;
}

export interface SosSignalPayload {
  sosId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}
