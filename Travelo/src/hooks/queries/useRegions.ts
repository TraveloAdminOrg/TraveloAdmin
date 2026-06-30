import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { regionsApi } from "../../api/regions.api";
import type { PaginationParams } from "../../types/api";
import type {
  RegionCreateInput,
  RegionUpdateInput,
} from "../../types/region";

export const regionKeys = {
  all: ["regions"] as const,
  list: () => [...regionKeys.all, "list"] as const,
  lists: () => [...regionKeys.all, "page"] as const,
  page: (params: PaginationParams) =>
    [...regionKeys.lists(), params] as const,
  detail: (id: string) => [...regionKeys.all, "detail", id] as const,
};

// Unpaginated list — used by region selectors elsewhere in the app.
export const useRegionsQuery = () =>
  useQuery({
    queryKey: regionKeys.list(),
    queryFn: () => regionsApi.list(),
    // Regions change rarely — keep them around long enough that the form
    // doesn't refetch on every open.
    staleTime: 5 * 60 * 1000,
  });

// Paginated list — used by the Region management table.
export const useRegionsPageQuery = (params: PaginationParams = {}) =>
  useQuery({
    queryKey: regionKeys.page(params),
    queryFn: () => regionsApi.listPage(params),
    placeholderData: keepPreviousData,
  });

const invalidateRegions = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: regionKeys.list() });
  qc.invalidateQueries({ queryKey: regionKeys.lists() });
};

// We invalidate on `onSettled` (not `onSuccess`) because the backend can
// persist a region and still return a 500. Refetching regardless of the
// reported outcome keeps the table in sync with what's actually stored.
export const useCreateRegion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RegionCreateInput) => regionsApi.create(data),
    onSettled: () => invalidateRegions(qc),
  });
};

export const useUpdateRegion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RegionUpdateInput }) =>
      regionsApi.update(id, data),
    onSettled: (_d, _e, vars) => {
      invalidateRegions(qc);
      qc.invalidateQueries({ queryKey: regionKeys.detail(vars.id) });
    },
  });
};

export const useDeleteRegion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => regionsApi.remove(id),
    onSettled: () => invalidateRegions(qc),
  });
};
