import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { productService } from "@/services/product.service";

import type {
  ProductListParams,
  CreateProductPayload,
  UpdateProductPayload,
  CreateProductVariantPayload,
  UpdateProductVariantPayload,
} from "@/types/product";

export const productKeys = {
  all: ["products"] as const,

  lists: () => [...productKeys.all, "list"] as const,

  list: (params: ProductListParams) =>
    [...productKeys.lists(), params] as const,

  details: () => [...productKeys.all, "detail"] as const,

  detail: (id: string) => [...productKeys.details(), id] as const,
};

// ==================================================
// LIST
// ==================================================

export const useProducts = (params: ProductListParams) => {
  return useQuery({
    queryKey: productKeys.list(params),

    queryFn: () => productService.getProducts(params),

    placeholderData: (previousData) => previousData,
  });
};

// ==================================================
// DETAIL
// ==================================================

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),

    queryFn: () => productService.getProduct(id),

    enabled: Boolean(id),
  });
};

// ==================================================
// CREATE
// ==================================================

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      images,
      variantImages,
    }: {
      payload: CreateProductPayload;
      images?: File[];
      variantImages?: File[];
    }) =>
      productService.createProduct(
        payload,
        images ?? [],
        variantImages ?? [],
      ),

    onSuccess: (product) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });

      queryClient.setQueryData(productKeys.detail(product.id), product);
    },
  });
};

// ==================================================
// UPDATE
// ==================================================

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
      images,
    }: {
      id: string;
      payload: UpdateProductPayload;
      images?: File[];
    }) => productService.updateProduct(id, payload, images ?? []),

    onSuccess: (product, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });

      queryClient.setQueryData(productKeys.detail(variables.id), product);
    },
  });
};

// ==================================================
// DELETE PRODUCT
// ==================================================

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
    },
  });
};

// ==================================================
// ADD IMAGES
// ==================================================

export const useAddProductImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      images,
    }: {
      productId: string;
      images: File[];
    }) => productService.addImages(productId, images),

    onSuccess: (product, variables) => {
      queryClient.setQueryData(
        productKeys.detail(variables.productId),
        product,
      );

      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
    },
  });
};

// ==================================================
// DELETE IMAGE
// ==================================================

export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      imageId,
    }: {
      productId: string;
      imageId: string;
    }) => productService.deleteImage(productId, imageId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });

      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
    },
  });
};

// ==================================================
// ADD VARIANT
// ==================================================

export const useAddProductVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      payload,
      image,
    }: {
      productId: string;
      payload: CreateProductVariantPayload;
      image?: File;
    }) => productService.addVariant(productId, payload, image),

    onSuccess: (product, variables) => {
      queryClient.setQueryData(
        productKeys.detail(variables.productId),
        product,
      );

      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
    },
  });
};

// ==================================================
// UPDATE VARIANT
// ==================================================

export const useUpdateProductVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      payload,
      image,
    }: {
      productId: string;
      variantId: string;
      payload: UpdateProductVariantPayload;
      image?: File;
    }) => productService.updateVariant(productId, variantId, payload, image),

    onSuccess: (product, variables) => {
      queryClient.setQueryData(
        productKeys.detail(variables.productId),
        product,
      );

      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
    },
  });
};

// ==================================================
// DELETE VARIANT
// ==================================================

export const useDeleteProductVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
    }: {
      productId: string;
      variantId: string;
    }) => productService.deleteVariant(productId, variantId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });

      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
    },
  });
};
