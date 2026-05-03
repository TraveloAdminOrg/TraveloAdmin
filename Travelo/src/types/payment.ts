import type { RegionCode } from "../lib/regions";

export type TransactionStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type PaymentMethod = "card" | "wallet" | "cash" | "upi" | "bank" | "other";

// TODO: Align with real backend Transaction shape once payload is shared.
export interface Transaction {
  _id: string;
  rideId?: string;
  userId?: string;
  userName?: string;
  driverId?: string;
  driverName?: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: TransactionStatus;
  countryCode?: RegionCode;
  refundedAmount?: number;
  failureReason?: string;
  gatewayReference?: string;
  createdAt?: string;
  updatedAt?: string;
}
