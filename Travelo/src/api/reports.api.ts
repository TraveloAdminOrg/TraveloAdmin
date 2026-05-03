import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { ApiResponse } from "../types/api";
import type {
  DriverLeaderboardEntry,
  ReportOverview,
  RevenuePoint,
  RidesPoint,
} from "../types/report";

export interface ReportRangeParams {
  from?: string; // ISO date
  to?: string;
  countryCode?: string;
}

export const reportsApi = {
  overview: (params: ReportRangeParams = {}) =>
    apiClient
      .get<ApiResponse<ReportOverview>>(ENDPOINTS.reports.overview, { params })
      .then((r) => r.data.data),

  revenue: (params: ReportRangeParams = {}) =>
    apiClient
      .get<ApiResponse<{ points: RevenuePoint[] }>>(ENDPOINTS.reports.revenue, {
        params,
      })
      .then((r) => r.data.data.points ?? []),

  rides: (params: ReportRangeParams = {}) =>
    apiClient
      .get<ApiResponse<{ points: RidesPoint[] }>>(ENDPOINTS.reports.rides, {
        params,
      })
      .then((r) => r.data.data.points ?? []),

  drivers: (params: ReportRangeParams = {}) =>
    apiClient
      .get<ApiResponse<{ leaderboard: DriverLeaderboardEntry[] }>>(
        ENDPOINTS.reports.drivers,
        { params },
      )
      .then((r) => r.data.data.leaderboard ?? []),

  // Returns a Blob URL the browser will download as CSV / Excel.
  export: (resource: string, params: ReportRangeParams = {}) =>
    apiClient
      .get(ENDPOINTS.reports.export(resource), {
        params,
        responseType: "blob",
      })
      .then((r) => r.data as Blob),
};
