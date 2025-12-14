"use client";

import useSWRMutation from "swr/mutation";
import { updateCartQuantityAction } from "@/app/actions/cart.action";

interface UpdateCartParams {
  variantId: string;
  quantity: number;
}

async function updateCartFetcher(
  _key: string,
  { arg }: { arg: UpdateCartParams }
) {
  const result = await updateCartQuantityAction(arg);

  if (result.error) {
    throw new Error(result.error);
  }

  return result.cart;
}

const useUpdateCart = () => {
  const { trigger, error, isMutating } = useSWRMutation(
    "/api/cart/update",
    updateCartFetcher
  );

  const updateCart = async (params: UpdateCartParams) => {
    try {
      const result = await trigger(params);
      return { success: true, data: result };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to update cart",
      };
    }
  };

  return {
    updateCart,
    isLoading: isMutating,
    error: error?.message,
  };
};

export default useUpdateCart;
