import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { ApiResponse } from "../types/api";
import type { Driver } from "../types/driver";

export const driverApprovalsApi = {
  approve: (id: string) =>
    apiClient
      .post<ApiResponse<{ driver: Driver }>>(ENDPOINTS.drivers.approve(id))
      .then((r) => r.data.data.driver),

  reject: (id: string, reason?: string) =>
    apiClient
      .post<ApiResponse<{ driver: Driver }>>(
        ENDPOINTS.drivers.reject(id),
        reason ? { reason } : {},
      )
      .then((r) => r.data.data.driver),
};
