import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { rideTypesApi } from "../../api/rideTypes.api";
import type { PaginationParams } from "../../types/api";
import type {
  RideTypeCreateInput,
  RideTypeUpdateInput,
} from "../../types/rideType";

export const rideTypeKeys = {
  all: ["rideTypes"] as const,
  lists: () => [...rideTypeKeys.all, "list"] as const,
  list: (params: PaginationParams) =>
    [...rideTypeKeys.lists(), params] as const,
  detail: (id: string) => [...rideTypeKeys.all, "detail", id] as const,
};

export const useRideTypesQuery = (params: PaginationParams = {}) =>
  useQuery({
    queryKey: rideTypeKeys.list(params),
    queryFn: () => rideTypesApi.list(params),
    // Smooth pagination — old page stays visible while next loads.
    placeholderData: keepPreviousData,
  });

export const useRideTypeQuery = (id: string) =>
  useQuery({
    queryKey: rideTypeKeys.detail(id),
    queryFn: () => rideTypesApi.getById(id),
    enabled: !!id,
  });

export const useCreateRideType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RideTypeCreateInput) => rideTypesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: rideTypeKeys.lists() }),
  });
};

export const useUpdateRideType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RideTypeUpdateInput }) =>
      rideTypesApi.update(id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: rideTypeKeys.lists() });
      qc.invalidateQueries({ queryKey: rideTypeKeys.detail(vars.id) });
    },
  });
};

export const useDeleteRideType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rideTypesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: rideTypeKeys.lists() }),
  });
};
