import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  ApiResponse,
  PaginationMeta,
  PaginationParams,
} from "../types/api";
import type {
  RideType,
  RideTypeCreateInput,
  RideTypeUpdateInput,
} from "../types/rideType";

// Backend wraps every response as `{ success, message, data: { ... } }`.

interface SingleEnvelope {
  rideType: RideType;
}

interface ListEnvelope {
  rideTypes: RideType[];
  meta: PaginationMeta;
}

export interface RideTypesListResult {
  rideTypes: RideType[];
  meta: PaginationMeta;
}

export const rideTypesApi = {
  list: ({ page = 1, limit = 10 }: PaginationParams = {}) =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.rideTypes.base, {
        params: { page, limit },
      })
      .then((r) => ({
        rideTypes: r.data.data.rideTypes ?? [],
        meta: r.data.data.meta,
      })),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<SingleEnvelope>>(ENDPOINTS.rideTypes.byId(id))
      .then((r) => r.data.data.rideType),

  create: (data: RideTypeCreateInput) =>
    apiClient
      .post<ApiResponse<SingleEnvelope>>(ENDPOINTS.rideTypes.base, data)
      .then((r) => r.data.data.rideType),

  update: (id: string, data: RideTypeUpdateInput) =>
    apiClient
      .patch<ApiResponse<SingleEnvelope>>(ENDPOINTS.rideTypes.byId(id), data)
      .then((r) => r.data.data.rideType),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<null>>(ENDPOINTS.rideTypes.byId(id))
      .then((r) => r.data),
};
