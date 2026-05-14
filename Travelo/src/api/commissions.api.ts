import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  ApiResponse,
  PaginationMeta,
  PaginationParams,
} from "../types/api";
import type {
  Commission,
  CommissionCreateInput,
  CommissionUpdateInput,
} from "../types/commission";

// Backend wraps every response as `{ success, message, data: { ... } }`.
interface ListEnvelope {
  commissions: Commission[];
  meta: PaginationMeta;
}

interface SingleEnvelope {
  commission: Commission;
}

export interface CommissionsListResult {
  commissions: Commission[];
  meta: PaginationMeta;
}

export const commissionsApi = {
  list: ({ page = 1, limit = 10 }: PaginationParams = {}) =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.commissions.base, {
        params: { page, limit },
      })
      .then((r) => ({
        commissions: r.data.data.commissions ?? [],
        meta: r.data.data.meta,
      })),

  create: (data: CommissionCreateInput) =>
    apiClient
      .post<ApiResponse<SingleEnvelope>>(ENDPOINTS.commissions.base, data)
      .then((r) => r.data.data.commission),

  update: (id: string, data: CommissionUpdateInput) =>
    apiClient
      .patch<ApiResponse<SingleEnvelope>>(ENDPOINTS.commissions.byId(id), data)
      .then((r) => r.data.data.commission),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<{ id: string }>>(ENDPOINTS.commissions.byId(id))
      .then((r) => r.data.data.id),
};
