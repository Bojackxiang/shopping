/**
 * Prisma 生成的类型定义
 * 直接从 @prisma/client 导入，确保类型始终与 schema 保持同步
 */

export type {
  // Products
  products,
  product_variants,
  product_categories,
  product_images,
  product_tags,
  product_faqs,

  // Categories
  categories,

  // Orders
  orders,
  order_items,

  // Cart
  carts,
  cart_items,

  // Customers
  customers,
  addresses,

  // Reviews & Wishlist
  reviews,
  wishlist_items,

  // Promotions & Coupons
  promotions,
  promotion_products,
  coupons,
  coupon_usages,

  // Other
  tags,
  related_products,
  variant_images,
} from "@prisma/client";

/**
 * Prisma Enums - 枚举类型
 * 用于类型安全的状态判断和比较
 */
export { OrderStatus } from "@prisma/client";

/**
 * 常用的组合类型
 */

/**
 * 购物车与商品详情 - 用于展示完整购物车信息
 * 包含：cart -> items -> variant -> product
 */
export type CartWithItems = {
  id: string;
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    cartId: string;
    variantId: string;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
    variant: {
      id: string;
      productId: string;
      sku: string;
      barcode: string | null;
      name: string | null;
      price: any; // Decimal
      compareAtPrice: any | null; // Decimal
      cost: any | null; // Decimal
      inventory: number;
      lowStockThreshold: number;
      trackInventory: boolean;
      size: string | null;
      color: string | null;
      material: string | null;
      weight: number | null;
      attributes: any; // Json
      isDefault: boolean;
      sortOrder: number;
      isActive: boolean;
      salesCount: number;
      createdAt: Date;
      updatedAt: Date;
      product: {
        id: string;
        name: string;
        slug: string;
        thumbnail: string | null;
      };
    };
  }[];
};

export type ProductWithVariants = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  status: string;
  publishedAt: Date | null;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  viewCount: number;
  salesCount: number;
  reviewCount: number;
  avgRating: any | null; // Decimal
  wishlistCount: number;
  createdAt: Date;
  updatedAt: Date;
  variants: {
    id: string;
    productId: string;
    sku: string;
    barcode: string | null;
    name: string | null;
    price: any; // Decimal
    compareAtPrice: any | null; // Decimal
    cost: any | null; // Decimal
    inventory: number;
    lowStockThreshold: number;
    trackInventory: boolean;
    size: string | null;
    color: string | null;
    material: string | null;
    weight: number | null;
    attributes: any; // Json
    isDefault: boolean;
    sortOrder: number;
    isActive: boolean;
    salesCount: number;
    createdAt: Date;
    updatedAt: Date;
  }[];
  product_images: {
    id: string;
    productId: string;
    url: string;
    publicId: string | null;
    isCover: boolean;
    altText: string | null;
    sortOrder: number;
    createdAt: Date;
  }[];
  categories: {
    productId: string;
    categoryId: string;
    isPrimary: boolean;
    sortOrder: number;
    createdAt: Date;
    category: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      imageUrl: string | null;
      isActive: boolean;
      sortOrder: number;
      parentId: string | null;
      allowChildren: boolean;
      path: string;
      isProtected: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
  }[];
};
