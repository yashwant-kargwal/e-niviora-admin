import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  refundService,
  type RefundListParams,
} from "@/services/refund.service";

export const refundKeys = {
  all: ["refunds"] as const,

  list: (params?: RefundListParams) =>
    [...refundKeys.all, "list", params ?? {}] as const,
};

export const useRefunds = (params?: RefundListParams) => {
  return useQuery({
    queryKey: refundKeys.list(params),

    queryFn: () => refundService.getRefunds(params),

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,
  });
};

export const useApproveRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => refundService.approveRefund(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: refundKeys.all,
      });
    },
  });
};

export const useRejectRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      refundService.rejectRefund(id, reason),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: refundKeys.all,
      });
    },
  });
};
