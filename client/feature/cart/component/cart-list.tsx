"use client";

import { Minus, Plus, Trash2, Heart, Shield } from "lucide-react";
import Link from "next/link";
import { linkToProductDetail } from "@/utils/link-to-product-detail";

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  size: string;
  inStock: boolean;
  variantId: string;
}

interface CartListProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemoveItem: (id: string) => void;
  onMoveToWishlist: (id: string) => void;
}

export default function CartList({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onMoveToWishlist,
}: CartListProps) {
  const outOfStockItems = cartItems.filter((item) => !item.inStock);
  const availableItems = cartItems.filter((item) => item.inStock);

  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-light tracking-tight text-foreground">
          Shopping Cart
        </h1>
        <span className="text-sm text-muted-foreground">
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Out of Stock Items */}
      {outOfStockItems.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
          <h3 className="font-medium text-destructive mb-4 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Items currently unavailable
          </h3>
          <div className="space-y-4">
            {outOfStockItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 opacity-60"
              >
                <div className="relative w-20 h-20 overflow-hidden rounded-lg bg-secondary shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-light text-foreground truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.size}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onRemoveItem(item.variantId)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Items */}
      <div className="space-y-4">
        {availableItems.map((item) => (
          <div
            key={item.id}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              {/* Product Image */}
              <div className="relative w-36 h-36 overflow-hidden rounded-lg bg-secondary shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {item.originalPrice && (
                  <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
                    Sale
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <Link
                  href={linkToProductDetail(item.id)}
                  className="font-light text-foreground hover:text-accent transition-colors block truncate"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.size}
                </p>

                <div className="flex items-center space-x-2 mt-2">
                  <span className="font-medium text-accent">
                    ${item.price.toFixed(2)}
                  </span>
                  {item.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${item.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-input rounded-lg">
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.variantId, item.quantity - 1)
                      }
                      className="p-2 hover:bg-secondary transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium min-w-12 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.variantId, item.quantity + 1)
                      }
                      className="p-2 hover:bg-secondary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onRemoveItem(item.variantId)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors text-destructive"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
