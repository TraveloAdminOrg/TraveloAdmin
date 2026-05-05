import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { ApiResponse } from "../types/api";
import type { Region } from "../types/region";

// Backend wraps every response as `{ success, message, data: { ... } }`.
// Assumed envelope: GET /region/ → `{ regions: Region[] }`.
interface ListEnvelope {
  regions: Region[];
}

export const regionsApi = {
  list: () =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.regions.list)
      .then((r) => r.data.data.regions ?? []),
};
