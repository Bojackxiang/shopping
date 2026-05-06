"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductWithVariants } from "@/types/prisma";
import useCart from "@/feature/product-details/hooks/use-cart";
import { handleDecimal } from "@/utils";

interface AddToCartModalProps {
  product: ProductWithVariants;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToCartModal({ product, open, onOpenChange }: AddToCartModalProps) {
  const { variants } = product;
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!open) return;
    const defaultVariant =
      variants.find((v) => v.isDefault && (v.inventory ?? 0) > 0) ??
      variants.find((v) => (v.inventory ?? 0) > 0) ??
      variants[0];
    setSelectedVariantId(defaultVariant?.id ?? "");
    setQuantity(1);
  }, [open, variants]);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const stock = selectedVariant?.inventory ?? 0;
  const canAdd = !!selectedVariant && stock > 0 && quantity > 0 && quantity <= stock;

  const handleAdd = async () => {
    if (!selectedVariant || !canAdd || submitting) return;
    setSubmitting(true);
    try {
      await addToCart({
        productName: product.name,
        variantId: selectedVariant.id,
        quantity,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-light">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {selectedVariant && (
            <div>
              <span className="text-2xl font-medium text-accent">
                ${handleDecimal(selectedVariant.price)}
              </span>
            </div>
          )}

          {variants.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Variant</h3>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => {
                  const isOutOfStock = (variant.inventory ?? 0) <= 0;
                  const isSelected = selectedVariantId === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      disabled={isOutOfStock}
                      className={cn(
                        "px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors",
                        isOutOfStock
                          ? "border-muted bg-muted text-muted-foreground cursor-not-allowed"
                          : isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background text-foreground hover:bg-secondary",
                      )}
                    >
                      {variant.name ?? "Default"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium mb-2">
              Quantity
              <span className="text-xs text-muted-foreground font-normal ml-2">
                ({stock} in stock)
              </span>
            </h3>
            <div
              className={cn(
                "inline-flex items-center border rounded-lg",
                stock <= 0 ? "border-muted bg-muted/50" : "border-input",
              )}
            >
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={stock <= 0 || quantity <= 1}
                className="p-2 hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                {stock <= 0 ? 0 : quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                disabled={stock <= 0 || quantity >= stock}
                className="p-2 hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!canAdd || submitting}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            {submitting ? "Adding..." : stock > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
