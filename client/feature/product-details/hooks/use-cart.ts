"use client";

import { updateCartInfoAction } from "@/app/actions";
import { toast } from "sonner";

export interface AddToCartInput {
  productName?: string;
  variantId: string;
  quantity?: number;
}

const useCart = () => {
  const addToCart = async (input: AddToCartInput) => {
    // Ensure quantity defaults to 1 if not provided
    const quantity = input.quantity ?? 1;
    try {
      await updateCartInfoAction({
        variantId: input.variantId,
        quantity,
      });

      // Show success toast with product name
      toast.success("Added to Cart", {
        description: input.productName
          ? `${input.productName} (x${quantity}) has been added to your cart`
          : `Product (x${quantity}) has been added to your cart`,
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to add to cart", {
        description: "Please try again later",
        duration: 3000,
      });
      console.error("Error updating cart:", error);
    }
  };

  return {
    addToCart,
  };
};

export default useCart;
