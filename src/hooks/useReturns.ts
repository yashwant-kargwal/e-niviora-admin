import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  returnService,
  type ReturnListParams,
  type UpdateReturnStatusPayload,
} from "@/services/return.service";

export const returnKeys = {
  all: ["returns"] as const,

  list: (params?: ReturnListParams) =>
    [...returnKeys.all, "list", params ?? {}] as const,

  detail: (id: string) => [...returnKeys.all, "detail", id] as const,
};

export const useReturns = (params?: ReturnListParams) => {
  return useQuery({
    queryKey: returnKeys.list(params),

    queryFn: () => returnService.getReturns(params),

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,
  });
};

export const useReturn = (id: string) => {
  return useQuery({
    queryKey: returnKeys.detail(id),

    queryFn: () => returnService.getReturnById(id),

    enabled: Boolean(id),

    staleTime: 30 * 1000,
  });
};

export const useApproveReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => returnService.approveReturn(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: returnKeys.all,
      });
    },
  });
};

export const useRejectReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, description }: { id: string; description?: string }) =>
      returnService.rejectReturn(id, description),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: returnKeys.all,
      });
    },
  });
};

export const useUpdateReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateReturnStatusPayload;
    }) => returnService.updateReturn(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: returnKeys.all,
      });
    },
  });
};
