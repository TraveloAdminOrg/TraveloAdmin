import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  ApiResponse,
  PaginationMeta,
  PaginationParams,
} from "../types/api";
import type {
  Pricing,
  PricingCreateInput,
  PricingUpdateInput,
} from "../types/pricing";

// Backend wraps every response as `{ success, message, data: { ... } }`.
// GET /fare/?page=&limit= → `{ fares: Pricing[], meta }`.
interface ListEnvelope {
  fares: Pricing[];
  meta: PaginationMeta;
}

interface SingleEnvelope {
  fare: Pricing;
}

export interface PricingsListResult {
  pricings: Pricing[];
  meta: PaginationMeta;
}

export const pricingsApi = {
  list: ({ page = 1, limit = 10 }: PaginationParams = {}) =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.pricings.list, {
        params: { page, limit },
      })
      .then((r) => ({
        pricings: r.data.data.fares ?? [],
        meta: r.data.data.meta,
      })),

  create: (data: PricingCreateInput) =>
    apiClient
      .post<ApiResponse<SingleEnvelope>>(ENDPOINTS.pricings.base, data)
      .then((r) => r.data.data.fare),

  update: (id: string, data: PricingUpdateInput) =>
    apiClient
      .patch<ApiResponse<SingleEnvelope>>(ENDPOINTS.pricings.byId(id), data)
      .then((r) => r.data.data.fare),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<null>>(ENDPOINTS.pricings.byId(id))
      .then((r) => r.data),
};
