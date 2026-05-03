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

interface SingleEnvelope {
  pricing: Pricing;
}

interface ListEnvelope {
  pricings: Pricing[];
  meta: PaginationMeta;
}

export interface PricingsListResult {
  pricings: Pricing[];
  meta: PaginationMeta;
}

export const pricingsApi = {
  list: ({ page = 1, limit = 10 }: PaginationParams = {}) =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.pricings.base, {
        params: { page, limit },
      })
      .then((r) => ({
        pricings: r.data.data.pricings ?? [],
        meta: r.data.data.meta,
      })),

  create: (data: PricingCreateInput) =>
    apiClient
      .post<ApiResponse<SingleEnvelope>>(ENDPOINTS.pricings.base, data)
      .then((r) => r.data.data.pricing),

  update: (id: string, data: PricingUpdateInput) =>
    apiClient
      .patch<ApiResponse<SingleEnvelope>>(ENDPOINTS.pricings.byId(id), data)
      .then((r) => r.data.data.pricing),

  // TODO: confirm DELETE endpoint with backend (assumed standard REST).
  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<null>>(ENDPOINTS.pricings.byId(id))
      .then((r) => r.data),
};
