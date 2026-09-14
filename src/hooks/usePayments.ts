import { useQuery } from "@tanstack/react-query";

import {
  paymentService,
  type PaymentListParams,
} from "@/services/payment.service";

/* =========================================================
   QUERY KEYS
========================================================= */

export const paymentKeys = {
  all: ["payments"] as const,

  lists: () => [...paymentKeys.all, "list"] as const,

  list: (params?: PaymentListParams) =>
    [...paymentKeys.lists(), params ?? {}] as const,

  details: () => [...paymentKeys.all, "detail"] as const,

  detail: (id: string) => [...paymentKeys.details(), id] as const,
};

/* =========================================================
   PAYMENT LIST
========================================================= */

export const usePayments = (params?: PaymentListParams) => {
  return useQuery({
    queryKey: paymentKeys.list(params),

    queryFn: () => paymentService.getPayments(params),

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,

    placeholderData: (previousData) => previousData,
  });
};

/* =========================================================
   PAYMENT DETAIL
========================================================= */

export const usePayment = (id: string) => {
  return useQuery({
    queryKey: paymentKeys.detail(id),

    queryFn: () => paymentService.getPaymentById(id),

    enabled: Boolean(id),

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,
  });
};
