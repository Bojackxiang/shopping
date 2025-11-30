"use client";

import { useParams } from "next/navigation";
import ProductDetailView from "@/feature/product-details/view/product-detail-view";

// Sample product data (in real app, this would come from API)
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

const productData: Record<string, Product> = {
  "c118ae85-0765-4b71-b1a8-dc5801c27c2a": {
    id: 1,
    name: "Classic White Pearl Beaded Bracelet",
    price: "$89.99",
    originalPrice: "$120.00",
    images: [
      "/classic-white-pearl-beaded-bracelet.jpg",
      "/hero-pearl-crystal-luxury.jpg",
      "/placeholder.jpg",
    ],
    category: "Pearls",
    rating: 4.8,
    reviewCount: 127,
    description:
      "Elegant white pearl bracelet crafted with premium freshwater pearls. Each pearl is carefully selected for its lustrous finish and perfect round shape. This timeless piece adds sophistication to any outfit, whether casual or formal.",
    features: [
      "Premium freshwater pearls",
      "Hand-strung with silk thread",
      "Sterling silver clasp",
      "Adjustable length 7-8 inches",
      "Comes with luxury gift box",
    ],
    materials: "Freshwater pearls, Sterling silver, Silk thread",
    care: "Wipe with soft cloth after wear. Store in provided pouch. Avoid contact with perfumes and lotions.",
    inStock: true,
    stockCount: 15,
    sale: true,
    salePercentage: 25,
  },
  "2": {
    id: 2,
    name: "Amethyst Crystal Beaded Bracelet",
    price: "$75.99",
    images: [
      "/amethyst-crystal-beaded-bracelet.jpg",
      "/crystal-sparkle-beaded-bracelet.jpg",
      "/placeholder.jpg",
    ],
    category: "Crystals",
    rating: 4.9,
    reviewCount: 89,
    description:
      "Beautiful amethyst crystal bracelet featuring genuine amethyst stones known for their calming properties. The deep purple hues create a stunning accessory that complements both casual and evening wear.",
    features: [
      "Genuine amethyst crystals",
      "Natural stone variations",
      "Elastic cord for comfort",
      "One size fits most",
      "Energy healing properties",
    ],
    materials: "Amethyst crystals, Elastic cord",
    care: "Cleanse with moonlight or sage. Avoid water and harsh chemicals.",
    inStock: true,
    stockCount: 8,
    sale: false,
  },
};

const reviews = [
  {
    id: 1,
    name: "Sarah M.",
    rating: 5,
    date: "2 weeks ago",
    comment:
      "Absolutely gorgeous! The pearls have such a beautiful luster and the quality is exceptional. Perfect for special occasions.",
    verified: true,
  },
  {
    id: 2,
    name: "Emma L.",
    rating: 5,
    date: "1 month ago",
    comment:
      "Love this bracelet! It's exactly as pictured and feels very luxurious. The packaging was beautiful too.",
    verified: true,
  },
  {
    id: 3,
    name: "Jessica R.",
    rating: 4,
    date: "3 weeks ago",
    comment:
      "Beautiful bracelet, though slightly smaller than expected. Still very happy with the purchase!",
    verified: true,
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;

  return <ProductDetailView productId={productId} reviews={reviews} />;
}
