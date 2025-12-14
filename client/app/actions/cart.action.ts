"use server";

import { CartError } from "@/custom-error/CartError";
import { CartRepo } from "@/repo";
import { currentUser } from "@clerk/nextjs/server";

export interface UpdateCartInfoActionInput {
  variantId: string;
  quantity?: number;
}

export const updateCartInfoAction = async (
  input: UpdateCartInfoActionInput
) => {
  try {
    const user = await currentUser();

    if (!user) {
      // User not logged in
      return { error: "User not logged in" };
    }

    // Example: get customer info
    const customerInfo = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      fullName: user.firstName + " " + user.lastName,
    };

    await CartRepo.customerAddingCart({
      customerClerkId: customerInfo.id,
      variantId: input.variantId,
      quantity: input.quantity || 1,
    });
  } catch (error) {
    console.log(
      `Failed to update cart information: ${(error as Error).message}`
    );
    throw new Error(`Failed to update cart information`);
  }
};

export interface GetCartItemsByVariantInput {
  variantId: string;
}
export const fetchCartItemsByCustomerClerkIdAction = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "User not logged in" };
    }

    const cartItems = await CartRepo.fetchCartItemsByCustomerClerkId(user.id);

    const processedCartItems = cartItems
      ? {
          ...cartItems,
          items: cartItems.items.map((item) => {
            return {
              ...item,
              variant: {
                ...item.variant,
                price: item.variant.price.toString(),
                compareAtPrice: item.variant.compareAtPrice
                  ? item.variant.compareAtPrice.toString()
                  : null,
                cost: item.variant.cost ? item.variant.cost.toString() : null,
              },
            };
          }),
        }
      : null;

    return { cartItems: processedCartItems };
  } catch (error) {
    console.log(`Failed to fetch cart items: ${(error as Error).message}`);
    throw new Error(`Failed to fetch cart items`);
  }
};

/* Get user cart item by variant ID */
// to support product details pages "Add to cart" button
export const fetchCartItemCountByVariantAction = async (
  input: GetCartItemsByVariantInput
) => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "User not logged in" };
    }

    const cartItemCount = await CartRepo.getCartItemQuantityForVariant({
      customerClerkId: user.id,
      variantId: input.variantId,
    });

    return { cartItemCount };
  } catch (error) {
    console.log(`Failed to fetch cart item: ${(error as Error).message}`);
    throw new Error(`Failed to fetch cart item`);
  }
};

/* Update cart item quantity */
export interface UpdateCartQuantityInput {
  variantId: string;
  quantity: number;
}

export const updateCartQuantityAction = async (
  input: UpdateCartQuantityInput
) => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "User not logged in" };
    }

    const updatedCart = await CartRepo.customerUpdateCart({
      customerClerkId: user.id,
      variantId: input.variantId,
      quantity: input.quantity,
    });

    // Process cart items to convert Decimal to string
    const processedCart = updatedCart.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return { cart: processedCart, error: null };
  } catch (error) {
    return {
      cart: null,
      error: (error as Error).message || "Failed to update cart quantity",
    };
  }
};

export const deleteCartAction = async ({
  variantId,
}: {
  variantId: string;
}) => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "User not logged in", cart: null };
    }

    const clerkId = user.id;

    const updatedCart = await CartRepo.customerRemoveVariant({
      customerClerkId: clerkId,
      variantId,
    });

    // Process cart items to convert Decimal to string
    const processedCart = updatedCart.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return { cart: processedCart, error: null };
  } catch (error) {
    return {
      cart: null,
      error: (error as Error).message || "Failed to delete cart item",
    };
  }
};
