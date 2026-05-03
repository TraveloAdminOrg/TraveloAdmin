import type { RegionCode } from "../lib/regions";

export type DriverGender = "male" | "female" | "other" | string;

export interface Driver {
  _id: string;
  username: string;
  email: string;
  phone: string;
  image?: string;
  gender?: DriverGender;
  type: "driver";
  country: RegionCode;

  // Account flags
  isApproved: boolean;
  isBlocked: boolean;
  isActive: boolean;
  isDeleted: boolean;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isProfileCompleted: boolean;
  isDocumentUploaded: boolean;

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
  idCardNumber?: string;
  rideType?: string;
}
