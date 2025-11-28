"use client";

import { ShoppingBag } from "lucide-react";

interface ProductListEmptyProps {
  title?: string;
  description?: string;
  showIcon?: boolean;
}

const ProductListEmpty = ({
  title = "No Products Available",
  description = "We couldn't find any products matching your criteria. Try adjusting your filters or search terms.",
  showIcon = true,
}: ProductListEmptyProps) => {
  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center text-center">
        {showIcon && (
          <div className="mb-6 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/10 rounded-full blur-xl" />
              <div className="relative bg-linear-to-br from-accent/20 to-accent/5 rounded-full p-6">
                <ShoppingBag className="w-12 h-12 text-accent" />
              </div>
            </div>
          </div>
        )}

        <h3 className="text-xl sm:text-2xl font-light tracking-tight text-foreground mb-3">
          {title}
        </h3>

        <p className="text-sm sm:text-base text-muted-foreground max-w-sm mb-8 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default ProductListEmpty;
