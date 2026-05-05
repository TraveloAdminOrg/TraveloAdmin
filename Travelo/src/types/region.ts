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
