import type { RegionCode } from "../lib/regions";

export type DriverGender = "male" | "female" | "other" | string;

// A single uploaded file inside a document category.
export interface DriverDocumentFile {
  url: string;
  status?: "pending" | "approved" | "rejected" | string;
  expiryDate?: string | null;
}

// Backend has shipped three different shapes for `documents[<category>]` over
// time — the parser in `DriverDocumentsSection` normalises them to this one.
//   1) { expiryDate, files: DocFile[] }              (latest)
//   2) DocFile[]                                     (array of files directly)
//   3) { type, url, status, expiryDate? }            (single-file object)
export type DriverDocumentCategoryRaw =
  | { expiryDate?: string | null; files: DriverDocumentFile[] }
  | DriverDocumentFile[]
  | (DriverDocumentFile & { type?: string });

export interface DriverDocuments {
  _id?: string;
  userId?: string;
  documents?: Partial<Record<string, DriverDocumentCategoryRaw>>;
  createdAt?: string;
  updatedAt?: string;
}

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

  // Document upload bundle. Present on getById (`/admin/drivers/:id`); the list
  // endpoint returns it alongside in a wrapper object that drivers.api flattens
  // onto the driver here.
  driverDocuments?: DriverDocuments;
}
