import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { ApiResponse } from "../types/api";
import type { Driver } from "../types/driver";
import type { Ride } from "../types/ride";

export interface ActiveDriver extends Driver {
  currentLat?: number;
  currentLng?: number;
  currentRideId?: string | null;
}

export const dispatchApi = {
  activeDrivers: () =>
    apiClient
      .get<ApiResponse<{ drivers: ActiveDriver[] }>>(
        ENDPOINTS.dispatch.activeDrivers,
      )
      .then((r) => r.data.data.drivers ?? []),

  activeRides: () =>
    apiClient
      .get<ApiResponse<{ rides: Ride[] }>>(ENDPOINTS.dispatch.activeRides)
      .then((r) => r.data.data.rides ?? []),
};
