import type { RegionCode } from "../lib/regions";

export interface PricingRideType {
  rideType: string; // RideType _id reference
  baseFare: number;
  pricePerKm: number;
  pricePerMinute: number;
  minimumFare: number;
  cancellationFee: number;
}

export interface Pricing {
  _id: string;
  countryCode: RegionCode;
  currency: string;
  rideTypes: PricingRideType[];
  createdAt?: string;
  updatedAt?: string;
}

export type PricingCreateInput = {
  countryCode: RegionCode;
  currency: string;
  rideTypes: PricingRideType[];
};

export type PricingUpdateInput = Partial<PricingCreateInput>;
