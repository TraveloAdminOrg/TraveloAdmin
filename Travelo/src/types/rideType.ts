import type { RegionCode } from "../lib/regions";

export interface RideType {
  _id: string;
  icon: string;
  title: string;
  passengers: number;
  allowedRegions: RegionCode[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type RideTypeCreateInput = {
  icon?: string;
  title: string;
  passengers: number;
  allowedRegions: RegionCode[];
  isActive: boolean;
};

export type RideTypeUpdateInput = Partial<RideTypeCreateInput>;
