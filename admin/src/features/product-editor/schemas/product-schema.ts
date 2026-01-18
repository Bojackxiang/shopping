import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

// Variant schema - 完全匹配 Prisma schema
const variantSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(), // 会自动填充
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional().nullable(),
  name: z.string().optional().nullable(), // 变体名称，如 "大号-红色"
  price: z.number().min(0, 'Price must be positive'),
  compareAtPrice: z.preprocess(
    (val) => (val === '' || isNaN(Number(val)) ? null : Number(val)),
    z.number().optional().nullable()
  ),
  cost: z.preprocess(
    (val) => (val === '' || isNaN(Number(val)) ? null : Number(val)),
    z.number().optional().nullable()
  ),
  inventory: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().default(5),
  trackInventory: z.boolean().default(true),
  // 变体属性
  size: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  weight: z.preprocess(
    (val) => (val === '' || isNaN(Number(val)) ? null : Number(val)),
    z.number().optional().nullable()
  ),
  attributes: z.any().optional().nullable(),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  salesCount: z.number().int().default(0).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  variant_images: z.array(z.any()).optional()
});

// Image schema - 完全匹配 Prisma product_images model
const imageSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(), // 会自动填充
  url: z.string().min(1, 'Image URL is required'),
  publicId: z.string().optional().nullable(), // Cloudinary public_id
  isCover: z.boolean().default(false),
  altText: z.string().nullable().default(null),
  sortOrder: z.number().int().default(0),
  createdAt: z.date().optional()
});

// FAQ schema
const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0)
});

// Main product schema - 匹配 Prisma products model
export const productFormSchema = z.object({
  // Basic Info
  name: z.string().min(1, 'Product name is required').max(200),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(), // 前端用，数据库没有此字段

  // Category & Brand
  brandId: z.string().optional().nullable(), // 数据库目前没有 brand 字段

  // Status
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
  publishedAt: z.date().optional().nullable(), // 发布时间
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),

  // Media
  thumbnail: z.string().optional().nullable().or(z.literal('')), // 产品封面图/缩略图
  videoUrl: z.string().optional().nullable().or(z.literal('')), // 数据库没有此字段
  product_images: z.array(imageSchema).default([]),

  // Variants
  variants: z.array(variantSchema).default([]),

  // SEO
  metaTitle: z.string().max(60).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  metaKeywords: z.string().optional().nullable(), // 数据库没有此字段

  // FAQs
  product_faqs: z.array(faqSchema).default([]),

  // Tags
  tagIds: z.array(z.string()).default([]),

  // 统计字段 (只读，不在表单中编辑)
  viewCount: z.number().int().default(0).optional(),
  salesCount: z.number().int().default(0).optional(),
  reviewCount: z.number().int().default(0).optional(),
  avgRating: z.number().optional().nullable(),
  wishlistCount: z.number().int().default(0).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type ProductFormData = z.infer<typeof productFormSchema>;
