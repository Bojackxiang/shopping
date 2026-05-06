"use server";

import { CategoryRepo } from "@/repo";
import { ProductRepo } from "@/repo/product.repo";

/**
 * Deep convert a Prisma-shaped object tree into plain JS values safe to send
 * across the React Server Components / Server Actions boundary.
 *
 * - Decimal → number
 * - Date → ISO string
 * - everything else: walked recursively
 */
function isDecimalLike(v: unknown): boolean {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof (o as { toNumber?: unknown }).toNumber === "function" &&
    typeof (o as { toString?: unknown }).toString === "function" &&
    typeof (o as { s?: unknown }).s === "number"
  );
}

function serializeProducts<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((v) => serializeProducts(v)) as unknown as T;
  }
  if (value instanceof Date) {
    return value.toISOString() as unknown as T;
  }
  if (isDecimalLike(value)) {
    return Number((value as { toString: () => string }).toString()) as unknown as T;
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = serializeProducts(v);
    }
    return out as unknown as T;
  }
  return value;
}

export async function getHotProductsAction(limit: number) {
  try {
    const products = await ProductRepo.getMarketingProductsLimit(
      "marketing-hot-buy",
      limit,
    );
    return {
      success: true,
      data: serializeProducts(products),
    };
  } catch (error) {
    console.error("Error fetching hot products:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getRecommendProductsAction(limit: number) {
  try {
    const products = await ProductRepo.getMarketingProductsLimit(
      "marketing-recommend",
      limit,
    );
    return {
      success: true,
      data: serializeProducts(products),
    };
  } catch (error) {
    console.error("Error fetching hot products:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getProductsByCategoryAction(input: {
  marketId?: string;
  limit: number;
  offset: number;
}) {
  try {
    const { marketId, limit, offset } = input;
    const result = await ProductRepo.getMarketingProductWithPagination({
      categoryId: marketId,
      limit,
      offset,
    });

    return {
      success: true,
      data: serializeProducts(result),
    };
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getProductsByPathAction(input: {
  categoryId: string;
  limit: number;
  offset: number;
}) {
  try {
    const { categoryId, limit, offset } = input;

    const categoryPath = await CategoryRepo.getCategoryPathById(categoryId);

    if (!categoryPath) {
      return {
        success: false,
        data: null,
        error: "Category not found",
      };
    }

    const result = await ProductRepo.getProductByPathWithPagination({
      path: categoryPath,
      limit,
      offset,
    });

    return {
      success: true,
      data: serializeProducts(result),
    };
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getAllProductsAction(input: {
  limit: number;
  offset: number;
}) {
  try {
    const { limit, offset } = input;
    const result = await ProductRepo.getMarketingProductWithPagination({
      limit,
      offset,
    });

    return {
      success: true,
      data: serializeProducts(result),
    };
  } catch (error) {
    console.error("Error fetching all products:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export const getProductByIdAction = async (productId: string) => {
  try {
    const product = await ProductRepo.getProductById(productId);
    return {
      success: true,
      data: serializeProducts(product),
    };
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
