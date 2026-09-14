import { api } from "./api";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED";

export type PaymentMethod = "COD" | "ONLINE";

export type OrderItemStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURN_APPROVED"
  | "RETURNED"
  | "REFUND_REQUESTED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED";

export interface OrderItem {
  id: string;

  variantId: string;

  productName: string;

  variantName?: string | null;

  productSku: string;

  productPrice: number | string;

  quantity: number;

  returnedQuantity: number;

  refundedQuantity: number;

  totalAmount: number | string;

  status: OrderItemStatus;
}

export interface OrderPayment {
  id: string;

  amount: number | string;

  method: PaymentMethod;

  status: PaymentStatus;

  gateway?: string | null;

  gatewayOrderId?: string | null;

  gatewayPaymentId?: string | null;

  paidAt?: string | null;
}

export interface OrderUser {
  id: string;

  name: string;

  email: string;

  phone?: string | null;
}

export interface Order {
  id: string;

  orderNumber: string;

  userId: string;

  subtotal: number | string;

  shippingAmount: number | string;

  discountAmount: number | string;

  taxAmount: number | string;

  totalAmount: number | string;

  status: OrderStatus;

  paymentStatus: PaymentStatus;

  paymentMethod: PaymentMethod;

  shippingName: string;

  shippingPhone: string;

  shippingAddressLine1: string;

  shippingAddressLine2?: string | null;

  shippingCity: string;

  shippingState: string;

  shippingPincode: string;

  shippingCountry: string;

  shiprocketOrderId?: string | null;

  shiprocketShipmentId?: string | null;

  awbCode?: string | null;

  courierName?: string | null;

  cancelledAt?: string | null;

  deliveredAt?: string | null;

  createdAt: string;

  updatedAt: string;

  user?: OrderUser;

  items: OrderItem[];

  payment?: OrderPayment | null;
}

export interface OrderListParams {
  page?: number;

  limit?: number;

  orderNumber?: string;

  status?: OrderStatus;

  paymentStatus?: PaymentStatus;

  paymentMethod?: PaymentMethod;

  dateFrom?: string;

  dateTo?: string;
}

export interface OrderListResponse {
  data: Order[];

  total: number;

  page: number;

  limit: number;

  totalPages: number;
}

interface OrderListApiResponse {
  data: Order[];

  meta: {
    page: number;

    limit: number;

    total: number;

    totalPages: number;
  };
}

export interface UpdateOrderPayload {
  status?: OrderStatus;

  paymentStatus?: PaymentStatus;

  shiprocketOrderId?: string;

  awbCode?: string;

  courierName?: string;

  shiprocketShipmentId?: string;

  gatewayOrderId?: string;

  gatewayPaymentId?: string;

  gatewaySignature?: string;
}

export const orderService = {
  getOrders: async (params?: OrderListParams): Promise<OrderListResponse> => {
    const response = await api.get<OrderListResponse | OrderListApiResponse>(
      "/orders",
      {
        params,
      },
    );

    const payload = response.data;

    if ("meta" in payload) {
      return {
        data: payload.data,
        ...payload.meta,
      };
    }

    return payload;
  },

  getOrderById: async (id?: string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);

    return response.data;
  },

  updateOrder: async (id: string, payload: UpdateOrderPayload) => {
    const response = await api.patch(`/orders/${id}`, payload);

    return response.data;
  },

  createShiprocketOrder: async (id: string) => {
    const response = await api.post(`/orders/${id}/shiprocket`);

    return response.data;
  },
};
