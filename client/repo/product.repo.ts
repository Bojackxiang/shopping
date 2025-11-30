import { db } from "@/lib/prisma";
import page from "../app/contact/page";
import { product_variants } from "@prisma/client";

const HOT_CATEGORY_ID = "marketing-hot-buy" as const;
const RECOMMEND_ID = "marketing-recommend" as const;

type marketingCategory = "marketing-hot-buy" | "marketing-recommend";

export class ProductRepo {
  /**
   * For front
   * @param marketId
   * @param limit
   * @returns
   */
  public static async getMarketingProductsLimit(
    marketId: marketingCategory,
    limit: number
  ) {
    const hotProducts = await db.products.findMany({
      take: limit,
      where: {
        categories: {
          some: {
            category: {
              id: marketId,
            },
          },
        },
        isActive: true,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        variants: true,
        product_images: {
          where: {
            isCover: true,
          },
        },
      },
    });

    return hotProducts;
  }

  public static async getMarketingProductWithPagination(input: {
    categoryId?: string;
    limit: number;
    offset: number;
  }) {
    const { categoryId, limit, offset } = input;

    // validation
    if (categoryId !== "all" && categoryId) {
      const categoryExists = await db.categories.findUnique({
        where: { id: categoryId },
      });

      if (!categoryExists) {
        throw new Error(`Category with id ${categoryId} not found`);
      }
    }

    // query condition
    let whereCondition = {};
    if (categoryId === "all") {
      whereCondition = {
        isActive: true,
      };
    } else {
      whereCondition = {
        isActive: true,
        ...(categoryId && {
          categories: {
            some: {
              category: {
                id: categoryId,
              },
            },
          },
        }),
      };
    }

    // Fetch total count
    const total = await db.products.count({
      where: whereCondition,
    });

    // Fetch products with pagination
    const products = await db.products.findMany({
      skip: offset,
      take: limit,
      where: whereCondition,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        variants: true,
        product_images: {
          where: {
            isCover: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log();

    // Calculate pagination info
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      products,
      total,
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
  }

  public static async getProductByPathWithPagination(input: {
    path: string;
    limit: number;
    offset: number;
  }) {
    const { path, limit, offset } = input;

    let whereCondition = {
      isActive: true,
      categories: {
        some: {
          category: {
            path: {
              startsWith: path,
            },
          },
        },
      },
    };

    // Fetch total count
    const total = await db.products.count({
      where: whereCondition,
    });

    // Fetch products with pagination
    const products = await db.products.findMany({
      skip: offset,
      take: limit,
      where: whereCondition,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        variants: true,
        product_images: {
          where: {
            isCover: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate pagination info
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      products,
      total,
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
  }

  public static async getProductById(productId: string) {
    const product = await db.products.findUnique({
      where: { id: productId },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        variants: true,
        product_images: true,
      },
    });

    return product;
  }
}
