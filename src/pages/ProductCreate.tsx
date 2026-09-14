import { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Package,
  Plus,
  Trash2,
  ImagePlus,
  Layers3,
  RefreshCw,
  AlertTriangle,
  Upload,
  X,
} from "lucide-react";

import { useCreateProduct } from "@/hooks/useProducts";

import { useCategories } from "@/hooks/useCategories";

import type {
  CreateProductPayload,
  CreateProductVariantPayload,
} from "@/types/product";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

type ProductImageForm = {
  file: File | null;
  previewUrl: string;
};

type VariantForm = CreateProductVariantPayload & {
  imageFile: File | null;
  imagePreviewUrl: string;
};

const MAX_PRODUCT_IMAGES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ProductCreate = () => {
  const navigate = useNavigate();

  // ==================================================
  // PRODUCT
  // ==================================================

  const [productName, setProductName] = useState("");

  const [description, setDescription] = useState("");

  const [isActive, setIsActive] = useState(true);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // ==================================================
  // PRODUCT IMAGES
  // ==================================================

  const [images, setImages] = useState<ProductImageForm[]>([]);

  const imageInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ==================================================
  // VARIANTS
  // ==================================================

  const createEmptyVariant = (): VariantForm => ({
    sku: "",
    name: "",
    price: 0,
    discount: 0,
    stock: 0,

    weight: 0,
    length: 0,
    width: 0,
    height: 0,

    note: "",

    imageFile: null,
    imagePreviewUrl: "",
  });

  const [variants, setVariants] = useState<VariantForm[]>([
    createEmptyVariant(),
  ]);

  // ==================================================
  // API
  // ==================================================

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
    page: 1,
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
  });

  const createProduct = useCreateProduct();

  const categories = categoriesData?.data ?? [];

  const isSubmitting = createProduct.isPending;

  // ==================================================
  // CLEANUP OBJECT URLS
  // ==================================================

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.previewUrl) {
          URL.revokeObjectURL(image.previewUrl);
        }
      });

      variants.forEach((variant) => {
        if (variant.imagePreviewUrl) {
          URL.revokeObjectURL(variant.imagePreviewUrl);
        }
      });
    };
  }, []);

  // ==================================================
  // CATEGORY
  // ==================================================

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((current) => {
      if (current.includes(categoryId)) {
        return current.filter((id) => id !== categoryId);
      }

      return [...current, categoryId];
    });
  };

  // ==================================================
  // PRODUCT IMAGE
  // ==================================================

  const addImageSlot = () => {
    if (images.length >= MAX_PRODUCT_IMAGES) {
      return;
    }

    setImages((current) => [
      ...current,
      {
        file: null,
        previewUrl: "",
      },
    ]);
  };

  const removeImage = (index: number) => {
    setImages((current) => {
      const image = current[index];

      if (image?.previewUrl) {
        URL.revokeObjectURL(image.previewUrl);
      }

      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const updateImage = (index: number, file: File | null) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("Image size cannot exceed 10 MB.");

      return;
    }

    setImages((current) =>
      current.map((image, itemIndex) => {
        if (itemIndex !== index) {
          return image;
        }

        if (image.previewUrl) {
          URL.revokeObjectURL(image.previewUrl);
        }

        return {
          file,
          previewUrl: URL.createObjectURL(file),
        };
      }),
    );
  };

  // ==================================================
  // VARIANT
  // ==================================================

  const addVariant = () => {
    setVariants((current) => [...current, createEmptyVariant()]);
  };

  const removeVariant = (index: number) => {
    setVariants((current) => {
      const variant = current[index];

      if (variant?.imagePreviewUrl) {
        URL.revokeObjectURL(variant.imagePreviewUrl);
      }

      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const updateVariant = (
    index: number,
    field: keyof CreateProductVariantPayload,
    value: string | number,
  ) => {
    setVariants((current) =>
      current.map((variant, itemIndex) =>
        itemIndex === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant,
      ),
    );
  };

  const updateVariantImage = (index: number, file: File | null) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("Image size cannot exceed 10 MB.");

      return;
    }

    setVariants((current) =>
      current.map((variant, itemIndex) => {
        if (itemIndex !== index) {
          return variant;
        }

        if (variant.imagePreviewUrl) {
          URL.revokeObjectURL(variant.imagePreviewUrl);
        }

        return {
          ...variant,
          imageFile: file,
          imagePreviewUrl: URL.createObjectURL(file),
        };
      }),
    );
  };

  const removeVariantImage = (index: number) => {
    setVariants((current) =>
      current.map((variant, itemIndex) => {
        if (itemIndex !== index) {
          return variant;
        }

        if (variant.imagePreviewUrl) {
          URL.revokeObjectURL(variant.imagePreviewUrl);
        }

        return {
          ...variant,
          imageFile: null,
          imagePreviewUrl: "",
        };
      }),
    );
  };

  // ==================================================
  // VALIDATION
  // ==================================================

  const validateForm = () => {
    const name = productName.trim();

    if (!name) {
      return "Product name is required.";
    }

    if (name.length < 2) {
      return "Product name must be at least 2 characters.";
    }

    if (description.trim().length > 5000) {
      return "Description cannot exceed 5000 characters.";
    }

    const selectedFiles = images.filter(
      (
        image,
      ): image is ProductImageForm & {
        file: File;
      } => image.file !== null,
    );

    if (selectedFiles.length === 0) {
      return "Please upload at least one product image.";
    }

    if (selectedFiles.length > MAX_PRODUCT_IMAGES) {
      return `You can upload a maximum of ${MAX_PRODUCT_IMAGES} product images.`;
    }

    if (variants.length === 0) {
      return "Product must have at least one variant.";
    }

    const skuSet = new Set<string>();

    for (let index = 0; index < variants.length; index++) {
      const variant = variants[index];

      const sku = variant.sku.trim().toUpperCase();

      const variantName = variant.name.trim();

      if (!variantName) {
        return `Variant ${index + 1} name is required.`;
      }

      if (variantName.length > 100) {
        return `Variant ${index + 1} name cannot exceed 100 characters.`;
      }

      if (!sku) {
        return `Variant ${index + 1} SKU is required.`;
      }

      if (skuSet.has(sku)) {
        return `Duplicate SKU found: ${sku}.`;
      }

      skuSet.add(sku);

      if (!Number.isFinite(variant.price) || variant.price <= 0) {
        return `Variant ${index + 1} price must be greater than 0.`;
      }

      if (
        variant.discount !== undefined &&
        (!Number.isFinite(variant.discount) || variant.discount < 0)
      ) {
        return `Variant ${index + 1} discount cannot be negative.`;
      }

      if (variant.stock && variant.stock < 0) {
        return `Variant ${index + 1} stock cannot be negative.`;
      }

      if (!Number.isInteger(variant.stock)) {
        return `Variant ${index + 1} stock must be a whole number.`;
      }

      if (variant.weight <= 0) {
        return `Variant ${index + 1} weight must be greater than 0.`;
      }

      if (variant.length <= 0 || variant.width <= 0 || variant.height <= 0) {
        return `Variant ${index + 1} dimensions must be greater than 0.`;
      }

      if (variant.note && variant.note.length > 500) {
        return `Variant ${index + 1} note cannot exceed 500 characters.`;
      }
    }

    return null;
  };

  // ==================================================
  // SUBMIT
  // ==================================================

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      alert(validationError);
      return;
    }

    const productFiles = images
      .map((image) => image.file)
      .filter((file): file is File => file !== null);

    const variantImageFiles = variants
      .map((variant) => variant.imageFile)
      .filter((file): file is File => file !== null);

    const payload: CreateProductPayload = {
      name: productName.trim(),
      description: description.trim() || undefined,
      isActive,
      categoryIds: selectedCategoryIds,
      variants: variants.map((variant) => ({
        sku: variant.sku.trim().toUpperCase(),
        name: variant.name.trim(),
        price: Number(variant.price),
        discount: Number(variant.discount ?? 0),
        stock: Number(variant.stock),
        weight: Number(variant.weight),
        length: Number(variant.length),
        width: Number(variant.width),
        height: Number(variant.height),
        note: variant?.note?.trim() || undefined,
      })),
    };

    try {
      const createdProduct = await createProduct.mutateAsync({
        payload,
        images: productFiles,
        variantImages: variantImageFiles,
      });

      navigate(`/admin/products/${createdProduct.id}`);
    } catch (error) {
      console.error("Product creation failed:", error);
    }
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      {/* ================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/admin/products")}
            disabled={isSubmitting}
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <Package className="size-6" />

              <h1 className="text-2xl font-bold tracking-tight">Add Product</h1>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Create a product with categories, images and variants.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/products")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 size-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 size-4" />
                Create Product
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ================================================
          BASIC INFORMATION
      ================================================= */}

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>

          <CardDescription>
            Basic information about the product.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Name */}

          <div className="space-y-2">
            <Label htmlFor="product-name">
              Product Name <span className="text-destructive">*</span>
            </Label>

            <Input
              id="product-name"
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
              placeholder="e.g. smoothshine Car Shampoo"
              disabled={isSubmitting}
              maxLength={200}
            />

            <p className="text-right text-xs text-muted-foreground">
              {productName.length}/200
            </p>
          </div>

          {/* Description */}

          <div className="space-y-2">
            <Label htmlFor="product-description">Description</Label>

            <Textarea
              id="product-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Premium shampoo for daily car wash."
              rows={5}
              disabled={isSubmitting}
              maxLength={5000}
            />

            <p className="text-right text-xs text-muted-foreground">
              {description.length}/5000
            </p>
          </div>

          {/* Status */}

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Product Status</p>

              <p className="text-sm text-muted-foreground">
                Inactive products won't be available for customers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked === true)}
                disabled={isSubmitting}
              />

              <Label>Active</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================
          CATEGORIES
      ================================================= */}

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>

          <CardDescription>
            Select one or more categories for this product.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {categoriesLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="size-4 animate-spin" />
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <AlertTriangle className="mx-auto size-6 text-muted-foreground" />

              <p className="mt-2 font-medium">No categories available</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Create a category before assigning it to a product.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const selected = selectedCategoryIds.includes(category.id);

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    disabled={isSubmitting}
                    className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => toggleCategory(category.id)}
                      onClick={(event) => event.stopPropagation()}
                      disabled={isSubmitting}
                    />

                    <div className="min-w-0">
                      <p className="font-medium">{category.name}</p>

                      {category.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedCategoryIds.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Selected:</span>

              {selectedCategoryIds.map((categoryId) => {
                const category = categories.find(
                  (item) => item.id === categoryId,
                );

                return category ? (
                  <Badge key={categoryId} variant="secondary">
                    {category.name}
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================================================
          PRODUCT IMAGES
      ================================================= */}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Product Images</CardTitle>

              <CardDescription>
                Upload up to {MAX_PRODUCT_IMAGES} product images. The displayed
                order is automatically used as the image sort order.
              </CardDescription>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={addImageSlot}
              disabled={images.length >= MAX_PRODUCT_IMAGES || isSubmitting}
            >
              <Plus className="mr-2 size-4" />
              Add Image
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {images.length === 0 ? (
            <button
              type="button"
              onClick={addImageSlot}
              disabled={isSubmitting}
              className="flex min-h-40 w-full flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 transition-colors hover:bg-muted/40"
            >
              <ImagePlus className="size-8 text-muted-foreground" />

              <p className="mt-3 font-medium">Add product images</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Click to choose an image from your device
              </p>
            </button>
          ) : (
            images.map((image, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center"
              >
                {/* Position */}

                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                </div>

                {/* Preview */}

                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                  {image.previewUrl ? (
                    <img
                      src={image.previewUrl}
                      alt={`Product image ${index + 1}`}
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="size-6 text-muted-foreground" />
                  )}
                </div>

                {/* File */}

                <div className="min-w-0 flex-1 space-y-2">
                  <Label>Image {index + 1}</Label>

                  <input
                    ref={(element) => {
                      imageInputRefs.current[index] = element;
                    }}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={(event) => {
                      updateImage(index, event.target.files?.[0] ?? null);

                      event.target.value = "";
                    }}
                    disabled={isSubmitting}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => imageInputRefs.current[index]?.click()}
                    disabled={isSubmitting}
                  >
                    <Upload className="mr-2 size-4" />

                    <span className="truncate">
                      {image.file?.name ?? "Choose image"}
                    </span>
                  </Button>
                </div>

                {/* Status */}

                <div className="shrink-0">
                  {image.file ? (
                    <Badge variant="secondary">Ready</Badge>
                  ) : (
                    <Badge variant="outline">Required</Badge>
                  )}
                </div>

                {/* Remove */}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={() => removeImage(index)}
                  disabled={isSubmitting}
                  aria-label={`Remove image ${index + 1}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          )}

          {images.length > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Uploaded</span>

              <span className="font-medium">
                {images.filter((image) => image.file).length} /{" "}
                {MAX_PRODUCT_IMAGES}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================================================
          VARIANTS
      ================================================= */}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers3 className="size-5" />
                Product Variants
              </CardTitle>

              <CardDescription>
                Add different sizes, packs or other purchasable variants.
              </CardDescription>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={addVariant}
              disabled={isSubmitting}
            >
              <Plus className="mr-2 size-4" />
              Add Variant
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {variants.map((variant, index) => (
            <div key={index} className="rounded-xl border p-5">
              {/* Variant Header */}

              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                    <span className="text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                  </div>

                  <div>
                    <p className="font-semibold">Variant {index + 1}</p>

                    <p className="text-xs text-muted-foreground">
                      {variant.name || "New variant"}
                    </p>
                  </div>
                </div>

                {variants.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeVariant(index)}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {/* Name / SKU */}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Variant Name <span className="text-destructive">*</span>
                    </Label>

                    <Input
                      value={variant.name}
                      onChange={(event) =>
                        updateVariant(index, "name", event.target.value)
                      }
                      placeholder="500ml Bottle"
                      disabled={isSubmitting}
                      maxLength={100}
                    />

                    <p className="text-right text-xs text-muted-foreground">
                      {variant.name.length}
                      /100
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      SKU <span className="text-destructive">*</span>
                    </Label>

                    <Input
                      value={variant.sku}
                      onChange={(event) =>
                        updateVariant(
                          index,
                          "sku",
                          event.target.value.toUpperCase(),
                        )
                      }
                      placeholder="QS-SHINE-500ML"
                      disabled={isSubmitting}
                      maxLength={100}
                      className="font-mono"
                    />
                  </div>
                </div>

                {/* Price / Stock */}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Price (Customer Pays){" "}
                      <span className="text-destructive">*</span>
                    </Label>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        ₹
                      </span>

                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price || ""}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "price",
                            Number(event.target.value),
                          )
                        }
                        className="pl-8"
                        placeholder="299"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Discount Amount (Shown to Customer)</Label>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        ₹
                      </span>

                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.discount ?? 0}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "discount",
                            Number(event.target.value),
                          )
                        }
                        className="pl-8"
                        placeholder="0"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {Number(variant.price || 0) > 0 ||
                Number(variant.discount || 0) > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    MRP : ₹
                    {(
                      Number(variant.price || 0) + Number(variant.discount || 0)
                    ).toLocaleString("en-IN")}
                  </p>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Stock</Label>

                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={variant.stock}
                      onChange={(event) =>
                        updateVariant(
                          index,
                          "stock",
                          Number(event.target.value),
                        )
                      }
                      placeholder="20"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2 opacity-0">
                    <Label>Hidden spacer</Label>
                    <Input disabled value="" />
                  </div>
                </div>

                <Separator />

                {/* Dimensions */}

                <div>
                  <div className="mb-3">
                    <p className="font-medium">Package Dimensions</p>

                    <p className="text-xs text-muted-foreground">
                      Weight in grams and dimensions in centimeters.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Weight */}

                    <div className="space-y-2">
                      <Label>
                        Weight (g) <span className="text-destructive">*</span>
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={variant.weight || ""}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "weight",
                            Number(event.target.value),
                          )
                        }
                        placeholder="500"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Length */}

                    <div className="space-y-2">
                      <Label>
                        Length (cm) <span className="text-destructive">*</span>
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={variant.length || ""}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "length",
                            Number(event.target.value),
                          )
                        }
                        placeholder="10"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Width */}

                    <div className="space-y-2">
                      <Label>
                        Width (cm) <span className="text-destructive">*</span>
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={variant.width || ""}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "width",
                            Number(event.target.value),
                          )
                        }
                        placeholder="8"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Height */}

                    <div className="space-y-2">
                      <Label>
                        Height (cm) <span className="text-destructive">*</span>
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={variant.height || ""}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "height",
                            Number(event.target.value),
                          )
                        }
                        placeholder="20"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Variant Image */}

                <div className="space-y-3">
                  <div>
                    <Label>Variant Image</Label>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Upload an image for this specific variant.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                      {variant.imagePreviewUrl ? (
                        <>
                          <img
                            src={variant.imagePreviewUrl}
                            alt={`Variant ${index + 1}`}
                            className="size-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => removeVariantImage(index)}
                            disabled={isSubmitting}
                            className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
                            aria-label="Remove variant image"
                          >
                            <X className="size-3" />
                          </button>
                        </>
                      ) : (
                        <ImagePlus className="size-6 text-muted-foreground" />
                      )}
                    </div>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      id={`variant-image-${index}`}
                      onChange={(event) => {
                        updateVariantImage(
                          index,
                          event.target.files?.[0] ?? null,
                        );

                        event.target.value = "";
                      }}
                      disabled={isSubmitting}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                    >
                      <label
                        htmlFor={`variant-image-${index}`}
                        className="cursor-pointer flex"
                      >
                        <Upload className="mr-2 size-4" />

                        {variant.imageFile ? "Change image" : "Choose image"}
                      </label>
                    </Button>

                    {variant.imageFile && (
                      <div className="min-w-0">
                        <p className="max-w-[260px] truncate text-sm font-medium">
                          {variant.imageFile.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {(variant.imageFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Note */}

                <div className="space-y-2">
                  <Label>Note</Label>

                  <Textarea
                    rows={3}
                    value={variant.note}
                    onChange={(event) =>
                      updateVariant(index, "note", event.target.value)
                    }
                    placeholder="Best seller pack"
                    disabled={isSubmitting}
                    maxLength={500}
                  />

                  <p className="text-right text-xs text-muted-foreground">
                    {variant?.note?.length}
                    /500
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Add Variant */}

          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            onClick={addVariant}
            disabled={isSubmitting}
          >
            <Plus className="mr-2 size-4" />
            Add Another Variant
          </Button>
        </CardContent>
      </Card>

      {/* ================================================
          BOTTOM ACTION
      ================================================= */}

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/products")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <RefreshCw className="mr-2 size-4 animate-spin" />
              Creating Product...
            </>
          ) : (
            <>
              <Package className="mr-2 size-4" />
              Create Product
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductCreate;
