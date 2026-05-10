import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { ApiResponse } from "../types/api";
import type {
  DashboardKpis,
  DriverStatus,
  LatestRidesResponse,
  PendingApprovalsResponse,
  RegionsOverview,
  ReviewsNeedingAttentionResponse,
  RevenueTrend,
  RidesTrend,
  TopDriversResponse,
} from "../types/dashboard";

export const dashboardApi = {
  kpis: () =>
    apiClient
      .get<ApiResponse<DashboardKpis>>(ENDPOINTS.dashboard.kpis)
      .then((r) => r.data.data),

  revenueTrend: () =>
    apiClient
      .get<ApiResponse<RevenueTrend>>(ENDPOINTS.dashboard.revenueTrend)
      .then((r) => r.data.data),

  regionsOverview: () =>
    apiClient
      .get<ApiResponse<RegionsOverview>>(ENDPOINTS.dashboard.regionsOverview)
      .then((r) => r.data.data.regions ?? []),

  ridesTrend: () =>
    apiClient
      .get<ApiResponse<RidesTrend>>(ENDPOINTS.dashboard.ridesTrend)
      .then((r) => r.data.data),

  // `region` is the lowercased country code (e.g. "pk"). Pass undefined to
  // omit the param and get the global aggregate.
  driverStatus: (region?: string) =>
    apiClient
      .get<ApiResponse<DriverStatus>>(ENDPOINTS.dashboard.driverStatus, {
        params: region ? { region } : undefined,
      })
      .then((r) => r.data.data),

  pendingApprovals: () =>
    apiClient
      .get<ApiResponse<PendingApprovalsResponse>>(
        ENDPOINTS.dashboard.pendingApprovals,
      )
      .then((r) => r.data.data),

  reviewsNeedingAttention: () =>
    apiClient
      .get<ApiResponse<ReviewsNeedingAttentionResponse>>(
        ENDPOINTS.dashboard.reviewsNeedingAttention,
      )
      .then((r) => r.data.data.reviews ?? []),

  topDrivers: () =>
    apiClient
      .get<ApiResponse<TopDriversResponse>>(ENDPOINTS.dashboard.topDrivers)
      .then((r) => r.data.data),

  latestRides: () =>
    apiClient
      .get<ApiResponse<LatestRidesResponse>>(ENDPOINTS.dashboard.latestRides)
      .then((r) => r.data.data.rides ?? []),
};
