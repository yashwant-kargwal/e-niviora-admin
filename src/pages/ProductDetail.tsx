import { useRef, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Package,
  Pencil,
  Plus,
  Trash2,
  ImagePlus,
  X,
  AlertTriangle,
  Layers3,
  Upload,
} from "lucide-react";

import {
  useProduct,
  useUpdateProduct,
  useDeleteProduct,
  useAddProductImages,
  useDeleteProductImage,
  useAddProductVariant,
  useUpdateProductVariant,
  useDeleteProductVariant,
} from "@/hooks/useProducts";

import { useCategories } from "@/hooks/useCategories";

import type { ProductVariant } from "@/types/product";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Checkbox } from "@/components/ui/checkbox";

const ProductDetail = () => {
  const { id } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();

  const productId = id ?? "";

  const { data: product, isLoading, isError } = useProduct(productId);

  const { data: categoriesData } = useCategories({
    page: 1,
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
  });

  const updateProduct = useUpdateProduct();

  const deleteProduct = useDeleteProduct();

  const addImages = useAddProductImages();

  const deleteImage = useDeleteProductImage();

  const addVariant = useAddProductVariant();

  const updateVariant = useUpdateProductVariant();

  const deleteVariant = useDeleteProductVariant();

  // ---------------------------------------------
  // Product edit
  // ---------------------------------------------

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    isActive: true,
    categoryIds: [] as string[],
  });

  // ---------------------------------------------
  // Variant
  // ---------------------------------------------

  const [variantOpen, setVariantOpen] = useState(false);

  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null,
  );

  const [variantForm, setVariantForm] = useState({
    sku: "",
    name: "",
    price: "",
    discount: "0",
    stock: "0",
    image: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    note: "",
  });

  const [variantImageFile, setVariantImageFile] = useState<File | null>(null);

  const [variantImagePreviewUrl, setVariantImagePreviewUrl] = useState("");

  const variantImageInputRef = useRef<HTMLInputElement>(null);

  const [deleteVariantTarget, setDeleteVariantTarget] =
    useState<ProductVariant | null>(null);

  // ---------------------------------------------
  // Image
  // ---------------------------------------------

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);

  const [deleteImageTarget, setDeleteImageTarget] = useState<{
    id: string;
    mediaUrl: string;
  } | null>(null);

  const [deleteProductOpen, setDeleteProductOpen] = useState(false);

  const categories = categoriesData?.data ?? [];

  // ---------------------------------------------
  // Loading
  // ---------------------------------------------

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded bg-muted" />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="h-96 animate-pulse bg-muted" />
          </Card>

          <Card>
            <CardContent className="h-96 animate-pulse bg-muted" />
          </Card>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="mx-auto size-8 text-destructive" />

            <h2 className="mt-4 font-semibold">Product not found</h2>

            <Button
              className="mt-4"
              variant="outline"
              onClick={() => navigate("/admin/products")}
            >
              Back to Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------
  // Open Edit
  // ---------------------------------------------

  const openEditProduct = () => {
    setProductForm({
      name: product.name,
      description: product.description ?? "",
      isActive: product.isActive,
      categoryIds: product.categories.map((category) => category.id),
    });

    setIsEditOpen(true);
  };

  // ---------------------------------------------
  // Update Product
  // ---------------------------------------------

  const handleProductUpdate = async () => {
    if (!productForm.name.trim()) {
      return;
    }

    try {
      await updateProduct.mutateAsync({
        id: product.id,

        payload: {
          name: productForm.name.trim(),

          description: productForm.description.trim() || undefined,

          isActive: productForm.isActive,

          categoryIds: productForm.categoryIds,
        },
      });

      setIsEditOpen(false);
    } catch (error) {
      console.error("Product update failed:", error);
    }
  };

  // ---------------------------------------------
  // Delete Product
  // ---------------------------------------------

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct.mutateAsync(product.id);

      navigate("/admin/products");
    } catch (error) {
      console.error("Product deletion failed:", error);
    }
  };

  // ---------------------------------------------
  // Variant modal
  // ---------------------------------------------

  const openAddVariant = () => {
    setEditingVariant(null);

    setVariantImageFile(null);
    setVariantImagePreviewUrl("");

    setVariantForm({
      sku: "",
      name: "",
      price: "",
      discount: "0",
      stock: "0",
      image: "",
      weight: "",
      length: "",
      width: "",
      height: "",
      note: "",
    });

    setVariantOpen(true);
  };

  const openEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);

    setVariantImageFile(null);
    setVariantImagePreviewUrl(variant.image ?? "");

    setVariantForm({
      sku: variant.sku,
      name: variant.name,
      price: String(variant.price),
      discount: String(variant.discount ?? 0),
      stock: String(variant.stock),
      image: variant.image ?? "",
      weight: String(variant.weight),
      length: String(variant.length),
      width: String(variant.width),
      height: String(variant.height),
      note: variant.note ?? "",
    });

    setVariantOpen(true);
  };

  // ---------------------------------------------
  // Save Variant
  // ---------------------------------------------

  const handleVariantSubmit = async () => {
    if (
      !variantForm.sku.trim() ||
      !variantForm.name.trim() ||
      !variantForm.price ||
      !variantForm.weight ||
      !variantForm.length ||
      !variantForm.width ||
      !variantForm.height
    ) {
      return;
    }

    const payload = {
      sku: variantForm.sku.trim(),

      name: variantForm.name.trim(),

      price: Number(variantForm.price),

      discount: Number(variantForm.discount || 0),

      stock: Number(variantForm.stock),

      image: variantForm.image.trim() || undefined,

      weight: Number(variantForm.weight),

      length: Number(variantForm.length),

      width: Number(variantForm.width),

      height: Number(variantForm.height),

      note: variantForm.note.trim() || undefined,
    };

    try {
      if (editingVariant) {
        await updateVariant.mutateAsync({
          productId: product.id,

          variantId: editingVariant.id,

          payload,

          image: variantImageFile ?? undefined,
        });
      } else {
        await addVariant.mutateAsync({
          productId: product.id,

          payload,

          image: variantImageFile ?? undefined,
        });
      }

      setVariantOpen(false);
      setVariantImageFile(null);
      setVariantImagePreviewUrl("");
    } catch (error) {
      console.error("Variant save failed:", error);
    }
  };

  // ---------------------------------------------
  // Delete Variant
  // ---------------------------------------------

  const handleDeleteVariant = async () => {
    if (!deleteVariantTarget) {
      return;
    }

    try {
      await deleteVariant.mutateAsync({
        productId: product.id,

        variantId: deleteVariantTarget.id,
      });

      setDeleteVariantTarget(null);
    } catch (error) {
      console.error("Variant deletion failed:", error);
    }
  };

  // ---------------------------------------------
  // Add Image
  // ---------------------------------------------

  const handleAddImage = async () => {
    if (!imageFile) {
      return;
    }

    try {
      await addImages.mutateAsync({
        productId: product.id,

        images: [imageFile],
      });

      setImageFile(null);
      setImagePreviewUrl("");
    } catch (error) {
      console.error("Image add failed:", error);
    }
  };

  // ---------------------------------------------
  // Delete Image
  // ---------------------------------------------

  const handleDeleteImage = async () => {
    if (!deleteImageTarget) {
      return;
    }

    try {
      await deleteImage.mutateAsync({
        productId: product.id,

        imageId: deleteImageTarget.id,
      });

      setDeleteImageTarget(null);
    } catch (error) {
      console.error("Image deletion failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/admin/products")}
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {product.name}
              </h1>

              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Product ID: {product.id}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={openEditProduct}>
            <Pencil className="mr-2 size-4" />
            Edit Product
          </Button>

          <Button
            variant="destructive"
            onClick={() => setDeleteProductOpen(true)}
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* ================================================= */}
      {/* PRODUCT BASIC INFO */}
      {/* ================================================= */}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Images */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {product.media.map((media) => (
                <div
                  key={media.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                >
                  <img
                    src={media.mediaUrl}
                    alt={product.name}
                    className="size-full object-cover"
                  />

                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 size-8 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() =>
                      setDeleteImageTarget({
                        id: media.id,
                        mediaUrl: media.mediaUrl,
                      })
                    }
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}

              {product.media.length === 0 && (
                <div className="col-span-2 flex aspect-video flex-col items-center justify-center rounded-lg border border-dashed">
                  <ImagePlus className="size-8 text-muted-foreground" />

                  <p className="mt-2 text-sm text-muted-foreground">
                    No images
                  </p>
                </div>
              )}
            </div>

            {/* Add image */}
            <div className="space-y-2">
              <Label>Add image from device</Label>

              <div className="flex items-center gap-3">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      setImageFile(file);
                      setImagePreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                />

                {imagePreviewUrl && (
                  <img
                    src={imagePreviewUrl}
                    alt="Selected product preview"
                    className="size-12 rounded-md border object-cover"
                  />
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={addImages.isPending}
                >
                  <Upload className="mr-2 size-4" />
                  {imageFile?.name ?? "Choose image"}
                </Button>

                <Button
                  size="icon"
                  onClick={handleAddImage}
                  disabled={!imageFile || addImages.isPending}
                  aria-label="Upload selected image"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground">Description</p>

              <p className="mt-1 whitespace-pre-wrap">
                {product.description || "No description added."}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Categories</p>

              <div className="mt-2 flex flex-wrap gap-2">
                {product.categories.length > 0 ? (
                  product.categories.map((category) => (
                    <Badge key={category.id} variant="secondary">
                      {category.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No categories assigned.
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Variants</p>

                <p className="mt-1 text-2xl font-bold">
                  {product.variantCount}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Images</p>

                <p className="mt-1 text-2xl font-bold">
                  {product.media.length}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Status</p>

                <p className="mt-1 font-semibold">
                  {product.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================================================= */}
      {/* VARIANTS */}
      {/* ================================================= */}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Product Variants</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage SKU, price, stock, dimensions and variant details.
              </p>
            </div>

            <Button onClick={openAddVariant}>
              <Plus className="mr-2 size-4" />
              Add Variant
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {product.variant.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-14">
              <Layers3 className="size-9 text-muted-foreground" />

              <p className="mt-3 font-medium">No variants</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Add at least one variant to sell this product.
              </p>

              <Button className="mt-4" onClick={openAddVariant}>
                <Plus className="mr-2 size-4" />
                Add Variant
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="px-4 py-3 text-left">Variant</th>

                      <th className="px-4 py-3 text-left">SKU</th>

                      <th className="px-4 py-3 text-left">Price</th>

                      <th className="px-4 py-3 text-left">Stock</th>

                      <th className="px-4 py-3 text-left">Dimensions</th>

                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {product.variant.map((variant) => (
                      <tr key={variant.id} className="border-b last:border-0">
                        {/* Variant */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-10 overflow-hidden rounded-md border bg-muted">
                              {variant.image ? (
                                <img
                                  src={variant.image}
                                  alt={variant.name}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center">
                                  <Package className="size-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="font-medium">{variant.name}</p>

                              {variant.note && (
                                <p className="text-xs text-muted-foreground">
                                  {variant.note}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="px-4 py-4 font-mono text-xs">
                          {variant.sku}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-4 font-medium">
                          <div className="flex flex-col">
                            <span>
                              Price: ₹
                              {Number(variant.price).toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              MRP : ₹
                              {(
                                Number(variant.price) +
                                Number(variant.discount ?? 0)
                              ).toLocaleString("en-IN")}
                            </span>
                            {Number(variant.discount ?? 0) > 0 && (
                              <span className="text-xs text-muted-foreground">
                                Discount shown to customer: ₹
                                {Number(variant.discount).toLocaleString(
                                  "en-IN",
                                )}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-4">
                          <Badge
                            variant={
                              variant.stock > 0 ? "default" : "destructive"
                            }
                          >
                            {variant.stock}
                          </Badge>
                        </td>

                        {/* Dimensions */}
                        <td className="px-4 py-4 text-muted-foreground">
                          {variant.length} × {variant.width} × {variant.height}{" "}
                          cm
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditVariant(variant)}
                            >
                              <Pencil className="size-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteVariantTarget(variant)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================================================= */}
      {/* EDIT PRODUCT */}
      {/* ================================================= */}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>

            <DialogDescription>
              Update product information, categories and status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label>Product Name</Label>

              <Input
                value={productForm.name}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>

              <Textarea
                rows={5}
                value={productForm.description}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <Checkbox
                checked={productForm.isActive}
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  setProductForm((current) => ({
                    ...current,
                    isActive: checked === true,
                  }))
                }
              />

              <Label>Product is active</Label>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <Label>Categories</Label>

              <div className="grid gap-2 sm:grid-cols-2">
                {categories.map((category) => {
                  const checked = productForm.categoryIds.includes(category.id);

                  return (
                    <label
                      key={category.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value: boolean | "indeterminate") => {
                          setProductForm((current) => {
                            if (value === true) {
                              return {
                                ...current,
                                categoryIds: [
                                  ...current.categoryIds,
                                  category.id,
                                ],
                              };
                            }

                            return {
                              ...current,
                              categoryIds: current.categoryIds.filter(
                                (id) => id !== category.id,
                              ),
                            };
                          });
                        }}
                      />

                      <span className="text-sm">{category.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>

            <Button
              onClick={handleProductUpdate}
              disabled={!productForm.name.trim() || updateProduct.isPending}
            >
              {updateProduct.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================= */}
      {/* VARIANT ADD / EDIT */}
      {/* ================================================= */}

      <Dialog open={variantOpen} onOpenChange={setVariantOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? "Edit Variant" : "Add Variant"}
            </DialogTitle>

            <DialogDescription>
              Add SKU, pricing, stock, dimensions and other variant information.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Variant Name</Label>

                <Input
                  value={variantForm.name}
                  onChange={(event) =>
                    setVariantForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="500ml Bottle"
                />
              </div>

              <div className="space-y-2">
                <Label>SKU</Label>

                <Input
                  value={variantForm.sku}
                  onChange={(event) =>
                    setVariantForm((current) => ({
                      ...current,
                      sku: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="QS-SHINE-500ML"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Price (Customer Pays)</Label>

                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={variantForm.price}
                  onChange={(event) =>
                    setVariantForm((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                  placeholder="299"
                />
              </div>

              <div className="space-y-2">
                <Label>Discount Amount (Shown to Customer)</Label>

                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={variantForm.discount}
                  onChange={(event) =>
                    setVariantForm((current) => ({
                      ...current,
                      discount: event.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>
            </div>

            {(Number(variantForm.price || 0) > 0 ||
              Number(variantForm.discount || 0) > 0) && (
              <p className="text-sm text-muted-foreground">
                MRP : ₹
                {(
                  Number(variantForm.price || 0) +
                  Number(variantForm.discount || 0)
                ).toLocaleString("en-IN")}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Stock</Label>

                <Input
                  type="number"
                  min="0"
                  value={variantForm.stock}
                  onChange={(event) =>
                    setVariantForm((current) => ({
                      ...current,
                      stock: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Dimensions</Label>

              <div className="grid gap-4 sm:grid-cols-4">
                <Input
                  type="number"
                  min="0"
                  placeholder="Weight (g)"
                  value={variantForm.weight}
                  onChange={(event) =>
                    setVariantForm((current) => ({
                      ...current,
                      weight: event.target.value,
                    }))
                  }
                />

                <Input
                  type="number"
                  min="0"
                  placeholder="Length (cm)"
                  value={variantForm.length}
                  onChange={(event) =>
                    setVariantForm((current) => ({
                      ...current,
                      length: event.target.value,
                    }))
                  }
                />

                <Input
                  type="number"
                  min="0"
                  placeholder="Width (cm)"
                  value={variantForm.width}
                  onChange={(event) =>
                    setVariantForm((current) => ({
                      ...current,
                      width: event.target.value,
                    }))
                  }
                />

                <Input
                  type="number"
                  min="0"
                  placeholder="Height (cm)"
                  value={variantForm.height}
                  onChange={(event) =>
                    setVariantForm((current) => ({
                      ...current,
                      height: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Variant Image</Label>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={variantImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      setVariantImageFile(file);
                      setVariantImagePreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                />

                {variantImagePreviewUrl && (
                  <img
                    src={variantImagePreviewUrl}
                    alt="Selected variant preview"
                    className="size-14 rounded-md border object-cover"
                  />
                )}

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => variantImageInputRef.current?.click()}
                  disabled={addVariant.isPending || updateVariant.isPending}
                >
                  <Upload className="mr-2 size-4" />
                  {variantImageFile?.name ?? "Choose image"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Note</Label>

              <Textarea
                rows={3}
                value={variantForm.note}
                onChange={(event) =>
                  setVariantForm((current) => ({
                    ...current,
                    note: event.target.value,
                  }))
                }
                placeholder="Best seller pack"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVariantOpen(false)}>
              Cancel
            </Button>

            <Button
              onClick={handleVariantSubmit}
              disabled={addVariant.isPending || updateVariant.isPending}
            >
              {addVariant.isPending || updateVariant.isPending
                ? "Saving..."
                : editingVariant
                  ? "Save Variant"
                  : "Add Variant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================= */}
      {/* DELETE VARIANT */}
      {/* ================================================= */}

      <AlertDialog
        open={!!deleteVariantTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteVariantTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant?</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">
                {deleteVariantTarget?.name}
              </strong>{" "}
              ({deleteVariantTarget?.sku}
              )?
              <span className="mt-2 block">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              disabled={deleteVariant.isPending}
              onClick={handleDeleteVariant}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteVariant.isPending ? "Deleting..." : "Delete Variant"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ================================================= */}
      {/* DELETE IMAGE */}
      {/* ================================================= */}

      <AlertDialog
        open={!!deleteImageTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteImageTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>

            <AlertDialogDescription>
              This image will be removed from this product.
              <span className="mt-2 block">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              disabled={deleteImage.isPending}
              onClick={handleDeleteImage}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteImage.isPending ? "Deleting..." : "Delete Image"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ================================================= */}
      {/* DELETE PRODUCT */}
      {/* ================================================= */}

      <AlertDialog open={deleteProductOpen} onOpenChange={setDeleteProductOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Delete Product?
            </AlertDialogTitle>

            <AlertDialogDescription>
              You are about to permanently delete{" "}
              <strong className="text-foreground">{product.name}</strong>.
              <span className="mt-3 block">
                This will remove the product, its variants, images and category
                associations.
              </span>
              <span className="mt-2 block">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              disabled={deleteProduct.isPending}
              onClick={handleDeleteProduct}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteProduct.isPending ? "Deleting..." : "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductDetail;
