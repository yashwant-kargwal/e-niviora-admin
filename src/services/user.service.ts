import type { UserDetail, UserListResponse } from "@/types/user";
import { api } from "./api";

export interface UserListParams {
  page?: number;
  limit?: number;

  search?: string;

  role?: "ADMIN" | "CUSTOMER";

  isActive?: boolean;

  sortBy?: "name" | "createdAt" | "updatedAt";

  sortOrder?: "asc" | "desc";
}

export const userService = {
  async getUsers(params: UserListParams) {
    const response = await api.get<UserListResponse>("/users", {
      params,
    });

    return response.data;
  },

  async getUser(id: string) {
    const response = await api.get<UserDetail>(`/users/${id}`);

    return response.data;
  },

  async getMe() {
    const response = await api.get<UserDetail>("/users/me");

    return response.data;
  },

  async updateMe(data: { name?: string; phone?: string }) {
    const response = await api.patch<UserDetail>("/users/me", data);

    return response.data;
  },
};
