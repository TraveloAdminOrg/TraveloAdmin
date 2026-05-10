import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  ApiResponse,
  PaginationMeta,
  PaginationParams,
} from "../types/api";
import type { CustomerRegionCountsResponse, User } from "../types/user";

interface SingleEnvelope {
  customer: User;
}

interface ListEnvelope {
  customers: User[];
  meta: PaginationMeta;
}

export interface UsersListParams extends PaginationParams {
  region?: string;
  search?: string;
}

export const usersApi = {
  list: ({ page = 1, limit = 10, ...rest }: UsersListParams = {}) =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.users.base, {
        params: { page, limit, ...rest },
      })
      .then((r) => ({
        users: r.data.data.customers ?? [],
        meta: r.data.data.meta,
      })),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<SingleEnvelope>>(ENDPOINTS.users.byId(id))
      .then((r) => r.data.data.customer),

  regionCounts: () =>
    apiClient
      .get<ApiResponse<CustomerRegionCountsResponse>>(
        ENDPOINTS.users.regionCounts,
      )
      .then((r) => r.data.data),
};
