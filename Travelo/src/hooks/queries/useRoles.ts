import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rolesApi } from "../../api/roles.api";
import type { RoleCreateInput, RoleUpdateInput } from "../../types/role";

export const roleKeys = {
  all: ["roles"] as const,
  list: () => [...roleKeys.all, "list"] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
  permissions: () => [...roleKeys.all, "permissions"] as const,
};

export const useRolesQuery = () =>
  useQuery({ queryKey: roleKeys.list(), queryFn: rolesApi.list });

export const useRoleQuery = (id: string) =>
  useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => rolesApi.getById(id),
    enabled: !!id,
  });

export const usePermissionsQuery = () =>
  useQuery({
    queryKey: roleKeys.permissions(),
    queryFn: rolesApi.permissions,
    staleTime: 10 * 60 * 1000, // permissions rarely change — cache 10 min
  });

export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RoleCreateInput) => rolesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.list() }),
  });
};

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoleUpdateInput }) =>
      rolesApi.update(id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: roleKeys.list() });
      qc.invalidateQueries({ queryKey: roleKeys.detail(vars.id) });
    },
  });
};

export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rolesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.list() }),
  });
};
