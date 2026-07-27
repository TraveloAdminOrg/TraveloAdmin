import type { PricingRegion } from "./pricing";

// Fixed vocabulary shared with the backend (src/constants/EXTRA_CHARGE.ts).
// pet_charge is configured here but applied automatically at ride completion
// — drivers never see it on the finish screen.
export type ExtraChargeCode =
  | "parking_fee"
  | "congestion_charge"
  | "airport_fee"
  | "toll_charge"
  | "cleaning_fee"
  | "pet_charge";

export interface ExtraChargeEntry {
  code: ExtraChargeCode;
  amount: number;
  isActive: boolean;
}

export interface ExtraChargeConfig {
  _id: string;
  // Populated on GET responses, bare _id on POST/PATCH responses.
  region: PricingRegion | string;
  currency: string;
  charges: ExtraChargeEntry[];
  createdAt?: string;
  updatedAt?: string;
}

// Write payloads — currency is server-derived from the region.
export type ExtraChargeCreateInput = {
  region: string;
  charges: ExtraChargeEntry[];
};

export type ExtraChargeUpdateInput = Partial<ExtraChargeCreateInput>;
