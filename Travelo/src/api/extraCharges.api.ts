import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  ApiResponse,
  PaginationMeta,
  PaginationParams,
} from "../types/api";
import type {
  ExtraChargeConfig,
  ExtraChargeCreateInput,
  ExtraChargeUpdateInput,
} from "../types/extraCharge";

// Backend wraps every response as `{ success, message, data: { ... } }`.
interface ListEnvelope {
  extraCharges: ExtraChargeConfig[];
  meta: PaginationMeta;
}

interface SingleEnvelope {
  extraCharge: ExtraChargeConfig;
}

export interface ExtraChargesListResult {
  extraCharges: ExtraChargeConfig[];
  meta: PaginationMeta;
}

export const extraChargesApi = {
  list: ({ page = 1, limit = 10 }: PaginationParams = {}) =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.extraCharges.base, {
        params: { page, limit },
      })
      .then((r) => ({
        extraCharges: r.data.data.extraCharges ?? [],
        meta: r.data.data.meta,
      })),

  create: (data: ExtraChargeCreateInput) =>
    apiClient
      .post<ApiResponse<SingleEnvelope>>(ENDPOINTS.extraCharges.base, data)
      .then((r) => r.data.data.extraCharge),

  update: (id: string, data: ExtraChargeUpdateInput) =>
    apiClient
      .patch<ApiResponse<SingleEnvelope>>(ENDPOINTS.extraCharges.byId(id), data)
      .then((r) => r.data.data.extraCharge),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<{ id: string }>>(ENDPOINTS.extraCharges.byId(id))
      .then((r) => r.data.data.id),
};
