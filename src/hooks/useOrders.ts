import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  orderService,
  type OrderListParams,
  type UpdateOrderPayload,
} from "@/services/order.service";

export const orderKeys = {
  all: ["orders"] as const,

  list: (params?: OrderListParams) =>
    [...orderKeys.all, "list", params ?? {}] as const,

  detail: (id?: string) => [...orderKeys.all, "detail", id] as const,
};

export const useOrders = (params?: OrderListParams) => {
  return useQuery({
    queryKey: orderKeys.list(params),

    queryFn: () => orderService.getOrders(params),

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,
  });
};

export const useOrder = (id?: string) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderService.getOrderById(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateOrderPayload;
    }) => orderService.updateOrder(id, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.id),
      });
    },
  });
};

export const useCreateShiprocketOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.createShiprocketOrder(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(id),
      });
    },
  });
};
