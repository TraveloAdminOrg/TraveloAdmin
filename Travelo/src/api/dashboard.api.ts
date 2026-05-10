import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { ApiResponse } from "../types/api";
import type { DashboardKpis } from "../types/dashboard";

export const dashboardApi = {
  kpis: () =>
    apiClient
      .get<ApiResponse<DashboardKpis>>(ENDPOINTS.dashboard.kpis)
      .then((r) => r.data.data),
};
