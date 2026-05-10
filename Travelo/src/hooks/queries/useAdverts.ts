import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { advertsApi } from "../../api/adverts.api";
import type { PaginationParams } from "../../types/api";
import type { AdvertFormInput } from "../../types/advert";

export const advertKeys = {
  all: ["adverts"] as const,
  lists: () => [...advertKeys.all, "list"] as const,
  list: (params: PaginationParams) =>
    [...advertKeys.lists(), params] as const,
};

export const useAdvertsQuery = (params: PaginationParams = {}) =>
  useQuery({
    queryKey: advertKeys.list(params),
    queryFn: () => advertsApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useCreateAdvert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AdvertFormInput) => advertsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: advertKeys.lists() }),
  });
};

export const useUpdateAdvert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdvertFormInput }) =>
      advertsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: advertKeys.lists() }),
  });
};

export const useDeleteAdvert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => advertsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: advertKeys.lists() }),
  });
};
