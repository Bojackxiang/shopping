import React from "react";

const ProductLoading = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Loading */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 bg-secondary rounded-lg animate-pulse"></div>
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-secondary rounded-lg animate-pulse"></div>
              <div className="h-10 w-10 bg-secondary rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery Loading */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/50 to-secondary/30 animate-shimmer"></div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex space-x-2 overflow-x-auto">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-secondary animate-pulse"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/50 to-secondary/30 animate-shimmer"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Information Loading */}
          <div className="space-y-6">
            {/* Category & Rating */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-4 w-20 bg-secondary rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-secondary rounded animate-pulse"></div>
              </div>

              {/* Title */}
              <div className="space-y-2 mb-4">
                <div className="h-8 w-full bg-secondary rounded-lg animate-pulse"></div>
                <div className="h-8 w-4/5 bg-secondary rounded-lg animate-pulse"></div>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-8 w-24 bg-secondary rounded-lg animate-pulse"></div>
                <div className="h-6 w-20 bg-secondary rounded animate-pulse"></div>
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="h-5 w-12 bg-secondary rounded mb-3 animate-pulse"></div>
              <div className="h-10 w-24 bg-secondary rounded-lg animate-pulse"></div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div>
                <div className="h-5 w-20 bg-secondary rounded mb-3 animate-pulse"></div>
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-32 bg-secondary rounded-lg animate-pulse"></div>
                  <div className="h-4 w-32 bg-secondary rounded animate-pulse"></div>
                </div>
              </div>

              <div className="flex space-x-3">
                <div className="flex-1 h-12 bg-secondary rounded-lg animate-pulse"></div>
                <div className="h-12 w-16 bg-secondary rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="p-3 bg-secondary rounded-lg animate-pulse"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-5 w-5 bg-secondary/70 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 w-20 bg-secondary/70 rounded mb-2 animate-pulse"></div>
                      <div className="h-3 w-16 bg-secondary/70 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details Tabs Loading */}
        <div className="mt-16">
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-6 w-24 bg-secondary rounded animate-pulse"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                  }}
                ></div>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {/* Tab content loading */}
            <div className="space-y-4">
              <div className="h-6 w-32 bg-secondary rounded-lg animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 w-full bg-secondary rounded animate-pulse"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                    }}
                  ></div>
                ))}
              </div>

              <div className="pt-4 space-y-3">
                <div className="h-4 w-24 bg-secondary rounded animate-pulse"></div>
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 w-full bg-secondary rounded animate-pulse"
                    style={{
                      animationDelay: `${(i + 3) * 0.1}s`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Loading */}
        <div className="mt-16">
          <div className="h-7 w-40 bg-secondary rounded-lg mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="space-y-3"
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div className="aspect-square w-full bg-secondary rounded-lg animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/50 to-secondary/30 animate-shimmer"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-secondary rounded animate-pulse"></div>
                  <div className="h-4 w-4/5 bg-secondary rounded animate-pulse"></div>
                  <div className="h-5 w-24 bg-secondary rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shimmer animation styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ProductLoading;
