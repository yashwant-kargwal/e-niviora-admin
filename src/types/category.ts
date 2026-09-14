export interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CategoryListResponse {
  data: Category[];
  meta: CategoryListMeta;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
}
