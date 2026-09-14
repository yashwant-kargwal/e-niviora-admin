import { useEffect, useRef, useState } from "react";

import {
  ImagePlus,
  Save,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Upload,
  WandSparkles,
} from "lucide-react";

import { useProducts } from "@/hooks/useProducts";
import { useDefaultSetting, useUpdateSetting } from "@/hooks/useSettings";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const defaultForm = {
  cGst: 0,
  sGst: 0,
  freeDeliveryUplon: 0,
  minimumOrderAmount: 0,
  defaultDeliveryCharge: 0,
  heading: "",
  description: "",
  productId: "",
  image: "",
};

export default function Setting() {
  const { data, isLoading } = useDefaultSetting();
  const updateSetting = useUpdateSetting();
  const [form, setForm] = useState(defaultForm);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: productsData } = useProducts({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const products = productsData?.data ?? [];

  useEffect(() => {
    if (!data) {
      return;
    }

    const nextForm = {
      cGst: Number(data.cGst ?? 0),
      sGst: Number(data.sGst ?? 0),
      freeDeliveryUplon: Number(data.freeDeliveryUplon ?? 0),
      minimumOrderAmount: Number(data.minimumOrderAmount ?? 0),
      defaultDeliveryCharge: Number(data.defaultDeliveryCharge ?? 0),
      heading: data.heading ?? "",
      description: data.description ?? "",
      productId: data.productId ?? "",
      image: data.image ?? "",
    };

    setForm(nextForm);
    setImagePreviewUrl(data.image ?? "");
  }, [data]);

  const updateField = (field: keyof typeof defaultForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: typeof current[field] === "number" ? Number(value || 0) : value,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    setSelectedImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    await updateSetting.mutateAsync({
      cGst: Number(form.cGst),
      sGst: Number(form.sGst),
      freeDeliveryUplon: Number(form.freeDeliveryUplon),
      minimumOrderAmount: Number(form.minimumOrderAmount),
      defaultDeliveryCharge: Number(form.defaultDeliveryCharge),
      heading: form.heading.trim() || undefined,
      description: form.description.trim() || undefined,
      productId: form.productId || undefined,
      image: selectedImageFile ?? (form.image || undefined),
    });
  };

  const selectedProduct = products.find(
    (product) => product.id === form.productId,
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-44 animate-pulse rounded bg-muted" />
        <Card>
          <CardContent className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded bg-muted"
              />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Store configuration
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>

        <Button onClick={handleSave} disabled={updateSetting.isPending}>
          <Save className="mr-2 size-4" />
          {updateSetting.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            Tax & pricing rules
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cgst">CGST (%)</Label>
              <Input
                id="cgst"
                type="number"
                min="0"
                step="0.01"
                value={form.cGst}
                onChange={(event) => updateField("cGst", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sgst">SGST (%)</Label>
              <Input
                id="sgst"
                type="number"
                min="0"
                step="0.01"
                value={form.sGst}
                onChange={(event) => updateField("sGst", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum-order">Minimum order amount</Label>
              <Input
                id="minimum-order"
                type="number"
                min="0"
                step="0.01"
                value={form.minimumOrderAmount}
                onChange={(event) =>
                  updateField("minimumOrderAmount", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="free-delivery">Free delivery upon</Label>
              <Input
                id="free-delivery"
                type="number"
                min="0"
                step="0.01"
                value={form.freeDeliveryUplon}
                onChange={(event) =>
                  updateField("freeDeliveryUplon", event.target.value)
                }
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Truck className="size-4" />
              Delivery
            </div>

            <div className="max-w-md space-y-2">
              <Label htmlFor="default-delivery-charge">
                Default delivery charge
              </Label>
              <Input
                id="default-delivery-charge"
                type="number"
                min="0"
                step="0.01"
                value={form.defaultDeliveryCharge}
                onChange={(event) =>
                  updateField("defaultDeliveryCharge", event.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WandSparkles className="size-5" />
            Welcome section
          </CardTitle>
          <CardDescription>
            Configure the home page hero content and its quick action product
            link.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="welcome-heading">Heading</Label>
                <Input
                  id="welcome-heading"
                  value={form.heading}
                  onChange={(event) =>
                    updateField("heading", event.target.value)
                  }
                  placeholder="Welcome to E-NIVIORA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcome-description">Description</Label>
                <Textarea
                  id="welcome-description"
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  rows={5}
                  placeholder="Shop premium car care products with faster delivery and trusted quality."
                />
              </div>

              <div className="space-y-2">
                <Label>Quick action product</Label>
                <div className="flex items-center gap-3">
                  <Input
                    readOnly
                    value={
                      selectedProduct
                        ? selectedProduct.name
                        : "No product selected"
                    }
                    placeholder="Select a product"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsProductDialogOpen(true)}
                  >
                    <ShoppingBag className="mr-2 size-4" />
                    Select
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Hero image</Label>
              <div className="overflow-hidden rounded-xl border bg-muted/30">
                {imagePreviewUrl ? (
                  <img
                    src={imagePreviewUrl}
                    alt="Welcome section preview"
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-sm text-muted-foreground">
                    No image selected
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 size-4" />
                {selectedImageFile ? "Change image" : "Upload image"}
              </Button>
              {selectedImageFile && (
                <p className="text-xs text-muted-foreground">
                  {selectedImageFile.name}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select product</DialogTitle>
            <DialogDescription>
              Choose the product that the welcome button should open.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[480px] space-y-3 overflow-y-auto">
            {products.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No products available.
              </div>
            ) : (
              products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    updateField("productId", product.id);
                    setIsProductDialogOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-4 rounded-lg border p-3 text-left transition-colors ${
                    form.productId === product.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center overflow-hidden rounded-md border bg-muted">
                      {product.firstImage?.mediaUrl ? (
                        <img
                          src={product.firstImage.mediaUrl}
                          alt={product.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <ImagePlus className="size-5 text-muted-foreground" />
                      )}
                    </div>

                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.variantCount} variants
                      </p>
                    </div>
                  </div>

                  {form.productId === product.id && (
                    <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                      Selected
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProductDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
