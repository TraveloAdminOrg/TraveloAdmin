import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { extraChargesApi } from "../../api/extraCharges.api";
import type { PaginationParams } from "../../types/api";
import type {
  ExtraChargeCreateInput,
  ExtraChargeUpdateInput,
} from "../../types/extraCharge";

export const extraChargeKeys = {
  all: ["extraCharges"] as const,
  lists: () => [...extraChargeKeys.all, "list"] as const,
  list: (params: PaginationParams) =>
    [...extraChargeKeys.lists(), params] as const,
  detail: (id: string) => [...extraChargeKeys.all, "detail", id] as const,
};

export const useExtraChargesQuery = (params: PaginationParams = {}) =>
  useQuery({
    queryKey: extraChargeKeys.list(params),
    queryFn: () => extraChargesApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useCreateExtraCharge = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ExtraChargeCreateInput) => extraChargesApi.create(data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: extraChargeKeys.lists() }),
  });
};

export const useUpdateExtraCharge = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExtraChargeUpdateInput }) =>
      extraChargesApi.update(id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: extraChargeKeys.lists() });
      qc.invalidateQueries({ queryKey: extraChargeKeys.detail(vars.id) });
    },
  });
};

export const useDeleteExtraCharge = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => extraChargesApi.remove(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: extraChargeKeys.lists() }),
  });
};
