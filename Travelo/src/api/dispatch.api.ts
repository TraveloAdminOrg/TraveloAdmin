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

export interface DispatchOverview {
  region: string;
  activeDrivers: number;
  activeRides: number;
  onRide: number;
  idleDrivers: number;
}

export interface ActiveDriversResponse {
  region: string;
  total: number;
  drivers: ActiveDriver[];
}

export interface ActiveRidesResponse {
  region: string;
  total: number;
  rides: Ride[];
}

const regionParams = (region?: string) =>
  region ? { region } : undefined;

export const dispatchApi = {
  overview: (region?: string) =>
    apiClient
      .get<ApiResponse<DispatchOverview>>(ENDPOINTS.dispatch.overview, {
        params: regionParams(region),
      })
      .then((r) => r.data.data),

  activeDrivers: (region?: string) =>
    apiClient
      .get<ApiResponse<ActiveDriversResponse>>(
        ENDPOINTS.dispatch.activeDrivers,
        { params: regionParams(region) },
      )
      .then((r) => r.data.data),

  activeRides: (region?: string) =>
    apiClient
      .get<ApiResponse<ActiveRidesResponse>>(ENDPOINTS.dispatch.activeRides, {
        params: regionParams(region),
      })
      .then((r) => r.data.data),
};
