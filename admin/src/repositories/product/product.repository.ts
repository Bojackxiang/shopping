'use server';

import { db } from '@/lib/prisma';
import { handleError } from '@/utils';
import { ProductStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import {
  GetAllProductsInputProps,
  PaginatedProductsOutput,
  CreateProductInput,
  UpdateProductInput,
  CreateProductImageInput,
  UpdateProductImageInput,
  ReorderProductImagesInput
} from './product.types';

// 辅助函数：将 Decimal 转换为 number
function serializeProduct(product: any) {
  return {
    ...product,
    avgRating: product.avgRating ? Number(product.avgRating) : null,
    variants: product.variants?.map((v: any) => ({
      ...v,
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      cost: v.cost ? Number(v.cost) : null
    }))
  };
}

export const getAllProducts = async ({
  page = 1,
  pageSize = 10,
  orderBy = 'createdAt',
  status,
  categoryId,
  isFeatured,
  isNew,
  isActive,
  search
}: GetAllProductsInputProps = {}): Promise<PaginatedProductsOutput> => {
  try {
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {};

    if (status !== undefined) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isNew !== undefined) where.isNew = isNew;
    if (isActive !== undefined) where.isActive = isActive;

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [products, total] = await Promise.all([
      db.products.findMany({
        skip,
        take: pageSize,
        where,
        orderBy: { [orderBy]: 'desc' },
        include: {
          categories: true,
          variants: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            take: 1
          },
          product_images: {
            orderBy: { sortOrder: 'asc' },
            take: 1
          },
          _count: {
            select: {
              variants: true,
              reviews: true,
              wishlist_items: true
            }
          }
        }
      }),
      db.products.count({ where })
    ]);

    // 序列化 Decimal 类型
    const serializedProducts = products.map(serializeProduct);

    return {
      data: serializedProducts as any,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  } catch (error) {
    throw handleError(error);
  }
};

export const getProductById = async (id: string | null) => {
  try {
    if (id === null) {
      return null;
    }
    const product = await db.products.findUnique({
      where: { id },
      include: {
        categories: true,
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            variant_images: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        product_images: {
          orderBy: { sortOrder: 'asc' }
        },
        product_tags: {
          include: {
            tags: true
          }
        },
        product_faqs: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            customers: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true
              }
            }
          }
        },
        _count: {
          select: {
            variants: true,
            reviews: true,
            wishlist_items: true
          }
        }
      }
    });

    return product ? serializeProduct(product) : null;
  } catch (error) {
    throw handleError(error);
  }
};

export const getProductBySlug = async (slug: string) => {
  try {
    const product = await db.products.findUnique({
      where: { slug },
      include: {
        categories: true,
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            variant_images: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        product_images: {
          orderBy: { sortOrder: 'asc' }
        },
        product_tags: {
          include: {
            tags: true
          }
        },
        product_faqs: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    return product ? serializeProduct(product) : null;
  } catch (error) {
    throw handleError(error);
  }
};

export const createProduct = async (data: CreateProductInput) => {
  try {
    const product = await db.products.create({
      data: {
        ...data,
        status: data.status || ProductStatus.DRAFT,
        publishedAt:
          data.status === ProductStatus.ACTIVE ? new Date() : undefined
      },
      include: {
        categories: true
      }
    });

    return serializeProduct(product);
  } catch (error) {
    throw handleError(error);
  }
};

export const updateProduct = async (id: string, data: UpdateProductInput) => {
  try {
    const result = await db.$transaction(async (tx) => {
      // ========== 0. Get the thumbnail ==========
      let thumbnailImage: string | undefined = undefined;

      const coverImage = data.product_images?.find(
        (img) => img.isCover === true
      );

      if (coverImage) {
        thumbnailImage = coverImage.url;
      } else if (data.product_images && data.product_images.length > 0) {
        thumbnailImage = data.product_images[0].url;
      }

      // ========== 1. Update Main Product ==========
      await tx.products.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          thumbnail: thumbnailImage,
          status: data.status,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          isNew: data.isNew,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          publishedAt:
            data.status === ProductStatus.ACTIVE && !data.publishedAt
              ? new Date()
              : data.publishedAt,
          updatedAt: new Date()
        }
      });

      // ========== 2. Handle Variants ==========
      if (data.variants) {
        // Get existing variants from DB
        const existingVariants = await tx.product_variants.findMany({
          where: { productId: id }
        });

        const existingIds = existingVariants.map((v) => v.id);
        const incomingIds = data.variants.filter((v) => v.id).map((v) => v.id!);

        // Delete removed variants
        const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
        if (toDelete.length > 0) {
          await tx.product_variants.deleteMany({
            where: { id: { in: toDelete } }
          });
        }

        // Create or update variants
        for (const variant of data.variants) {
          if (variant.id && existingIds.includes(variant.id)) {
            // Update existing variant
            await tx.product_variants.update({
              where: { id: variant.id },
              data: {
                name: variant.name,
                sku: variant.sku,
                barcode: variant.barcode,
                price: variant.price,
                compareAtPrice: variant.compareAtPrice,
                cost: variant.cost,
                inventory: variant.inventory,
                lowStockThreshold: variant.lowStockThreshold,
                trackInventory: variant.trackInventory,
                size: variant.size,
                color: variant.color,
                material: variant.material,
                weight: variant.weight,
                attributes: variant.attributes,
                isDefault: variant.isDefault,
                sortOrder: variant.sortOrder,
                isActive: variant.isActive,
                updatedAt: new Date()
              }
            });
          } else {
            // Create new variant
            await tx.product_variants.create({
              data: {
                id: randomUUID(),
                productId: id,
                name: variant.name,
                sku: variant.sku,
                barcode: variant.barcode,
                price: variant.price,
                compareAtPrice: variant.compareAtPrice,
                cost: variant.cost,
                inventory: variant.inventory || 0,
                lowStockThreshold: variant.lowStockThreshold || 5,
                trackInventory: variant.trackInventory ?? true,
                size: variant.size,
                color: variant.color,
                material: variant.material,
                weight: variant.weight,
                attributes: variant.attributes,
                isDefault: variant.isDefault || false,
                sortOrder: variant.sortOrder || 0,
                isActive: variant.isActive ?? true
              }
            });
          }
        }
      }

      // ========== 3. Handle Product Images ==========
      if (data.product_images) {
        const existingImages = await tx.product_images.findMany({
          where: { productId: id }
        });

        const existingIds = existingImages.map((img) => img.id);
        const incomingIds = data.product_images
          .filter((img) => img.id)
          .map((img) => img.id!);

        // Delete removed images
        const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
        if (toDelete.length > 0) {
          await tx.product_images.deleteMany({
            where: { id: { in: toDelete } }
          });
        }

        // Create or update images
        for (const image of data.product_images) {
          if (image.id && existingIds.includes(image.id)) {
            await tx.product_images.update({
              where: { id: image.id },
              data: {
                url: image.url,
                isCover: image.isCover,
                altText: image.altText,
                sortOrder: image.sortOrder
              }
            });
          } else {
            await tx.product_images.create({
              data: {
                id: randomUUID(),
                productId: id,
                url: image.url,
                isCover: image.isCover || false,
                altText: image.altText,
                sortOrder: image.sortOrder || 0
              }
            });
          }
        }
      }

      // ========== 4. Handle Tags (Many-to-Many) ==========
      if (data.tagIds) {
        // Delete all existing associations
        await tx.product_tags.deleteMany({
          where: { productId: id }
        });

        // Create new associations
        if (data.tagIds.length > 0) {
          await tx.product_tags.createMany({
            data: data.tagIds.map((tagId) => ({
              id: randomUUID(),
              productId: id,
              tagId
            }))
          });
        }
      }

      // ========== 5. Handle FAQs ==========
      if (data.product_faqs) {
        const existingFaqs = await tx.product_faqs.findMany({
          where: { productId: id }
        });

        const existingIds = existingFaqs.map((faq) => faq.id);
        const incomingIds = data.product_faqs
          .filter((faq) => faq.id)
          .map((faq) => faq.id!);

        // Delete removed FAQs
        const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
        if (toDelete.length > 0) {
          await tx.product_faqs.deleteMany({
            where: { id: { in: toDelete } }
          });
        }

        // Create or update FAQs
        for (const faq of data.product_faqs) {
          if (faq.id && existingIds.includes(faq.id)) {
            // Update existing FAQ
            await tx.product_faqs.update({
              where: { id: faq.id },
              data: {
                question: faq.question,
                answer: faq.answer,
                isActive: faq.isActive ?? true,
                sortOrder: faq.sortOrder || 0,
                updatedAt: new Date()
              }
            });
          } else {
            // Create new FAQ
            await tx.product_faqs.create({
              data: {
                id: randomUUID(),
                productId: id,
                question: faq.question,
                answer: faq.answer,
                isActive: faq.isActive ?? true,
                sortOrder: faq.sortOrder || 0
              }
            });
          }
        }
      }

      // Return updated product with all relations
      return await tx.products.findUnique({
        where: { id },
        include: {
          categories: true,
          variants: {
            orderBy: { sortOrder: 'asc' }
          },
          product_images: {
            orderBy: { sortOrder: 'asc' }
          },
          product_tags: {
            include: { tags: true }
          },
          product_faqs: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      });
    });

    return result ? serializeProduct(result) : null;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const product = await db.products.delete({
      where: { id }
    });

    return serializeProduct(product);
  } catch (error) {
    throw handleError(error);
  }
};

export const incrementViewCount = async (id: string) => {
  try {
    await db.products.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });
  } catch (error) {
    throw handleError(error);
  }
};

// ============ Product Images ============

export const getProductImages = async (productId: string) => {
  try {
    const images = await db.product_images.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' }
    });

    return images;
  } catch (error) {
    throw handleError(error);
  }
};

export const getProductImageById = async (id: string) => {
  try {
    const image = await db.product_images.findUnique({
      where: { id }
    });

    return image;
  } catch (error) {
    throw handleError(error);
  }
};

export const createProductImage = async (data: CreateProductImageInput) => {
  try {
    const image = await db.product_images.create({
      data: {
        ...data,
        id: randomUUID()
      }
    });

    return image;
  } catch (error) {
    throw handleError(error);
  }
};

export const createProductImages = async (
  images: CreateProductImageInput[]
) => {
  try {
    const result = await db.product_images.createMany({
      data: images.map((img) => ({
        ...img,
        id: randomUUID()
      }))
    });

    return result;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateProductImage = async (
  id: string,
  data: UpdateProductImageInput
) => {
  try {
    const image = await db.product_images.update({
      where: { id },
      data
    });

    return image;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteProductImage = async (id: string) => {
  try {
    await db.product_images.delete({
      where: { id }
    });

    return { success: true };
  } catch (error) {
    throw handleError(error);
  }
};

export const reorderProductImages = async (
  reorders: ReorderProductImagesInput[]
) => {
  try {
    await db.$transaction(
      reorders.map((item) =>
        db.product_images.update({
          where: { id: item.imageId },
          data: { sortOrder: item.sortOrder }
        })
      )
    );

    return { success: true };
  } catch (error) {
    throw handleError(error);
  }
};
