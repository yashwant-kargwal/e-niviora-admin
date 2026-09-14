export interface StoreSetting {
  id: string;
  cGst: number;
  sGst: number;
  freeDeliveryUplon: number;
  minimumOrderAmount: number;
  defaultDeliveryCharge: number;
  heading?: string | null;
  description?: string | null;
  image?: string | null;
  productId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSettingPayload {
  cGst?: number;
  sGst?: number;
  freeDeliveryUplon?: number;
  minimumOrderAmount?: number;
  defaultDeliveryCharge?: number;
  heading?: string;
  description?: string;
  productId?: string;
  image?: File | string | null;
}
