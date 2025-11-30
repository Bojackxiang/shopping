"use server";

import { CategoryRepo } from "@/repo";
import { ProductRepo } from "@/repo/product.repo";

function serializeProducts<T>(products: T): T {
  return JSON.parse(
    JSON.stringify(products, (key, value) => {
      if (typeof value === "object" && value !== null && "toJSON" in value) {
        return value.toJSON();
      }
      return value;
    })
  );
}

export async function getHotProductsAction(limit: number) {
  try {
    const products = await ProductRepo.getMarketingProductsLimit(
      "marketing-hot-buy",
      limit
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
      limit
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

    console.log("categoryPath: ", categoryPath);

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

    console.log("result: ", result);

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
