import { api } from "@/services/api";

import type {
  CategoryListResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  Category,
} from "@/types/category";

export interface CategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "name";
  sortOrder?: "asc" | "desc";
}

export const categoryService = {
  async getCategories(params?: CategoryListParams) {
    const response = await api.get<CategoryListResponse>("/categories", {
      params,
    });

    return response.data;
  },

  async getCategory(id: string) {
    const response = await api.get<Category>(`/categories/${id}`);

    return response.data;
  },

  async createCategory(payload: CreateCategoryPayload) {
    const response = await api.post<Category>("/categories", payload);

    return response.data;
  },

  async updateCategory(id: string, payload: UpdateCategoryPayload) {
    const response = await api.patch<Category>(`/categories/${id}`, payload);

    return response.data;
  },

  async toggleCategoryStatus(id: string) {
    const response = await api.patch<Category>(
      `/categories/${id}/toggle-status`,
    );

    return response.data;
  },

  async deleteCategory(id: string) {
    const response = await api.delete(`/categories/${id}`);

    return response.data;
  },
};
