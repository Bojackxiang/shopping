"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { ProductWithVariants } from "@/types/prisma";
import { linkToProductDetail } from "@/utils";
import { cn } from "@/lib/utils";
import { useToggleFavorite, useCheckIsFavorite } from "@/hooks/use-favourite";
import { AddToCartModal } from "./add-to-cart-modal";

interface ProductGridDisplayProps {
  products: ProductWithVariants[];
}

const ProductGridDisplay = ({ products }: ProductGridDisplayProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductGridCard key={product.id} product={product} />
      ))}
    </div>
  );
};

function ProductGridCard({ product }: { product: ProductWithVariants }) {
  const { variants } = product;
  const defaultVariant = variants.find((item) => item.isDefault === true);
  const price = defaultVariant?.price || 0;
  const comparePrice = defaultVariant?.compareAtPrice;
  const totalInventory = variants.reduce((sum, v) => sum + (v.inventory ?? 0), 0);
  const isOutOfStock = totalInventory <= 0;

  const [cartOpen, setCartOpen] = useState(false);
  const { isFavorite, mutate: refreshIsFavorite } = useCheckIsFavorite(product.id);
  const { toggleFavorite, isLoading: toggling } = useToggleFavorite();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggling) return;
    try {
      await toggleFavorite(product.id, {
        productName: product.name,
        productSlug: product.slug,
        productImage: product.thumbnail ?? undefined,
        variantId: defaultVariant?.id,
        variantName: defaultVariant?.name ?? undefined,
      });
      refreshIsFavorite();
    } catch {
      /* toast already shown */
    }
  };

  const openCartModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setCartOpen(true);
  };

  return (
    <>
      <Link
        href={linkToProductDetail(product.id)}
        className="group cursor-pointer"
      >
        <div className="relative mb-4 overflow-hidden rounded-xl bg-secondary aspect-square">
          <img
            src={product.thumbnail || "/placeholder.jpg"}
            alt={product.name}
            className={cn(
              "w-full h-full object-cover transition-transform duration-300",
              isOutOfStock ? "grayscale" : "group-hover:scale-105"
            )}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="text-white font-medium text-lg px-4 py-2 bg-black/60 rounded-lg">
                Out of Stock
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3 flex space-x-2">
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={toggling}
              className="p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-60"
            >
              <Heart
                className={cn(
                  "w-4 h-4",
                  isFavorite ? "fill-accent text-accent" : "text-foreground",
                )}
              />
            </button>
            <button
              type="button"
              onClick={openCartModal}
              disabled={isOutOfStock}
              className="p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="font-light text-foreground leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-accent font-medium">${price}</span>
            {comparePrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${comparePrice}
              </span>
            )}
          </div>
        </div>
      </Link>

      <AddToCartModal product={product} open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}

export default ProductGridDisplay;
