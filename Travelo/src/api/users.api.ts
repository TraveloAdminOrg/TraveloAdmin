import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  ApiResponse,
  PaginationMeta,
  PaginationParams,
} from "../types/api";
import type { User } from "../types/user";

interface SingleEnvelope {
  user: User;
}

interface ListEnvelope {
  users: User[];
  meta: PaginationMeta;
}

export interface UsersListResult {
  users: User[];
  meta: PaginationMeta;
}

export const usersApi = {
  list: ({ page = 1, limit = 10 }: PaginationParams = {}) =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.users.base, {
        params: { page, limit },
      })
      .then((r) => ({
        users: r.data.data.users ?? [],
        meta: r.data.data.meta,
      })),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<SingleEnvelope>>(ENDPOINTS.users.byId(id))
      .then((r) => r.data.data.user),
};
