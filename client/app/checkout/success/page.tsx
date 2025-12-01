"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  Package,
  Truck,
  Download,
  Share2,
  Calendar,
  MapPin,
  CreditCard,
  Mail,
  Phone,
  ArrowRight,
  Star,
  Gift,
  Shield,
  Clock,
  Home,
  Receipt,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { linkToProductDetail } from "@/utils";

// Sample order data
interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface PaymentMethod {
  type: string;
  last4: string;
  brand: string;
}

interface OrderData {
  orderNumber: string;
  orderDate: string;
  estimatedDelivery: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  trackingNumber?: string;
  promoCode?: string;
}

const sampleOrder: OrderData = {
  orderNumber: "PC-2024-001234",
  orderDate: "November 6, 2024",
  estimatedDelivery: "November 12-14, 2024",
  items: [
    {
      id: 1,
      name: "Classic White Pearl Beaded Bracelet",
      price: 89.99,
      quantity: 2,
      image: "/classic-white-pearl-beaded-bracelet.jpg",
      size: "One Size",
    },
    {
      id: 2,
      name: "Amethyst Crystal Beaded Bracelet",
      price: 75.99,
      quantity: 1,
      image: "/amethyst-crystal-beaded-bracelet.jpg",
      size: "One Size",
    },
  ],
  shippingAddress: {
    name: "张小雅",
    street: "1234 Jewelry Lane, Apt 5B",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    country: "United States",
    phone: "+1 (555) 123-4567",
  },
  billingAddress: {
    name: "张小雅",
    street: "1234 Jewelry Lane, Apt 5B",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    country: "United States",
    phone: "+1 (555) 123-4567",
  },
  paymentMethod: {
    type: "Credit Card",
    last4: "4242",
    brand: "Visa",
  },
  subtotal: 255.97,
  discount: 25.6,
  shipping: 0,
  tax: 18.43,
  total: 248.8,
  trackingNumber: "1Z999AA1234567890",
  promoCode: "PEARL10",
};

export default function CheckoutSuccessPage() {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showTrackingInfo, setShowTrackingInfo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const downloadReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    console.log("Downloading receipt...");
  };

  const shareOrder = () => {
    // In a real app, this would open share options
    console.log("Sharing order...");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/20">
      {/* Success Animation Header */}
      <div className="relative overflow-hidden bg-linear-to-r from-accent/5 via-accent/10 to-accent/5 border-b border-border">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-accent/5 to-transparent"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div
            className={`transition-all duration-1000 ${
              animationComplete
                ? "scale-100 opacity-100"
                : "scale-125 opacity-50"
            }`}
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-accent text-accent-foreground rounded-full mb-6 shadow-2xl">
              <CheckCircle className="w-12 h-12" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Thank you for your purchase. Your order has been confirmed and is
            being processed.
          </p>

          <div className="inline-flex items-center space-x-4 bg-card border border-border rounded-lg p-4 shadow-lg">
            <Receipt className="w-5 h-5 text-accent" />
            <div className="text-left">
              <div className="text-sm text-muted-foreground">Order Number</div>
              <div className="font-medium text-foreground">
                {sampleOrder.orderNumber}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details & Timeline */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Timeline */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-light tracking-tight text-foreground mb-6 flex items-center">
                <Package className="w-6 h-6 mr-3 text-accent" />
                Order Timeline
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">
                      Payment Confirmed
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your payment has been successfully processed
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Today, 2:34 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-10 h-10 bg-accent/20 text-accent rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">
                      Order Processing
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your order is being prepared for shipment
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expected: Tomorrow
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-10 h-10 bg-secondary text-muted-foreground rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-muted-foreground">
                      Shipped
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your order will be shipped soon
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expected: Nov 8-9
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-10 h-10 bg-secondary text-muted-foreground rounded-full flex items-center justify-center">
                    <Home className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-muted-foreground">
                      Delivered
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Estimated delivery date
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {sampleOrder.estimatedDelivery}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-light tracking-tight text-foreground mb-6">
                Order Items
              </h2>

              <div className="space-y-4">
                {sampleOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 bg-secondary/30 rounded-xl"
                  >
                    <div className="relative w-16 h-16 overflow-hidden rounded-lg bg-secondary shrink-0">
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
                        Size: {item.size}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-accent">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Billing Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-light tracking-tight text-foreground mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-accent" />
                  Shipping Address
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-foreground">
                    {sampleOrder.shippingAddress.name}
                  </p>
                  <p className="text-muted-foreground">
                    {sampleOrder.shippingAddress.street}
                  </p>
                  <p className="text-muted-foreground">
                    {sampleOrder.shippingAddress.city},{" "}
                    {sampleOrder.shippingAddress.state}{" "}
                    {sampleOrder.shippingAddress.zipCode}
                  </p>
                  <p className="text-muted-foreground">
                    {sampleOrder.shippingAddress.country}
                  </p>
                  <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-border">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {sampleOrder.shippingAddress.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-light tracking-tight text-foreground mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-accent" />
                  Payment Method
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-5 bg-linear-to-r from-blue-600 to-blue-400 rounded text-white text-xs flex items-center justify-center font-bold">
                      VISA
                    </div>
                    <p className="text-foreground">
                      •••• •••• •••• {sampleOrder.paymentMethod.last4}
                    </p>
                  </div>
                  <p className="text-muted-foreground">
                    {sampleOrder.paymentMethod.type}
                  </p>

                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="font-medium text-foreground mb-2">
                      Billing Address
                    </h4>
                    <p className="text-muted-foreground">
                      {sampleOrder.billingAddress.name}
                    </p>
                    <p className="text-muted-foreground">
                      {sampleOrder.billingAddress.street}
                    </p>
                    <p className="text-muted-foreground">
                      {sampleOrder.billingAddress.city},{" "}
                      {sampleOrder.billingAddress.state}{" "}
                      {sampleOrder.billingAddress.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary & Actions */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-light tracking-tight text-foreground mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">
                    ${sampleOrder.subtotal.toFixed(2)}
                  </span>
                </div>

                {sampleOrder.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Discount{" "}
                      {sampleOrder.promoCode && `(${sampleOrder.promoCode})`}
                    </span>
                    <span className="text-accent">
                      -${sampleOrder.discount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">
                    {sampleOrder.shipping === 0
                      ? "Free"
                      : `$${sampleOrder.shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">
                    ${sampleOrder.tax.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">
                      Total Paid
                    </span>
                    <span className="font-medium text-foreground text-lg">
                      ${sampleOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-light tracking-tight text-foreground mb-4">
                Quick Actions
              </h3>

              <div className="space-y-3">
                <Button
                  onClick={downloadReceipt}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>

                <Button
                  onClick={() => setShowTrackingInfo(!showTrackingInfo)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Track Order
                </Button>

                <Button
                  onClick={shareOrder}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Order
                </Button>
              </div>

              {showTrackingInfo && sampleOrder.trackingNumber && (
                <div className="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <h4 className="font-medium text-accent mb-2">
                    Tracking Information
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Tracking Number:
                  </p>
                  <p className="text-sm font-mono text-foreground bg-background px-2 py-1 rounded">
                    {sampleOrder.trackingNumber}
                  </p>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-light tracking-tight text-foreground mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-accent" />
                What's Next?
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 text-accent mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      Order Confirmation
                    </p>
                    <p className="text-muted-foreground">
                      Check your email for detailed order confirmation
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Package className="w-4 h-4 text-accent mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Processing</p>
                    <p className="text-muted-foreground">
                      Your order will be processed within 1-2 business days
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Truck className="w-4 h-4 text-accent mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      Shipping Updates
                    </p>
                    <p className="text-muted-foreground">
                      You'll receive tracking information once shipped
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Service */}
            <div className="bg-linear-to-r from-accent/5 to-accent/10 border border-accent/20 rounded-2xl p-6">
              <h3 className="text-lg font-light tracking-tight text-foreground mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-accent" />
                Need Help?
              </h3>

              <p className="text-sm text-muted-foreground mb-4">
                Our customer service team is here to help with any questions
                about your order.
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-accent" />
                  <a
                    href="mailto:support@pearlcrystal.com"
                    className="text-accent hover:text-accent/80 transition-colors"
                  >
                    support@pearlcrystal.com
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-accent" />
                  <a
                    href="tel:+1-800-PEARLS"
                    className="text-accent hover:text-accent/80 transition-colors"
                  >
                    1-800-PEARLS (1-800-732-7577)
                  </a>
                </div>
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="space-y-3">
              <Link href="/products">
                <Button className="w-full">
                  Continue Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              <Link href="/">
                <Button variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Recommendation Section */}
        <div className="mt-16 bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light tracking-tight text-foreground mb-4">
              You Might Also Love
            </h2>
            <p className="text-muted-foreground">
              Discover more beautiful pieces to complete your collection
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: 5,
                name: "Rose Quartz Harmony",
                price: "$95.00",
                image: "/rose-quartz-crystal-beaded-bracelet.jpg",
              },
              {
                id: 6,
                name: "Golden Pearl Luxe",
                price: "$105.00",
                image: "/golden-pearl-beaded-bracelet-luxury.jpg",
              },
              {
                id: 7,
                name: "Moonstone Dreams",
                price: "$88.00",
                image: "/moonstone-pearl-beaded-bracelet.jpg",
              },
              {
                id: 8,
                name: "Crystal Sparkle Mix",
                price: "$92.00",
                image: "/crystal-sparkle-beaded-bracelet.jpg",
              },
            ].map((product) => (
              <Link
                key={product.id}
                href={linkToProductDetail(product.id)}
                className="group"
              >
                <div className="relative mb-4 overflow-hidden rounded-xl bg-secondary aspect-square">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform">
                    <Heart className="w-4 h-4 text-foreground" />
                  </button>
                </div>
                <h3 className="font-light text-foreground text-balance">
                  {product.name}
                </h3>
                <p className="text-accent font-light mt-1">{product.price}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
            <Gift className="w-4 h-4" />
            <span>
              Thank you for choosing Pearl & Crystal. Your elegance is our
              passion.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
