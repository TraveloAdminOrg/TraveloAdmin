import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  ApiResponse,
  PaginationMeta,
  PaginationParams,
} from "../types/api";
import type { Transaction } from "../types/payment";

interface ListEnvelope {
  transactions: Transaction[];
  meta: PaginationMeta;
}

interface SingleEnvelope {
  transaction: Transaction;
}

export interface PaymentsListParams extends PaginationParams {
  status?: string;
  type?: string;
  direction?: string;
  method?: string;
  // Lowercase country code (e.g. "pk") to filter by region.
  region?: string;
  countryCode?: string;
  from?: string;
  to?: string;
  search?: string;
}

export const paymentsApi = {
  list: (params: PaymentsListParams = {}) =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.payments.base, { params })
      .then((r) => ({
        transactions: r.data.data.transactions ?? [],
        meta: r.data.data.meta,
      })),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<SingleEnvelope>>(ENDPOINTS.payments.byId(id))
      .then((r) => r.data.data.transaction),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<{ id: string }>>(ENDPOINTS.payments.byId(id))
      .then((r) => r.data.data),

  refund: (id: string, amount?: number) =>
    apiClient
      .post<ApiResponse<{ transaction: Transaction }>>(
        ENDPOINTS.payments.refund(id),
        amount !== undefined ? { amount } : {},
      )
      .then((r) => r.data.data.transaction),
};
