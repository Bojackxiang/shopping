"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  Heart,
  ShoppingBag,
  Tag,
  CreditCard,
  Truck,
  Shield,
  Gift,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { linkToProductDetail } from "@/utils/link-to-product-detail";

// Sample cart data
interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  size: string;
  inStock: boolean;
}

const initialCartItems: CartItem[] = [
  {
    id: 1,
    name: "Classic White Pearl Beaded Bracelet",
    price: 89.99,
    originalPrice: 120.0,
    image: "/classic-white-pearl-beaded-bracelet.jpg",
    quantity: 2,
    size: "One Size",
    inStock: true,
  },
  {
    id: 2,
    name: "Amethyst Crystal Beaded Bracelet",
    price: 75.99,
    image: "/amethyst-crystal-beaded-bracelet.jpg",
    quantity: 1,
    size: "One Size",
    inStock: true,
  },
  {
    id: 3,
    name: "Golden Pearl Luxury Bracelet",
    price: 149.99,
    image: "/golden-pearl-beaded-bracelet-luxury.jpg",
    quantity: 1,
    size: "One Size",
    inStock: false,
  },
];

export default function ShoppingCartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const moveToWishlist = (id: number) => {
    // In a real app, this would add to wishlist API
    removeItem(id);
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "pearl10") {
      setAppliedPromo("PEARL10");
      setPromoCode("");
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = appliedPromo === "PEARL10" ? subtotal * 0.1 : 0;
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;

  const outOfStockItems = cartItems.filter((item) => !item.inStock);
  const availableItems = cartItems.filter((item) => item.inStock);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/products"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Continue Shopping
            </Link>
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-foreground" />
              <span className="text-sm font-medium text-foreground">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          // Empty Cart State
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-light text-foreground mb-4">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Discover our beautiful collection of pearl and crystal bracelets
              to add some elegance to your style.
            </p>
            <Link href="/products">
              <Button size="lg" className="px-8">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
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
                          <p className="text-sm text-muted-foreground">
                            {item.size}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => moveToWishlist(item.id)}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors"
                            title="Move to wishlist"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
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
                      <div className="relative w-24 h-24 overflow-hidden rounded-lg bg-secondary shrink-0">
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
                                updateQuantity(item.id, item.quantity - 1)
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
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="p-2 hover:bg-secondary transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => moveToWishlist(item.id)}
                              className="p-2 hover:bg-secondary rounded-lg transition-colors"
                              title="Move to wishlist"
                            >
                              <Heart className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
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

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Promo Code */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-medium text-foreground mb-4 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Promo Code
                </h3>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <span className="text-sm font-medium text-accent">
                      {appliedPromo} Applied
                    </span>
                    <button
                      onClick={() => setAppliedPromo(null)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-sm"
                    />
                    <Button
                      onClick={applyPromoCode}
                      variant="outline"
                      size="sm"
                      disabled={!promoCode.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Try "PEARL10" for 10% off your first order
                </p>
              </div>

              {/* Order Summary */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-medium text-foreground mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-accent">
                        -${discount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-foreground">${tax.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="font-medium text-foreground text-lg">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                {shipping === 0 && (
                  <div className="flex items-center space-x-2 mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <Truck className="w-4 h-4 text-accent" />
                    <span className="text-sm text-accent font-medium">
                      Free shipping included!
                    </span>
                  </div>
                )}

                {/* Checkout Button */}
                <div className="mt-6 space-y-3">
                  <Link href="/checkout/success">
                    <Button
                      size="lg"
                      className="w-full"
                      disabled={availableItems.length === 0}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                    <Shield className="w-3 h-3" />
                    <span>Secure checkout with SSL encryption</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-3 p-3 bg-card border border-border rounded-lg">
                  <Truck className="w-5 h-5 text-accent" />
                  <div>
                    <div className="text-sm font-medium">Free Shipping</div>
                    <div className="text-xs text-muted-foreground">
                      On orders over $50
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-card border border-border rounded-lg">
                  <Shield className="w-5 h-5 text-accent" />
                  <div>
                    <div className="text-sm font-medium">30-Day Returns</div>
                    <div className="text-xs text-muted-foreground">
                      Easy returns policy
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-card border border-border rounded-lg">
                  <Gift className="w-5 h-5 text-accent" />
                  <div>
                    <div className="text-sm font-medium">Gift Wrapping</div>
                    <div className="text-xs text-muted-foreground">
                      Available at checkout
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
