export interface ProductImage {
  id: string;
  mediaUrl: string;
  sort: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface ProductVariant {
  id: string;
  productId?: string;

  sku: string;
  name: string;

  price: number | string;
  discount: number | string;
  stock: number;

  image?: string | null;

  weight: number;
  length: number;
  width: number;
  height: number;

  note?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  variantCount: number;
  firstImage?: ProductImage | null;
}

export type ProductListItem = Product;

export interface ProductDetail extends Product {
  categories: ProductCategory[];
  media: ProductImage[];
  variant: ProductVariant[];
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  categoryId?: string;
  sortBy?: "createdAt" | "updatedAt" | "name";
  sortOrder?: "asc" | "desc";
}

export interface ProductListResponse {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProductVariantPayload {
  sku: string;
  name: string;
  price: number;
  discount?: number;
  stock?: number;

  weight: number;
  length: number;
  width: number;
  height: number;

  note?: string;
}

export type UpdateProductVariantPayload = Partial<CreateProductVariantPayload>;

export interface CreateProductPayload {
  name: string;
  description?: string;
  isActive?: boolean;
  categoryIds?: string[];

  variants?: CreateProductVariantPayload[];
}

export type UpdateProductPayload = Partial<
  Pick<
    CreateProductPayload,
    "name" | "description" | "isActive" | "categoryIds" | "variants"
  >
>;
