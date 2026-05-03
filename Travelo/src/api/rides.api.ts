import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  ApiResponse,
  PaginationMeta,
  PaginationParams,
} from "../types/api";
import type { Ride } from "../types/ride";

interface ListEnvelope {
  rides: Ride[];
  meta: PaginationMeta;
}

interface SingleEnvelope {
  ride: Ride;
}

export interface RidesListParams extends PaginationParams {
  status?: string;
  countryCode?: string;
  driverId?: string;
  userId?: string;
  from?: string; // ISO date
  to?: string;
}

export const ridesApi = {
  list: (params: RidesListParams = {}) =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.rides.base, { params })
      .then((r) => ({
        rides: r.data.data.rides ?? [],
        meta: r.data.data.meta,
      })),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<SingleEnvelope>>(ENDPOINTS.rides.byId(id))
      .then((r) => r.data.data.ride),

  active: () =>
    apiClient
      .get<ApiResponse<{ rides: Ride[] }>>(ENDPOINTS.rides.active)
      .then((r) => r.data.data.rides ?? []),
};
