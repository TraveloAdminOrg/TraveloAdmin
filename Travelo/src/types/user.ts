import type { RegionCode } from "../lib/regions";

export type UserGender = "male" | "female" | "other" | string;

/**
 * The end-user (rider/passenger) of the app — distinct from `Admin` and `Driver`.
 * Shape mirrors Driver minus driver-specific fields (rideType, idCardNumber,
 * isApproved, isDocumentUploaded). Adjust once the real payload is confirmed.
 */
export interface User {
  _id: string;
  username: string;
  email: string;
  phone: string;
  image?: string;
  gender?: UserGender;
  type: "user" | "rider" | string;
  country: RegionCode;

  // Account flags
  isBlocked: boolean;
  isActive: boolean;
  isDeleted: boolean;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isProfileCompleted: boolean;

  // Device / social
  userDeviceToken?: string | null;
  userDeviceType?: string | null;
  userSocialProvider?: string | null;
  userSocialToken?: string | null;
  userSocialId?: string | null;

  // Timestamps
  lastActive?: string;
  createdAt?: string;
  updatedAt?: string;

  // Profile fields — present once isProfileCompleted = true
  fullName?: string;
  city?: string;
  street?: string;
  dateOfBirth?: string;

  // Optional rider-specific fields the backend may add later
  totalRides?: number;
  walletBalance?: number;
  referralCode?: string;
  defaultPaymentMethod?: string;
  averageRating?: number;
}

// Mirrors the `data` payload of GET /admin/customers/region-counts.
export interface CustomerRegionCount {
  code: string;
  country: string;
  currency: string;
  count: number;
}

export interface CustomerRegionCountsResponse {
  total: number;
  regions: CustomerRegionCount[];
}
