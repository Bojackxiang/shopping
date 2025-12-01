"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { ProductWithVariants } from "@/types/prisma";
import { linkToProductDetail } from "@/utils";

interface ProductListDisplayProps {
  products: ProductWithVariants[];
}

const ProductListDisplay = ({ products }: ProductListDisplayProps) => {
  return (
    <div className="space-y-4">
      {products.map((product) => {
        const { variants } = product;
        const defaultVariant = variants.find((item) => item.isDefault === true);
        const price = defaultVariant?.price || 0;
        const comparePrice = defaultVariant?.compareAtPrice || 0;
        return (
          <Link
            key={product.id}
            href={linkToProductDetail(product.id)}
            className="flex items-center space-x-4 p-4 bg-card border border-border rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="relative w-20 h-20 overflow-hidden rounded-lg bg-secondary shrink-0">
              <img
                src={product.thumbnail || "placeholder.jpg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {/* {product.sale && (
                <div className="absolute top-1 left-1 bg-accent text-accent-foreground px-1 py-0.5 rounded text-xs font-medium">
                  Sale
                </div>
              )} */}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-light text-foreground leading-tight truncate">
                {product.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-accent font-medium">{price}</span>
                {comparePrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {comparePrice}
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-2 shrink-0">
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <Heart className="w-4 h-4 text-foreground" />
              </button>
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <ShoppingCart className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ProductListDisplay;
