import { useState } from "react";

import {
  MoreHorizontal,
  Plus,
  Search,
  Pencil,
  Trash2,
  FolderTree,
  Package,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useToggleCategoryStatus,
  useDeleteCategory,
} from "@/hooks/useCategories";

import type { Category } from "@/types/category";

const Categories = () => {
  // --------------------------------------------------
  // Pagination / Search
  // --------------------------------------------------

  const [page, setPage] = useState(1);

  const limit = 10;

  const [search, setSearch] = useState("");

  // --------------------------------------------------
  // Dialog state
  // --------------------------------------------------

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [deleteCategoryTarget, setDeleteCategoryTarget] =
    useState<Category | null>(null);

  // --------------------------------------------------
  // Form state
  // --------------------------------------------------

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // --------------------------------------------------
  // Queries
  // --------------------------------------------------

  const { data, isLoading, isFetching, isError, refetch } = useCategories({
    page,
    limit,
    search: search.trim() || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // --------------------------------------------------
  // Mutations
  // --------------------------------------------------

  const createCategory = useCreateCategory();

  const updateCategory = useUpdateCategory();

  const toggleCategoryStatus = useToggleCategoryStatus();

  const deleteCategory = useDeleteCategory();

  // --------------------------------------------------
  // API data
  // --------------------------------------------------

  const categories = data?.data ?? [];

  const meta = data?.meta;

  // --------------------------------------------------
  // Open Add Modal
  // --------------------------------------------------

  const openAddModal = () => {
    setEditingCategory(null);

    setFormData({
      name: "",
      description: "",
    });

    setIsFormOpen(true);
  };

  // --------------------------------------------------
  // Open Edit Modal
  // --------------------------------------------------

  const openEditModal = (category: Category) => {
    setEditingCategory(category);

    setFormData({
      name: category.name,
      description: category.description ?? "",
    });

    setIsFormOpen(true);
  };

  // --------------------------------------------------
  // Close Form Modal
  // --------------------------------------------------

  const closeFormModal = () => {
    if (createCategory.isPending || updateCategory.isPending) {
      return;
    }

    setIsFormOpen(false);

    setEditingCategory(null);

    setFormData({
      name: "",
      description: "",
    });
  };

  // --------------------------------------------------
  // Create / Update Category
  // --------------------------------------------------

  const handleSubmit = async () => {
    const name = formData.name.trim();

    const description = formData.description.trim();

    if (!name) {
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,

          payload: {
            name,
            description: description || undefined,
          },
        });
      } else {
        await createCategory.mutateAsync({
          name,
          description: description || undefined,
        });
      }

      closeFormModal();
    } catch (error) {
      console.error("Category save failed:", error);
    }
  };

  // --------------------------------------------------
  // Toggle Status
  // --------------------------------------------------

  const handleToggleStatus = async (category: Category) => {
    try {
      await toggleCategoryStatus.mutateAsync(category.id);
    } catch (error) {
      console.error("Category status update failed:", error);
    }
  };

  // --------------------------------------------------
  // Delete Category
  // --------------------------------------------------

  const handleDelete = async () => {
    if (!deleteCategoryTarget) {
      return;
    }

    try {
      await deleteCategory.mutateAsync(deleteCategoryTarget.id);

      setDeleteCategoryTarget(null);

      /*
       * If the last item on the current page
       * was deleted, go to previous page.
       */
      if (categories.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (error) {
      console.error("Category deletion failed:", error);
    }
  };

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const handleSearchChange = (value: string) => {
    setSearch(value);

    /*
     * Whenever search changes,
     * start from first page.
     */
    if (page !== 1) {
      setPage(1);
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FolderTree className="size-6" />

              <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage product categories for your store.
            </p>
          </div>
        </div>

        {/* Loading Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Card key={item}>
              <CardContent className="p-5">
                <div className="h-16 animate-pulse rounded-lg bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading Table */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-md bg-muted"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (isError) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-6 text-destructive" />
            </div>

            <div>
              <h2 className="font-semibold">Failed to load categories</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Something went wrong while fetching categories.
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

  // --------------------------------------------------
  // Calculated summary
  // --------------------------------------------------

  /*
   * IMPORTANT:
   *
   * These are calculated from the CURRENT PAGE,
   * not the entire database.
   *
   * If you want exact total active categories
   * across all pages, backend should provide those
   * numbers separately.
   */

  const activeCategories = categories.filter(
    (category) => category.isActive,
  ).length;

  const productsAssigned = categories.reduce(
    (total, category) => total + category.productCount,
    0,
  );

  return (
    <div className="space-y-6">
      {/* ================================================== */}
      {/* PAGE HEADER */}
      {/* ================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="size-6" />

            <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage product categories for your store.
          </p>
        </div>

        <Button onClick={openAddModal}>
          <Plus className="mr-2 size-4" />
          Add Category
        </Button>
      </div>

      {/* ================================================== */}
      {/* SUMMARY CARDS */}
      {/* ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
              <FolderTree className="size-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Categories</p>

              <p className="text-2xl font-bold">{meta?.total ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Active */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-green-500/10">
              <FolderTree className="size-5 text-green-600" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Active on Page</p>

              <p className="text-2xl font-bold">{activeCategories}</p>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-orange-500/10">
              <Package className="size-5 text-orange-600" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Products on Page</p>

              <p className="text-2xl font-bold">{productsAssigned}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================================================== */}
      {/* CATEGORY TABLE */}
      {/* ================================================== */}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>All Categories</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {meta?.total ?? 0} categories found
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search categories..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Table */}
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>

                  <TableHead className="hidden md:table-cell">
                    Description
                  </TableHead>

                  <TableHead>Products</TableHead>

                  <TableHead>Status</TableHead>

                  <TableHead className="hidden lg:table-cell">
                    Created
                  </TableHead>

                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                          <FolderTree className="size-6 text-muted-foreground" />
                        </div>

                        <div>
                          <p className="font-medium">No categories found</p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {search
                              ? "Try a different search term."
                              : "Create your first category to get started."}
                          </p>
                        </div>

                        {!search && (
                          <Button size="sm" onClick={openAddModal}>
                            <Plus className="mr-2 size-4" />
                            Add Category
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      {/* Category */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                            <FolderTree className="size-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {category.name}
                            </p>

                            <p className="text-xs text-muted-foreground md:hidden">
                              {category.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Description */}
                      <TableCell className="hidden max-w-md md:table-cell">
                        <p className="truncate text-sm text-muted-foreground">
                          {category.description || "No description"}
                        </p>
                      </TableCell>

                      {/* Products */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="size-4 text-muted-foreground" />

                          <span className="font-medium">
                            {category.productCount}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <button
                          type="button"
                          disabled={toggleCategoryStatus.isPending}
                          onClick={() => handleToggleStatus(category)}
                          title="Toggle status"
                        >
                          <Badge
                            variant={
                              category.isActive ? "default" : "secondary"
                            }
                            className="cursor-pointer"
                          >
                            {category.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </button>
                      </TableCell>

                      {/* Created */}
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {new Date(category.createdAt).toLocaleDateString(
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
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />

                              <span className="sr-only">Open actions</span>
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => openEditModal(category)}
                            >
                              <Pencil className="mr-2 size-4" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteCategoryTarget(category)}
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

          {/* ================================================== */}
          {/* PAGINATION */}
          {/* ================================================== */}

          {meta && meta.totalPages > 0 && (
            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page{" "}
                <span className="font-medium text-foreground">{meta.page}</span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {meta.totalPages}
                </span>
              </p>

              <div className="flex items-center gap-2">
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

          {/* Background fetching indicator */}
          {isFetching && !isLoading && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="size-3 animate-spin" />
              Updating categories...
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================================================== */}
      {/* ADD / EDIT CATEGORY MODAL */}
      {/* ================================================== */}

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeFormModal();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>

            <DialogDescription>
              {editingCategory
                ? "Update the category information below."
                : "Create a new category for your products."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>

              <Input
                id="category-name"
                value={formData.name}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Floor Cleaning"
                disabled={createCategory.isPending || updateCategory.isPending}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>

              <Textarea
                id="category-description"
                value={formData.description}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Describe this category..."
                rows={4}
                disabled={createCategory.isPending || updateCategory.isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeFormModal}
              disabled={createCategory.isPending || updateCategory.isPending}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={
                !formData.name.trim() ||
                createCategory.isPending ||
                updateCategory.isPending
              }
            >
              {createCategory.isPending || updateCategory.isPending ? (
                <>
                  <RefreshCw className="mr-2 size-4 animate-spin" />

                  {editingCategory ? "Saving..." : "Creating..."}
                </>
              ) : editingCategory ? (
                "Save Changes"
              ) : (
                "Create Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================== */}
      {/* DELETE CONFIRMATION */}
      {/* ================================================== */}

      <AlertDialog
        open={!!deleteCategoryTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteCategoryTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-5 text-destructive" />
              </div>
              Delete Category?
            </AlertDialogTitle>

            <AlertDialogDescription className="space-y-3 pt-2">
              {/* Category name */}
              <span className="block">
                You are about to delete{" "}
                <strong className="text-foreground">
                  {deleteCategoryTarget?.name}
                </strong>
                .
              </span>

              {/* Product warning */}
              {deleteCategoryTarget &&
                deleteCategoryTarget.productCount > 0 && (
                  <span className="block rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-700 dark:text-orange-400">
                    <strong>
                      {deleteCategoryTarget.productCount} products
                    </strong>{" "}
                    are currently linked to this category.
                  </span>
                )}

              {/* Uncategorized warning */}
              {deleteCategoryTarget &&
                deleteCategoryTarget.productCount > 0 && (
                  <span className="block">
                    If this is the only category assigned to a product, that
                    product may become{" "}
                    <strong className="text-foreground">uncategorized</strong>{" "}
                    after this category is deleted.
                  </span>
                )}

              {/* Final warning */}
              <span className="block">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCategory.isPending}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteCategory.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCategory.isPending ? (
                <>
                  <RefreshCw className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 size-4" />
                  Delete Category
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Categories;
