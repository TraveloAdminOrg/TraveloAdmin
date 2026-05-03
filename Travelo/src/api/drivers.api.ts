import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  ApiResponse,
  PaginationMeta,
  PaginationParams,
} from "../types/api";
import type { Driver } from "../types/driver";

interface SingleEnvelope {
  driver: Driver;
}

interface ListEnvelope {
  drivers: Driver[];
  meta: PaginationMeta;
}

export interface DriversListResult {
  drivers: Driver[];
  meta: PaginationMeta;
}

export const driversApi = {
  list: ({ page = 1, limit = 10 }: PaginationParams = {}) =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.drivers.base, {
        params: { page, limit },
      })
      .then((r) => ({
        drivers: r.data.data.drivers ?? [],
        meta: r.data.data.meta,
      })),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<SingleEnvelope>>(ENDPOINTS.drivers.byId(id))
      .then((r) => r.data.data.driver),
};
