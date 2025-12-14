"use client";

import useSWRMutation from "swr/mutation";
import { deleteCartAction } from "@/app/actions/cart.action";

interface RemoveItemParams {
  variantId: string;
}

async function removeItemFetcher(
  _key: string,
  { arg }: { arg: RemoveItemParams }
) {
  const result = await deleteCartAction(arg);

  if (result.error) {
    throw new Error(result.error);
  }

  return result.cart;
}

const useRemoveItemFromCart = () => {
  const { trigger, data, error, isMutating } = useSWRMutation(
    "/api/cart/remove",
    removeItemFetcher
  );

  const removeItem = async (params: RemoveItemParams) => {
    try {
      const result = await trigger(params);
      return { success: true, data: result };
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to remove item from cart",
      };
    }
  };

  return {
    removeItem,
    data,
    isLoading: isMutating,
    error: error?.message,
  };
};

export default useRemoveItemFromCart;
