import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { ApiResponse } from "../types/api";
import type {
  DriverLeaderboardEntry,
  LeaderboardResponse,
  ReportOverview,
  RevenuePoint,
  RidesPoint,
} from "../types/report";

export interface ReportRangeParams {
  startDate?: string; // ISO date or datetime
  endDate?: string;
  // `from`/`to` accepted as legacy aliases — converted before being sent.
  from?: string;
  to?: string;
  // Lowercase country code (e.g. "pk", "mt", "gb"). Matches the convention
  // used by /adminDashboard/driver-status?region=…
  region?: string;
  countryCode?: string;
}

function normalizeRangeParams(p: ReportRangeParams) {
  const { from, to, ...rest } = p;
  return {
    ...rest,
    startDate: rest.startDate ?? from,
    endDate: rest.endDate ?? to,
  };
}

export const reportsApi = {
  overview: (params: ReportRangeParams = {}) =>
    apiClient
      .get<ApiResponse<ReportOverview>>(ENDPOINTS.reports.overview, {
        params: normalizeRangeParams(params),
      })
      .then((r) => r.data.data),

  leaderboard: (params: ReportRangeParams = {}) =>
    apiClient
      .get<ApiResponse<LeaderboardResponse>>(ENDPOINTS.reports.leaderboard, {
        params: normalizeRangeParams(params),
      })
      .then((r) => r.data.data),

  // Legacy chart endpoints — backend may not implement these. Kept so the
  // dashboard fallback queries don't error out at import time.
  revenue: (params: ReportRangeParams = {}) =>
    apiClient
      .get<ApiResponse<{ points: RevenuePoint[] }>>(ENDPOINTS.reports.revenue, {
        params: normalizeRangeParams(params),
      })
      .then((r) => r.data.data.points ?? []),

  rides: (params: ReportRangeParams = {}) =>
    apiClient
      .get<ApiResponse<{ points: RidesPoint[] }>>(ENDPOINTS.reports.rides, {
        params: normalizeRangeParams(params),
      })
      .then((r) => r.data.data.points ?? []),

  // Legacy leaderboard shape used by the dashboard's fallback path. Maps the
  // new /report/leaderboard payload into the simpler `{ driverName, rides,
  // revenue, rating }` rows the old leaderboard list expects.
  drivers: (params: ReportRangeParams = {}) =>
    apiClient
      .get<ApiResponse<LeaderboardResponse>>(ENDPOINTS.reports.drivers, {
        params: normalizeRangeParams(params),
      })
      .then(
        (r): DriverLeaderboardEntry[] =>
          (r.data.data.drivers ?? []).map((row) => ({
            driverId: row.driverId,
            driverName:
              row.driver?.fullName || row.driver?.username || "Unknown driver",
            rides: row.completedRides,
            revenue: row.totalRevenue,
            rating: row.averageRating,
          })),
      ),

  // CSV export — returns a Blob that the browser downloads.
  export: (resource: string, params: ReportRangeParams = {}) =>
    apiClient
      .get(ENDPOINTS.reports.export(resource), {
        params: normalizeRangeParams(params),
        responseType: "blob",
      })
      .then((r) => r.data as Blob),
};
