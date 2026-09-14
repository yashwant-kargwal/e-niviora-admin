import { api } from "@/services/api";

import type {
  ProductDetail,
  ProductListParams,
  ProductListResponse,
  CreateProductPayload,
  UpdateProductPayload,
  CreateProductVariantPayload,
  UpdateProductVariantPayload,
} from "@/types/product";

const appendValue = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null) {
    return;
  }

  if (typeof value === "boolean") {
    formData.append(key, String(value));
    return;
  }

  if (typeof value === "number") {
    formData.append(key, String(value));
    return;
  }

  formData.append(key, String(value));
};

const createProductFormData = (
  payload: CreateProductPayload | UpdateProductPayload,
  images: File[] = [],
  variantImages: File[] = [],
) => {
  const formData = new FormData();

  appendValue(formData, "name", payload.name);
  appendValue(formData, "description", payload.description);
  appendValue(formData, "isActive", payload.isActive);

  if (payload.categoryIds) {
    formData.append("categoryIds", JSON.stringify(payload.categoryIds));
  }

  images.forEach((file) => {
    formData.append("images", file);
  });

  if (payload.variants?.length) {
    formData.append("variants", JSON.stringify(payload.variants));
  }

  variantImages.forEach((file) => {
    formData.append("variantImage", file);
  });

  return formData;
};

const createVariantFormData = (
  payload: CreateProductVariantPayload | UpdateProductVariantPayload,
  image?: File,
) => {
  const formData = new FormData();

  appendValue(formData, "sku", payload.sku);
  appendValue(formData, "name", payload.name);
  appendValue(formData, "price", payload.price);
  appendValue(formData, "discount", payload.discount);
  appendValue(formData, "stock", payload.stock);

  appendValue(formData, "weight", payload.weight);
  appendValue(formData, "length", payload.length);
  appendValue(formData, "width", payload.width);
  appendValue(formData, "height", payload.height);

  appendValue(formData, "note", payload.note);

  if (image) {
    formData.append("image", image);
  }

  return formData;
};

export const productService = {
  // ==================================================
  // LIST
  // ==================================================

  async getProducts(params?: ProductListParams) {
    const response = await api.get<ProductListResponse>("/products", {
      params,
    });

    return response.data;
  },

  // ==================================================
  // DETAIL
  // ==================================================

  async getProduct(id: string) {
    const response = await api.get<ProductDetail>(`/products/${id}`);

    return response.data;
  },

  // ==================================================
  // CREATE PRODUCT
  // ==================================================

  async createProduct(
    payload: CreateProductPayload,
    images: File[] = [],
    variantImages: File[] = [],
  ) {
    const formData = createProductFormData(payload, images, variantImages);

    const response = await api.post<ProductDetail>("/products", formData);

    return response.data;
  },

  // ==================================================
  // UPDATE PRODUCT
  // ==================================================

  async updateProduct(
    id: string,
    payload: UpdateProductPayload,
    images: File[] = [],
  ) {
    const formData = createProductFormData(payload, images);

    const response = await api.patch<ProductDetail>(
      `/products/${id}`,
      formData,
    );

    return response.data;
  },

  // ==================================================
  // DELETE PRODUCT
  // ==================================================

  async deleteProduct(id: string) {
    const response = await api.delete(`/products/${id}`);

    return response.data;
  },

  // ==================================================
  // ADD IMAGES
  // ==================================================

  async addImages(productId: string, images: File[]) {
    const formData = new FormData();

    images.forEach((file) => {
      formData.append("images", file);
    });

    const response = await api.post<ProductDetail>(
      `/products/${productId}/images`,
      formData,
    );

    return response.data;
  },

  // ==================================================
  // DELETE IMAGE
  // ==================================================

  async deleteImage(productId: string, imageId: string) {
    const response = await api.delete(
      `/products/${productId}/images/${imageId}`,
    );

    return response.data;
  },

  // ==================================================
  // ADD VARIANT
  // ==================================================

  async addVariant(
    productId: string,
    payload: CreateProductVariantPayload,
    image?: File,
  ) {
    const formData = createVariantFormData(payload, image);

    const response = await api.post<ProductDetail>(
      `/products/${productId}/variants`,
      formData,
    );

    return response.data;
  },

  // ==================================================
  // UPDATE VARIANT
  // ==================================================

  async updateVariant(
    productId: string,
    variantId: string,
    payload: UpdateProductVariantPayload,
    image?: File,
  ) {
    const formData = createVariantFormData(payload, image);

    const response = await api.patch<ProductDetail>(
      `/products/${productId}/variants/${variantId}`,
      formData,
    );

    return response.data;
  },

  // ==================================================
  // DELETE VARIANT
  // ==================================================

  async deleteVariant(productId: string, variantId: string) {
    const response = await api.delete(
      `/products/${productId}/variants/${variantId}`,
    );

    return response.data;
  },
};
