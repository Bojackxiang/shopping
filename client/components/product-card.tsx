"use client";

import { Heart } from "lucide-react";
import { prismaType } from "@/types";
import { useRouter } from "next/navigation";
import { linkToProductDetail } from "@/utils";
import Image from "next/image";
import { useToggleFavorite, useCheckIsFavorite } from "@/hooks/use-favourite";

interface ProductCardProps {
  product: prismaType.ProductWithVariants;
}

function formatPrice(price: unknown): string {
  if (
    typeof price === "object" &&
    price !== null &&
    "toNumber" in price &&
    typeof (price as { toNumber?: unknown }).toNumber === "function"
  ) {
    return (price as { toNumber: () => number }).toNumber().toFixed(2);
  }
  if (typeof price === "object" && price !== null) {
    return String(price);
  }
  return Number(price).toFixed(2);
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const { isFavorite, mutate: refreshIsFavorite } = useCheckIsFavorite(product.id);
  const { toggleFavorite, isLoading: toggling } = useToggleFavorite();

  // 找到 isDefault 为 true 的 variant，如果没有则取第一个
  const defaultVariant =
    product.variants?.find((v) => v.isDefault) || product.variants?.[0];
  const price = defaultVariant?.price;

  const goToProductDetailPage = () => {
    router.push(linkToProductDetail(product.id));
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
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
      /* toast already shown by hook */
    }
  };

  return (
    <div className="group cursor-pointer relative" onClick={goToProductDetailPage}>
      <div className="relative w-full aspect-square overflow-hidden rounded-md">
        <Image
          src={product.thumbnail || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <button
        onClick={handleToggleFavorite}
        disabled={toggling}
        className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-60"
      >
        <Heart
          className={`w-5 h-5 ${
            isFavorite ? "fill-accent text-accent" : "text-foreground"
          }`}
        />
      </button>

      <h3 className="text-lg font-light text-foreground text-balance">
        {product.name}
      </h3>
      {price !== undefined && (
        <p className="text-accent font-light mt-2">${formatPrice(price)}</p>
      )}
    </div>
  );
}
