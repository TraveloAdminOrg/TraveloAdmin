import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pricingsApi } from "../../api/pricings.api";
import type {
  PricingCreateInput,
  PricingUpdateInput,
} from "../../types/pricing";

export const pricingKeys = {
  all: ["pricings"] as const,
  lists: () => [...pricingKeys.all, "list"] as const,
  detail: (id: string) => [...pricingKeys.all, "detail", id] as const,
};

// The full fare list — one document per region, so it's small enough to fetch
// whole. The page filters and paginates it client-side.
export const usePricingsQuery = () =>
  useQuery({
    queryKey: pricingKeys.lists(),
    queryFn: () => pricingsApi.list(),
  });

export const useCreatePricing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PricingCreateInput) => pricingsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: pricingKeys.lists() }),
  });
};

export const useUpdatePricing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PricingUpdateInput }) =>
      pricingsApi.update(id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: pricingKeys.lists() });
      qc.invalidateQueries({ queryKey: pricingKeys.detail(vars.id) });
    },
  });
};

export const useDeletePricing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pricingsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: pricingKeys.lists() }),
  });
};
