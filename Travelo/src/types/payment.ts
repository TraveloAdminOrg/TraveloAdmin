import type { RegionCode } from "../lib/regions";

export type TransactionStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type PaymentMethod = "card" | "wallet" | "cash" | "upi" | "bank" | "other";

export type TransactionType =
  | "wallet_topup"
  | "ride_payment"
  | "refund"
  | "payout"
  | "adjustment";

export type TransactionDirection = "credit" | "debit";

export interface TransactionUser {
  _id: string;
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  image?: string;
  type?: string;
  country?: string;
  city?: string;
}

export interface TransactionWallet {
  _id: string;
  balance: number;
  currency: string;
  // Optional fields — present in some payloads (older endpoints), omitted in
  // the slimmer /admin/transactions response.
  userId?: string;
  region?: string;
  isActive?: boolean;
  lastTransactionDate?: string;
}

export interface Transaction {
  _id: string;
  user?: TransactionUser;
  wallet?: TransactionWallet;
  type: TransactionType | string;
  direction: TransactionDirection;
  amount: number;
  currency: string;
  status: TransactionStatus | string;
  stripePaymentIntentId?: string;
  rideId?: string;
  countryCode?: RegionCode;
  refundedAmount?: number;
  failureReason?: string;
  method?: PaymentMethod;
  createdAt?: string;
  updatedAt?: string;
}
