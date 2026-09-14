import { api } from "./api";

export type ReturnStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "PICKUP_SCHEDULED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "RECEIVED"
  | "COMPLETED"
  | "CANCELLED";

export type ReturnReason =
  | "WRONG_PRODUCT"
  | "DAMAGED_PRODUCT"
  | "DEFECTIVE_PRODUCT"
  | "WRONG_SIZE"
  | "NOT_AS_EXPECTED"
  | "OTHER";

export interface ReturnItem {
  id: string;
  orderItemId: string;
  quantity: number;
  reason?: string | null;

  orderItem?: {
    id: string;
    productName: string;
    variantName: string;
    productSku: string;
    productPrice: number;
    quantity: number;
    totalAmount: number;
  };
}

export interface ReturnRequest {
  id: string;

  orderId: string;
  userId: string;

  reason: ReturnReason;

  description?: string | null;

  status: ReturnStatus;

  shiprocketReturnOrderId?: string | null;
  shiprocketReturnShipmentId?: string | null;
  returnAwbCode?: string | null;

  requestedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  completedAt?: string | null;

  createdAt: string;
  updatedAt: string;

  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };

  order?: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  };

  items: ReturnItem[];
}

export interface ReturnListResponse {
  data: ReturnRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReturnListParams {
  page?: number;
  limit?: number;
  status?: ReturnStatus;
}

export interface UpdateReturnStatusPayload {
  status: ReturnStatus;
  shiprocketReturnOrderId?: string;
  shiprocketReturnShipmentId?: string;
  returnAwbCode?: string;
}

export const returnService = {
  getReturns: async (
    params?: ReturnListParams,
  ): Promise<ReturnListResponse> => {
    const response = await api.get<ReturnListResponse>("/returns", {
      params,
    });

    return response.data;
  },

  getReturnById: async (id: string): Promise<ReturnRequest> => {
    const response = await api.get<ReturnRequest>(`/returns/${id}`);

    return response.data;
  },

  approveReturn: async (id: string) => {
    const response = await api.patch(`/returns/${id}/approve`);

    return response.data;
  },

  rejectReturn: async (id: string, description?: string) => {
    const response = await api.patch(`/returns/${id}/reject`, {
      description,
    });

    return response.data;
  },

  updateReturn: async (id: string, payload: UpdateReturnStatusPayload) => {
    const response = await api.patch(`/returns/${id}`, payload);

    return response.data;
  },
};
