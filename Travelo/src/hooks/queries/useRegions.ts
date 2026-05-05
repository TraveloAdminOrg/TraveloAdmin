import { useQuery } from "@tanstack/react-query";
import { regionsApi } from "../../api/regions.api";

export const regionKeys = {
  all: ["regions"] as const,
  list: () => [...regionKeys.all, "list"] as const,
};

export const useRegionsQuery = () =>
  useQuery({
    queryKey: regionKeys.list(),
    queryFn: () => regionsApi.list(),
    // Regions change rarely — keep them around long enough that the form
    // doesn't refetch on every open.
    staleTime: 5 * 60 * 1000,
  });
