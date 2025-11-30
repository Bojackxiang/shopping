import { getProductByIdAction } from "@/app/actions/product.actions";
import { delay } from "@/utils";
import useSWR from "swr";

const useProduceData = (productUd: string) => {
  const { data, isLoading, error } = useSWR(
    `product-${productUd}`,
    async () => {
      await delay(500);
      const fetchedData = await getProductByIdAction(productUd);

      if (!fetchedData.success) {
        throw new Error(fetchedData.error || "Failed to fetch product data");
      }
      return fetchedData.data;
    },
    {
      errorRetryCount: 2,
    }
  );

  return { data, isLoading, error };
};

export default useProduceData;
