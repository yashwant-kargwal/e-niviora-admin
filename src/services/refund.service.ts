import { api } from "./api";

export type RefundStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED";

export interface RefundItem {
  id: string;
  orderItemId: string;
  quantity: number;
  amount: number;
}

export interface Refund {
  id: string;

  paymentId: string;

  amount: number;

  reason?: string | null;

  status: RefundStatus;

  gatewayRefundId?: string | null;

  processedAt?: string | null;

  createdAt: string;

  updatedAt: string;

  payment?: {
    id: string;
    amount: number;
    status: string;

    order?: {
      id: string;
      orderNumber: string;
    };

    user?: {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
    };
  };

  items?: RefundItem[];
}

export interface RefundListResponse {
  data: Refund[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RefundListParams {
  page?: number;
  limit?: number;
  paymentId?: string;
  status?: RefundStatus;
}

export const refundService = {
  getRefunds: async (
    params?: RefundListParams,
  ): Promise<RefundListResponse> => {
    const response = await api.get<RefundListResponse>("/payments/refunds", {
      params,
    });

    return response.data;
  },

  approveRefund: async (id: string) => {
    const response = await api.patch(`/payments/refunds/${id}/approve`);

    return response.data;
  },

  rejectRefund: async (id: string, reason?: string) => {
    const response = await api.patch(`/payments/refunds/${id}/reject`, {
      reason,
    });

    return response.data;
  },
};
