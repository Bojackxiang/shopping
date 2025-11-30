"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Star,
  Minus,
  Plus,
  Shield,
  Truck,
  RefreshCw,
  Gift,
} from "lucide-react";
import Header from "../component/header";
import Gallery from "../component/gallery";
import ProductMetadata from "../component/product-metadata";
import useProduceData from "../hooks/use-product-data";
import useGallery from "../hooks/use-gallery";
import ProductNotFound from "../component/product-not-found";
import ProductLoading from "../component/product-loading";
import { cn } from "@/lib/utils";
import { product_variants } from "@prisma/client";
import { handleNullOrUndefinedValue } from "../../../utils/handle-null-value";
import { handleDecimal, handleEmptyArray } from "@/utils";

interface Product {
  id: number;
  name: string;
  price: string;
  originalPrice?: string;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  features: string[];
  materials: string;
  care: string;
  inStock: boolean;
  stockCount: number;
  sale: boolean;
  salePercentage?: number;
}

interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

interface ProductDetailViewProps {
  productId: string;
  reviews: Review[];
}

const ProductDetailView = ({ productId, reviews }: ProductDetailViewProps) => {
  // =================================
  // state
  // =================================
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [selectedVariant, setSelectedVariant] =
    useState<product_variants | null>(null);

  // =================================
  // hooks
  // =================================
  const { data, isLoading, error } = useProduceData(productId);
  const {
    selectedImage,
    setSelectedImage,
    nextImage,
    prevImage,
    showZoom,
    setShowZoom,
  } = useGallery(data?.product_images?.length || 1);

  // =================================
  // handlers
  // =================================
  const handleQuantityChange = (change: number) => {
    // setQuantity(Math.max(1, Math.min(product.stockCount, quantity + change)));
  };

  const handleVariantSelect = (id: string) => {
    setSelectedVariantId(id);
    const selectedVariant = variants.filter((item) => item.id === id)[0];
    setSelectedVariant(selectedVariant);
  };

  // =================================
  // derived values
  // =================================
  const variants = handleEmptyArray(data?.variants) || [];

  // =================================
  // effects
  // =================================
  useEffect(() => {
    // set default variant
    if (variants.length > 0) {
      const defaultVariant = variants.filter((item) => item.isDefault)[0];
      const defaultVariantId = defaultVariant.id;
      setSelectedVariantId(defaultVariantId);
      setSelectedVariant(defaultVariant);
    }
  }, [variants]);

  // =================================
  // component management
  // =================================
  //  when loading is finished, and has error or not found
  if (isLoading) {
    return <ProductLoading />;
  }

  //  when loading is finished, and has error or not found
  if ((!data || error) && !isLoading) {
    return <ProductNotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        productName={handleNullOrUndefinedValue(data?.name)}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite(!isFavorite)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Gallery */}
          <Gallery
            images={handleEmptyArray(data?.product_images)}
            productName={handleNullOrUndefinedValue(data?.name)}
            // sale={product.sale}
            sale={true}
            // salePercentage={product.salePercentage}
            salePercentage={10}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
            onNextImage={nextImage}
            onPrevImage={prevImage}
            onZoom={() => setShowZoom(true)}
          />

          {/* Product Information */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-muted-foreground">
                  {data?.categories[0].category.name}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  {/* <span className="text-sm font-medium">{product.rating}</span> */}
                  <span className="text-sm font-medium">{4.6}</span>
                  <span className="text-sm text-muted-foreground">
                    (20 reviews)
                    {/* ({product.reviewCount} reviews) */}
                  </span>
                </div>
              </div>
              <h1 className="text-3xl font-light tracking-tight text-foreground mb-4">
                {handleNullOrUndefinedValue(data?.name)}
              </h1>

              <div className="flex items-center space-x-3 mb-6">
                <span className="text-2xl font-medium text-accent">
                  ${handleDecimal(selectedVariant?.price)}
                </span>
                {(selectedVariant?.compareAtPrice || 0) && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${handleDecimal(selectedVariant?.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Size</h3>
              <div className="flex space-x-2">
                {variants.map((variant) => (
                  <button
                    onClick={() => {
                      handleVariantSelect(variant.id);
                    }}
                    className={cn(
                      "px-4 py-2 border rounded-lg text-sm font-medium transition-colors",
                      selectedVariantId === variant.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background text-foreground hover:bg-secondary"
                    )}
                    key={variant.id}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Quantity
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-input rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="p-2 hover:bg-secondary transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-2 hover:bg-secondary transition-colors"
                      // disabled={quantity >= product.stockCount}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {/* {product.stockCount} in stock */}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
                <button className="px-6 py-3 border border-input rounded-lg font-medium hover:bg-secondary transition-colors">
                  <Gift className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-card border border-border rounded-lg">
                <Shield className="w-5 h-5 text-accent" />
                <div>
                  <div className="text-sm font-medium">Authentic</div>
                  <div className="text-xs text-muted-foreground">
                    Genuine materials
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-card border border-border rounded-lg">
                <Truck className="w-5 h-5 text-accent" />
                <div>
                  <div className="text-sm font-medium">Free Shipping</div>
                  <div className="text-xs text-muted-foreground">
                    Orders over $50
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-card border border-border rounded-lg">
                <RefreshCw className="w-5 h-5 text-accent" />
                <div>
                  <div className="text-sm font-medium">30-Day Return</div>
                  <div className="text-xs text-muted-foreground">
                    Easy returns
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        {/* <ProductMetadata
          product={product}
          reviews={reviews}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        /> */}

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-light tracking-tight text-foreground mb-8">
            You might also like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Add related products here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;
