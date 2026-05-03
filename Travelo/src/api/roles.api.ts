import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  Permission,
  Role,
  RoleCreateInput,
  RoleUpdateInput,
} from "../types/role";

export const rolesApi = {
  list: () =>
    apiClient.get<Role[]>(ENDPOINTS.roles.base).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Role>(ENDPOINTS.roles.byId(id)).then((r) => r.data),

  create: (data: RoleCreateInput) =>
    apiClient.post<Role>(ENDPOINTS.roles.base, data).then((r) => r.data),

  update: (id: string, data: RoleUpdateInput) =>
    apiClient.patch<Role>(ENDPOINTS.roles.byId(id), data).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(ENDPOINTS.roles.byId(id)).then((r) => r.data),

  permissions: () =>
    apiClient
      .get<Permission[]>(ENDPOINTS.roles.permissions)
      .then((r) => r.data),
};
