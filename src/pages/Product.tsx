import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Package,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Layers3,
} from "lucide-react";

import { useProducts, useDeleteProduct } from "@/hooks/useProducts";

import { useCategories } from "@/hooks/useCategories";

import type { ProductListItem } from "@/types/product";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const Products = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);

  const limit = 10;

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<ProductListItem | null>(
    null,
  );

  const { data, isLoading, isFetching, isError, refetch } = useProducts({
    page,
    limit,
    search: search.trim() || undefined,
    categoryId: selectedCategory || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data: categoriesData } = useCategories({
    page: 1,
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
  });

  const deleteProduct = useDeleteProduct();

  const products = data?.data ?? [];

  const meta = data?.meta;

  const categories = categoriesData?.data ?? [];

  const handleSearch = (value: string) => {
    setSearch(value);

    if (page !== 1) {
      setPage(1);
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteProduct.mutateAsync(deleteTarget.id);

      setDeleteTarget(null);

      if (products.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (error) {
      console.error("Product deletion failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded bg-muted" />

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({
                length: 7,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-14 animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <AlertTriangle className="size-8 text-destructive" />

            <div>
              <h2 className="font-semibold">Failed to load products</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Something went wrong while loading products.
              </p>
            </div>

            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 size-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Package className="size-6" />

            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage products, variants and inventory.
          </p>
        </div>

        <Button onClick={() => navigate("/admin/products/new")}>
          <Plus className="mr-2 size-4" />
          Add Product
        </Button>
      </div>

      {/* ================================================== */}
      {/* SUMMARY */}
      {/* ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
              <Package className="size-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>

              <p className="text-2xl font-bold">{meta?.total ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-blue-500/10">
              <Layers3 className="size-5 text-blue-600" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Variants on Page</p>

              <p className="text-2xl font-bold">
                {products.reduce(
                  (total, product) => total + product.variantCount,
                  0,
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================================================== */}
      {/* TABLE */}
      {/* ================================================== */}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle>All Products</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {meta?.total ?? 0} products found
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) => handleSearch(event.target.value)}
                  placeholder="Search products..."
                  className="pl-9"
                />
              </div>

              {/* Category */}
              <select
                value={selectedCategory}
                onChange={(event) => handleCategoryChange(event.target.value)}
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="">All Categories</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>

                  <TableHead>Variants</TableHead>

                  <TableHead>Status</TableHead>

                  <TableHead className="hidden md:table-cell">
                    Created
                  </TableHead>

                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Package className="size-8 text-muted-foreground/50" />

                        <div>
                          <p className="font-medium">No products found</p>

                          <p className="text-sm text-muted-foreground">
                            Try changing your search or filters.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow
                      key={product.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/admin/products/${product.id}`)}
                    >
                      {/* Product */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                            {product.firstImage?.mediaUrl ? (
                              <img
                                src={product.firstImage.mediaUrl}
                                alt={product.name}
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center">
                                <Package className="size-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {product.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {product.id.slice(0, 8)}
                              ...
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Variants */}
                      <TableCell>
                        <Badge variant="secondary">
                          {product.variantCount}{" "}
                          {product.variantCount === 1 ? "Variant" : "Variants"}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant={product.isActive ? "default" : "secondary"}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {new Date(product.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/admin/products/${product.id}`)
                              }
                            >
                              <Pencil className="mr-2 size-4" />
                              View / Edit
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(product)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 0 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page <strong className="text-foreground">{meta.page}</strong> of{" "}
                <strong className="text-foreground">{meta.totalPages}</strong>
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages || isFetching}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>

            <AlertDialogDescription>
              You are about to delete{" "}
              <strong className="text-foreground">{deleteTarget?.name}</strong>.
              <span className="mt-3 block">
                This will also remove its variants, images and category
                associations.
              </span>
              <span className="mt-2 block">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              disabled={deleteProduct.isPending}
              onClick={handleDelete}
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

export default Products;
