import type { RegionCode } from "../lib/regions";

export interface WeeklyFareEntry {
  dayOfWeek: number; // 0 = Sunday … 6 = Saturday
  baseFare: number;
  pricePerKm: number;
  pricePerMinute: number;
  minimumFare: number;
  cancellationFee: number;
  cleaningCharge: number;
  // Charges applied while the driver waits for the rider (per minute) and the
  // surge factor applied to the fare during peak demand.
  waitingCharge: number;
  surgeMultiplier: number;
}

// Populated region object as returned by GET /fare/.
export interface PricingRegion {
  _id: string;
  country: string;
  code: RegionCode;
  currency: string;
  isActive: boolean;
  cities: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Populated rideType object embedded in fare responses.
export interface PricingRideTypeRef {
  _id: string;
  icon: string;
  title: string;
  passengers: number;
  allowedRegions: string[];
  allowedCities: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PricingRideType {
  rideType: PricingRideTypeRef | string;
  weeklyFare: WeeklyFareEntry[];
}

export interface Pricing {
  _id: string;
  // GET responses populate the region object; POST/PATCH responses return just the id.
  region: PricingRegion | string;
  currency: string;
  rideTypes: PricingRideType[];
  createdAt?: string;
  updatedAt?: string;
}

// Write payloads — IDs only. The backend derives `currency` from the region.
export interface FareRideTypeInput {
  rideType: string;
  weeklyFare: WeeklyFareEntry[];
}

export type PricingCreateInput = {
  region: string; // region _id
  // Optional on create (backend derives from region) but accepted on update —
  // included here so the form can echo the resolved value back to the server.
  currency?: string;
  rideTypes: FareRideTypeInput[];
};

export type PricingUpdateInput = Partial<PricingCreateInput>;
