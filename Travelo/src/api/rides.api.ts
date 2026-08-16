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

// `byUser` / `byDriver` add a `userType` discriminator on the meta so the UI
// can tell whether the subject is a customer or a driver without a second call.
interface ByPersonListEnvelope {
  rides: Ride[];
  meta: PaginationMeta & { userType?: "customer" | "driver" | string };
}

interface SingleEnvelope {
  ride: Ride;
}

export interface RidesListParams extends PaginationParams {
  status?: string;
  // Region code (e.g. "PK", "MT") — the backend stores the code on each ride.
  region?: string;
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

  byUser: (
    userId: string,
    { page = 1, limit = 10 }: PaginationParams = {},
  ) =>
    apiClient
      .get<ApiResponse<ByPersonListEnvelope>>(ENDPOINTS.rides.byUser(userId), {
        params: { page, limit },
      })
      .then((r) => ({
        rides: r.data.data.rides ?? [],
        meta: r.data.data.meta,
      })),

  byDriver: (
    driverId: string,
    { page = 1, limit = 10 }: PaginationParams = {},
  ) =>
    apiClient
      .get<ApiResponse<ByPersonListEnvelope>>(
        ENDPOINTS.rides.byDriver(driverId),
        { params: { page, limit } },
      )
      .then((r) => ({
        rides: r.data.data.rides ?? [],
        meta: r.data.data.meta,
      })),

  // Force-cancels a ride regardless of status (started/waiting/etc) — the
  // recovery path for rides abandoned mid-flow that the normal rider/driver
  // cancel endpoint can no longer touch.
  cancel: (id: string, cancellationReason?: string) =>
    apiClient
      .post<ApiResponse<{ id: string }>>(ENDPOINTS.rides.cancel(id), {
        cancellationReason,
      })
      .then((r) => r.data.data.id),
};
