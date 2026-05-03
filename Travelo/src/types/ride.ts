import type { RegionCode } from "../lib/regions";

export type RideStatus =
  | "requested"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export interface RideLocation {
  address?: string;
  lat?: number;
  lng?: number;
}

// TODO: Align with real backend Ride entity once payload is shared.
export interface Ride {
  _id: string;
  userId: string;
  driverId?: string;
  userName?: string;
  driverName?: string;
  pickup?: RideLocation;
  dropoff?: RideLocation;
  distanceKm?: number;
  durationMin?: number;
  fare?: number;
  currency?: string;
  status: RideStatus;
  rideType?: string;
  countryCode?: RegionCode;
  cancellationReason?: string;
  cancelledBy?: "user" | "driver" | "admin" | "system";
  rating?: number;
  requestedAt?: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
