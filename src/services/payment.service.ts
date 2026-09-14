/* =========================================================
   ENUMS
========================================================= */

import { api } from "./api";

export type PaymentMethod = "COD" | "ONLINE";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED";

export type PaymentGateway = "RAZORPAY";

/* =========================================================
   USER
========================================================= */

export interface PaymentUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: "ADMIN" | "CUSTOMER";
}

/* =========================================================
   ORDER
========================================================= */

export interface PaymentOrder {
  id: string;
  orderNumber: string;

  totalAmount?: number | string;

  status?: string;

  paymentStatus?: PaymentStatus;

  paymentMethod?: PaymentMethod;

  createdAt?: string;
}

/* =========================================================
   REFUND
========================================================= */

export type RefundStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "REJECTED";

export interface PaymentRefund {
  id: string;

  paymentId: string;

  amount: number | string;

  reason?: string | null;

  status: RefundStatus;

  gatewayRefundId?: string | null;

  processedAt?: string | null;

  createdAt: string;

  updatedAt?: string;
}

/* =========================================================
   PAYMENT
========================================================= */

export interface Payment {
  id: string;

  orderId: string;

  userId: string;

  amount: number | string;

  method: PaymentMethod;

  status: PaymentStatus;

  gateway?: PaymentGateway | null;

  gatewayOrderId?: string | null;

  gatewayPaymentId?: string | null;

  gatewaySignature?: string | null;

  paidAt?: string | null;

  createdAt: string;

  updatedAt: string;

  user?: PaymentUser | null;

  order?: PaymentOrder | null;

  refunds?: PaymentRefund[];
}

/* =========================================================
   LIST QUERY
========================================================= */

export interface PaymentListParams {
  page?: number;

  limit?: number;

  orderId?: string;

  status?: PaymentStatus;

  method?: PaymentMethod;

  gateway?: PaymentGateway;

  dateFrom?: string;

  dateTo?: string;
}

/* =========================================================
   PAGINATION
========================================================= */

export interface PaymentListResponse {
  data: Payment[];

  total: number;

  page: number;

  limit: number;

  totalPages: number;
}

/* =========================================================
   SERVICE
========================================================= */

export const paymentService = {
  /* -------------------------------------------------------
     ADMIN PAYMENT LIST
  ------------------------------------------------------- */

  getPayments: async (
    params?: PaymentListParams,
  ): Promise<PaymentListResponse> => {
    const response = await api.get<PaymentListResponse>("/payments", {
      params,
    });

    return response.data;
  },

  /* -------------------------------------------------------
     PAYMENT DETAIL
  ------------------------------------------------------- */

  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await api.get<Payment>(`/payments/${id}`);

    return response.data;
  },
};
