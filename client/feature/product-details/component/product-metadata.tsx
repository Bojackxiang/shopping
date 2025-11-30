"use client";

import { Star, MessageCircle } from "lucide-react";

interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

interface Product {
  description: string;
  features: string[];
  materials: string;
  care: string;
  reviewCount: number;
}

interface ProductMetadataProps {
  product: Product;
  reviews: Review[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const ProductMetadata = ({
  product,
  reviews,
  activeTab,
  onTabChange,
}: ProductMetadataProps) => {
  return (
    <div className="mt-16">
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {[
            { id: "description", name: "Description" },
            { id: "features", name: "Features" },
            { id: "care", name: "Care Instructions" },
            { id: "reviews", name: `Reviews (${product.reviewCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="py-8">
        {activeTab === "description" && (
          <div className="prose prose-gray max-w-none">
            <p className="text-foreground leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {activeTab === "features" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">
              Product Features
            </h3>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2">
              <h4 className="font-medium text-foreground">Materials</h4>
              <p className="text-muted-foreground">{product.materials}</p>
            </div>
          </div>
        )}

        {activeTab === "care" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">
              Care Instructions
            </h3>
            <p className="text-foreground leading-relaxed">{product.care}</p>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">
                Customer Reviews
              </h3>
              <button className="flex items-center space-x-2 text-accent hover:text-accent/80 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">Write a review</span>
              </button>
            </div>

            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-foreground">
                          {review.name}
                        </span>
                        {review.verified && (
                          <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "fill-accent text-accent"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {review.date}
                    </span>
                  </div>
                  <p className="text-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductMetadata;
