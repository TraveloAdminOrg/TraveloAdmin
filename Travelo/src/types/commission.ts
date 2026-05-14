import type { PricingRegion, PricingRideTypeRef } from "./pricing";

export type CommissionType = "percentage" | "fixed";

// Booking-type discriminator on each commission row. Matches the
// `RideRequestType` union but a wider set since commissions support bid rides.
export type CommissionBookingType =
  | "auto_accept"
  | "scheduled_ride"
  | "bid_for_ride"
  | (string & {});

export interface CommissionEntry {
  // Populated on GET; bare _id on write.
  rideType: PricingRideTypeRef | string | null;
  bookingType: CommissionBookingType;
  commissionType: CommissionType;
  commission: number;
}

export interface Commission {
  _id: string;
  // Populated on GET responses, bare _id on POST/PATCH responses.
  region: PricingRegion | string;
  currency: string;
  commissions: CommissionEntry[];
  createdAt?: string;
  updatedAt?: string;
}

// Write payloads — IDs only on rideType; currency is server-derived from region.
export interface CommissionEntryInput {
  rideType: string;
  bookingType: CommissionBookingType;
  commissionType: CommissionType;
  commission: number;
}

export type CommissionCreateInput = {
  region: string;
  commissions: CommissionEntryInput[];
};

export type CommissionUpdateInput = Partial<CommissionCreateInput>;
