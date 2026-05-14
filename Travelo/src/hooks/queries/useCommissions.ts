import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { commissionsApi } from "../../api/commissions.api";
import type { PaginationParams } from "../../types/api";
import type {
  CommissionCreateInput,
  CommissionUpdateInput,
} from "../../types/commission";

export const commissionKeys = {
  all: ["commissions"] as const,
  lists: () => [...commissionKeys.all, "list"] as const,
  list: (params: PaginationParams) =>
    [...commissionKeys.lists(), params] as const,
  detail: (id: string) => [...commissionKeys.all, "detail", id] as const,
};

export const useCommissionsQuery = (params: PaginationParams = {}) =>
  useQuery({
    queryKey: commissionKeys.list(params),
    queryFn: () => commissionsApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useCreateCommission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CommissionCreateInput) => commissionsApi.create(data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: commissionKeys.lists() }),
  });
};

export const useUpdateCommission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CommissionUpdateInput }) =>
      commissionsApi.update(id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: commissionKeys.lists() });
      qc.invalidateQueries({ queryKey: commissionKeys.detail(vars.id) });
    },
  });
};

export const useDeleteCommission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commissionsApi.remove(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: commissionKeys.lists() }),
  });
};
