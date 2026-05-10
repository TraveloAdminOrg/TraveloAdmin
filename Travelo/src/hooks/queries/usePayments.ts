import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { paymentsApi, type PaymentsListParams } from "../../api/payments.api";

export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  list: (params: PaymentsListParams) =>
    [...paymentKeys.lists(), params] as const,
  detail: (id: string) => [...paymentKeys.all, "detail", id] as const,
};

export const usePaymentsQuery = (params: PaymentsListParams = {}) =>
  useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => paymentsApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useTransactionQuery = (id: string) =>
  useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => paymentsApi.getById(id),
    enabled: !!id,
  });

export const useDeletePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: paymentKeys.lists() }),
  });
};

export const useRefundPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount?: number }) =>
      paymentsApi.refund(id, amount),
    onSuccess: () => qc.invalidateQueries({ queryKey: paymentKeys.lists() }),
  });
};
