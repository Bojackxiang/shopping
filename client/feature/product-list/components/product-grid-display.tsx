"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { products } from "@prisma/client";
import { ProductWithVariants } from "@/types/prisma";
import { linkToProductDetail } from "@/utils";

interface ProductGridDisplayProps {
  products: ProductWithVariants[];
}

const ProductGridDisplay = ({ products }: ProductGridDisplayProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const { variants } = product;
        const defaultVariant = variants.find((item) => item.isDefault === true);
        const price = defaultVariant?.price || 0;
        const comparePrice = defaultVariant?.compareAtPrice;

        return (
          <Link
            key={product.id}
            href={linkToProductDetail(product.id)}
            className="group cursor-pointer"
          >
            <div className="relative mb-4 overflow-hidden rounded-xl bg-secondary aspect-square">
              <img
                src={product.thumbnail || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* {product.sale && (
              <div className="absolute top-3 left-3 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
                Sale
              </div>
            )} */}
              <div className="absolute top-3 right-3 flex space-x-2">
                <button className="p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform">
                  <Heart className="w-4 h-4 text-foreground" />
                </button>
                <button className="p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform">
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
                    $11{comparePrice}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ProductGridDisplay;
