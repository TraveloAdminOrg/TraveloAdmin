import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { faqsApi } from "../../api/faqs.api";
import type { FaqCreateInput, FaqUpdateInput } from "../../types/faq";

export const faqKeys = {
  all: ["faqs"] as const,
  list: () => [...faqKeys.all, "list"] as const,
};

export const useFaqsQuery = () =>
  useQuery({
    queryKey: faqKeys.list(),
    queryFn: () => faqsApi.list(),
  });

export const useCreateFaq = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FaqCreateInput) => faqsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: faqKeys.list() }),
  });
};

export const useUpdateFaq = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FaqUpdateInput }) =>
      faqsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: faqKeys.list() }),
  });
};

export const useDeleteFaq = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => faqsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: faqKeys.list() }),
  });
};
