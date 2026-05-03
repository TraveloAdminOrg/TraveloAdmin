import { useMutation, useQueryClient } from "@tanstack/react-query";
import { driverApprovalsApi } from "../../api/driverApprovals.api";
import { driverKeys } from "./useDrivers";

export const useApproveDriver = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => driverApprovalsApi.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: driverKeys.all }),
  });
};

export const useRejectDriver = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      driverApprovalsApi.reject(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: driverKeys.all }),
  });
};
