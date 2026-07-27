import type { RegionCode } from "../lib/regions";

// Known terminal/intermediate statuses returned by /admin/rides/.
// Kept as a permissive union so unfamiliar values from new backend stages
// still type-check rather than blowing up the UI.
export type RideStatus =
  | "pending"
  | "accepted"
  | "arriving"
  | "arrived"
  | "in_progress"
  | "started"
  | "completed"
  | "cancelled"
  | "no_show"
  | (string & {});

export type RidePaymentStatus =
  | "pending"
  | "completed"
  | "cancelled"
  | "refunded"
  | (string & {});

export type RidePaymentMethod = "cash" | "card" | (string & {});

// "Order/booking type". Renamed from `RideType` to avoid colliding with the
// `RideType` entity (vehicle category) defined in `types/rideType.ts`.
export type RideRequestType = "auto_accept" | "scheduled_ride" | (string & {});

// GeoJSON Point as returned by the API. `coordinates` is [lng, lat].
// `stop` may come back as a Point with an empty `coordinates` array.
export interface RideGeoPoint {
  type: "Point";
  coordinates: number[];
}

// Populated user / driver references embedded in ride documents.
export interface RidePerson {
  _id: string;
  username?: string;
  email?: string;
  phone?: string;
  image?: string;
  country?: string;
  city?: string;
  fullName?: string;
}

// Populated ride-type reference (only the fields the rides endpoint returns).
export interface RideRideTypeRef {
  _id: string;
  icon?: string;
  title: string;
  passengers: number;
}

// Snapshot of the fare rule used to price the ride, for audit purposes.
export interface RideFareBreakdown {
  dayOfWeek: number;
  baseFare: number;
  pricePerKm: number;
  pricePerMinute: number;
  minimumFare: number;
  cancellationFee: number;
  cleaningCharge: number;
}

// One itemised surcharge line, snapshotted onto the ride at completion.
export interface RideExtraChargeLine {
  code?: string;
  label?: string;
  amount?: number;
}

// Persisted at completion — the settled record of what the ride cost.
export interface RideReceipt {
  baseFare?: number;
  stopCharges?: number;
  waitingCharges?: number;
  cleaningCharges?: number;
  tollCharges?: number;
  extraCharges?: RideExtraChargeLine[];
  petCharge?: number;
  tip?: number;
  subtotal?: number;
  total?: number;
  currency?: string;
  issuedAt?: string;
}

export interface Ride {
  _id: string;
  // userId/driverId may be a populated object or just an id depending on the
  // endpoint. /admin/rides/ populates them.
  userId: RidePerson | string | null;
  driverId?: RidePerson | string | null;
  rideType: RideRideTypeRef | string | null;

  origin: RideGeoPoint;
  destination: RideGeoPoint;
  stop?: RideGeoPoint;

  type: RideRequestType;
  region: RegionCode | string;
  status: RideStatus;
  passengers: number;

  estimatedFare: number;
  // Final settled fare — present once the ride completes.
  fare?: number;
  tip?: number;
  fareBreakdown?: RideFareBreakdown;
  receipt?: RideReceipt;
  extraCharges?: RideExtraChargeLine[];
  petCharge?: number;
  tollCharges?: number;
  cleaningCharges?: number;
  currency: string;
  paymentMethod: RidePaymentMethod;
  paymentStatus: RidePaymentStatus;

  distance: number; // km
  duration: number; // minutes

  // Lifecycle flags — useful when the status enum doesn't capture nuance
  // (e.g. driver has arrived but ride hasn't started).
  isDriverAccepted: boolean;
  isDriverArriving: boolean;
  isDriverArrived: boolean;
  isStarted: boolean;
  isCancelled: boolean;
  isCompleted: boolean;
  isPaid: boolean;
  isDriverRated: boolean;
  isPetEnabled: boolean;
  isScheduled: boolean;
  isCleaningChargeApplied: boolean;
  // Newer schedulable-ride flags. Optional because older ride documents
  // (created before these fields existed) won't have them.
  isWaiting?: boolean;
  isWaitingChargeApplied?: boolean;

  notifiedDrivers?: string[];

  // Optional timestamps that get filled in as the ride progresses.
  scheduledAt?: string;
  dispatchAt?: string;
  dispatchStartedAt?: string;
  dispatchEndsAt?: string;
  driverAcceptedAt?: string;
  driverArrivingAt?: string;
  driverArrivedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  paidAt?: string;

  cancellationReason?: string;
  cancelledBy?: "user" | "driver" | "admin" | "system";
  rating?: number;

  createdAt?: string;
  updatedAt?: string;
}
