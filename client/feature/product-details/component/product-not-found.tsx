import Link from "next/link";
import { Search, Home, Package } from "lucide-react";

const ProductNotFound = () => {
  return (
    <div className="min-h-[600px] bg-background flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Decorative elements inspired by jewelry */}
        <div className="relative">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="w-16 h-16 bg-linear-to-br from-accent/20 to-accent/40 rounded-full blur-xl"></div>
          </div>
          <div className="absolute -bottom-4 left-1/4 transform -translate-x-1/2">
            <div className="w-8 h-8 bg-linear-to-br from-primary/10 to-accent/20 rounded-full blur-lg"></div>
          </div>
          <div className="absolute -bottom-6 right-1/4 transform translate-x-1/2">
            <div className="w-12 h-12 bg-linear-to-br from-accent/15 to-primary/20 rounded-full blur-lg"></div>
          </div>

          {/* Main Icon */}
          <div className="relative z-10 flex justify-center mb-8">
            <div className="w-24 h-24 bg-linear-to-br from-secondary/50 to-accent/10 rounded-full flex items-center justify-center border border-border/50">
              <Package
                className="w-12 h-12 text-muted-foreground"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {/* Content section */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-wide">
              Product Not Found
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              We couldn't find the bracelet you're looking for. Like a rare
              pearl, some treasures are elusive. Let us help you discover
              something equally special.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-light transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 transform hover:-translate-y-0.5"
            >
              <Search className="w-5 h-5 mr-2" />
              Browse All Products
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-3 border border-border text-foreground hover:bg-secondary rounded-lg font-light transition-all duration-200 hover:shadow-lg hover:shadow-accent/20 transform hover:-translate-y-0.5"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Suggested actions */}
          <div className="pt-8 border-t border-border/50 mt-8">
            <p className="text-sm text-muted-foreground mb-4">
              You might also be interested in:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/products?category=pearls"
                className="px-4 py-2 bg-secondary/50 border border-border rounded-full text-sm text-foreground hover:bg-secondary transition-colors"
              >
                Pearl Collection
              </Link>
              <Link
                href="/products?category=crystals"
                className="px-4 py-2 bg-secondary/50 border border-border rounded-full text-sm text-foreground hover:bg-secondary transition-colors"
              >
                Crystal Collection
              </Link>
              <Link
                href="/products?filter=new"
                className="px-4 py-2 bg-secondary/50 border border-border rounded-full text-sm text-foreground hover:bg-secondary transition-colors"
              >
                New Arrivals
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 bg-secondary/50 border border-border rounded-full text-sm text-foreground hover:bg-secondary transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom decorative elements */}
        <div className="pt-8 relative">
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-accent/40 rounded-full animate-pulse"></div>
            <div
              className="w-2 h-2 bg-primary/40 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-accent/40 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductNotFound;
