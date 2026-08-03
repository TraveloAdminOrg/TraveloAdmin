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

// Each (region, rideType) pair is its own independent fare record.
export interface Pricing {
  _id: string;
  // GET responses populate the region object; POST/PATCH responses return just the id.
  region: PricingRegion | string;
  // Populated on GET, a bare _id on write responses, and null once the
  // underlying ride type has been deleted.
  rideType: PricingRideTypeRef | string | null;
  currency: string;
  weeklyFare: WeeklyFareEntry[];
  createdAt?: string;
  updatedAt?: string;
}

// Write payload for create — IDs only. The backend derives `currency` from the region.
// Region and ride type are immutable once created (delete and recreate to change either).
export type PricingCreateInput = {
  region: string; // region _id
  rideType: string; // rideType _id
  weeklyFare: WeeklyFareEntry[];
};

export type PricingUpdateInput = {
  weeklyFare: WeeklyFareEntry[];
};
