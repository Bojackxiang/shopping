import useSWR from "swr";
import * as actions from "@/app/actions";
import { delay } from "@/utils";

const PRODUCT_LIST_PAGE_SIZE = 8;

export const useProductListWithCategory = (
  input: useProductListWithCategoryProps
) => {
  const { categoryId, page } = input;

  const products = useSWR(
    categoryId ? `products-category-${categoryId}-${page}` : "products-all",
    async () => {
      await delay(500);
      // If categoryId is provided, fetch products by category
      if (categoryId && categoryId !== "all") {
        const result = await actions.getProductsByPathAction({
          categoryId: categoryId,
          limit: PRODUCT_LIST_PAGE_SIZE,
          offset: page ? (page - 1) * PRODUCT_LIST_PAGE_SIZE : 0,
        });
        if (result.success) {
          return result.data;
        }
        throw new Error(result.error || "Failed to fetch products by category");
      }

      // If categoryId is "all", fetch all products
      if (categoryId === "all") {
        const result = await actions.getAllProductsAction({
          limit: PRODUCT_LIST_PAGE_SIZE,
          offset: page ? (page - 1) * PRODUCT_LIST_PAGE_SIZE : 0,
        });

        if (result.success) {
          return result.data;
        }
        throw new Error(result.error || "Failed to fetch all products");
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
      dedupingInterval: 2000,
    }
  );

  return {
    products,
  };
};
