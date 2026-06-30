import type { RegionCode } from "../lib/regions";

export interface Region {
  _id: string;
  country: string;
  code: RegionCode;
  currency: string;
  isActive: boolean;
  cities: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Write payloads. `code`/`currency` are free-form on write so the admin can
// register regions beyond the built-in set in `lib/regions`.
export interface RegionCreateInput {
  country: string;
  code: string;
  currency: string;
  isActive: boolean;
  cities?: string[];
}

export type RegionUpdateInput = Partial<RegionCreateInput>;
