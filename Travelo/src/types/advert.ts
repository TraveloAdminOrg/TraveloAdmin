import type { RegionCode } from "../lib/regions";

export type AdvertPlacement =
  | "home_banner"
  | "ride_complete"
  | "splash"
  | "side_drawer"
  | "promo_card"
  | "other";

export type AdvertAudience = "all" | "users" | "drivers";

// TODO: Align with backend Advert/Banner entity.
export interface Advert {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  ctaUrl?: string;
  ctaLabel?: string;
  placement: AdvertPlacement;
  audience: AdvertAudience;
  countryCode?: RegionCode;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
  priority?: number;
  impressions?: number;
  clicks?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type AdvertCreateInput = {
  title: string;
  description?: string;
  imageUrl: string;
  ctaUrl?: string;
  ctaLabel?: string;
  placement: AdvertPlacement;
  audience: AdvertAudience;
  countryCode?: RegionCode;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
  priority?: number;
};

export type AdvertUpdateInput = Partial<AdvertCreateInput>;
