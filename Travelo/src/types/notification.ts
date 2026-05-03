import type { RegionCode } from "../lib/regions";

export type NotificationAudience =
  | "all"
  | "all_users"
  | "all_drivers"
  | "users_in_region"
  | "drivers_in_region"
  | "specific_users"
  | "specific_drivers";

export type NotificationStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed";

// TODO: Align with backend Notification entity.
export interface AppNotification {
  _id: string;
  title: string;
  body: string;
  imageUrl?: string;
  audience: NotificationAudience;
  countryCode?: RegionCode;
  recipientIds?: string[];
  scheduledAt?: string;
  sentAt?: string;
  status: NotificationStatus;
  deliveredCount?: number;
  failedCount?: number;
  openRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type NotificationCreateInput = {
  title: string;
  body: string;
  imageUrl?: string;
  audience: NotificationAudience;
  countryCode?: RegionCode;
  recipientIds?: string[];
  scheduledAt?: string;
};
