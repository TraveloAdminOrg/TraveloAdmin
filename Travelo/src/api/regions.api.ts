import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  ApiResponse,
  PaginationMeta,
  PaginationParams,
} from "../types/api";
import type {
  Region,
  RegionCreateInput,
  RegionUpdateInput,
} from "../types/region";

// Backend wraps every response as `{ success, message, data: { ... } }`.
// `/region/all` → `{ regions: Region[] }` (no pagination).
interface AllEnvelope {
  regions: Region[];
}

// `/region/?page=&limit=` → `{ regions: Region[], meta: PaginationMeta }`.
interface ListEnvelope {
  regions: Region[];
  meta: PaginationMeta;
}

interface SingleEnvelope {
  region: Region;
}

export interface RegionsListResult {
  regions: Region[];
  meta: PaginationMeta;
}

export const regionsApi = {
  // Unpaginated — used by dropdowns/selectors across the app.
  list: () =>
    apiClient
      .get<ApiResponse<AllEnvelope>>(ENDPOINTS.regions.all)
      .then((r) => r.data.data.regions ?? []),

  // Paginated — used by the Region management table.
  listPage: ({ page = 1, limit = 10 }: PaginationParams = {}) =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.regions.list, {
        params: { page, limit },
      })
      .then((r) => ({
        regions: r.data.data.regions ?? [],
        meta: r.data.data.meta,
      })),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<SingleEnvelope>>(ENDPOINTS.regions.byId(id))
      .then((r) => r.data.data.region),

  create: (data: RegionCreateInput) =>
    apiClient
      .post<ApiResponse<SingleEnvelope>>(ENDPOINTS.regions.base, data)
      .then((r) => r.data.data.region),

  update: (id: string, data: RegionUpdateInput) =>
    apiClient
      .patch<ApiResponse<SingleEnvelope>>(ENDPOINTS.regions.byId(id), data)
      .then((r) => r.data.data.region),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<{ id: string }>>(ENDPOINTS.regions.byId(id))
      .then((r) => r.data.data.id),
};
