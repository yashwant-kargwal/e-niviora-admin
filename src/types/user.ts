export type UserRole = "ADMIN" | "CUSTOMER";

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddress {
  id: string;
  userId: string;

  addressLine1: string;
  addressLine2?: string | null;

  city: string;
  state: string;
  pincode: string;
  country: string;

  label?: string | null;
  isDefault: boolean;

  createdAt: string;
  updatedAt?: string;
}

export interface UserDetail extends UserListItem {
  address: UserAddress[];

  _count: {
    orders: number;
    payments: number;
    returnRequests: number;
  };
}

export interface UserListResponse {
  data: UserListItem[];

  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
