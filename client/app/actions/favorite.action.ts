"use server";

import { currentUser } from "@clerk/nextjs/server";
import { CustomerRepo, Favorite } from "@/repo";
import type {
  FavoriteBasicInfo,
  FavoriteWithProduct,
} from "@/repo/favorite.repo";
import { serializePrisma } from "@/utils/serialize-prisma";

/**
 * Fetch all user favorites
 */
export const fetchUserFavoritesAction = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "User not authenticated", data: null };
    }

    const customer = await CustomerRepo.fetchCustomerByClerkId(user.id);

    if (!customer) {
      return { error: "Customer not found", data: null };
    }

    const favorites = await Favorite.getFavoritesByCustomerId(customer.id);

    return { data: serializePrisma(favorites), error: null };
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to fetch favorites",
      data: null,
    };
  }
};

/**
 * Fetch user favorites count
 */
export const fetchUserFavoritesCountAction = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "User not authenticated", data: null };
    }

    const customer = await CustomerRepo.fetchCustomerByClerkId(user.id);

    if (!customer) {
      return { error: "Customer not found", data: null };
    }

    const count = await Favorite.getFavoritesCount(customer.id);

    return { data: count, error: null };
  } catch (error) {
    console.error("Error fetching favorites count:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch favorites count",
      data: null,
    };
  }
};

/**
 * Add a product to favorites
 */
export const addFavoriteAction = async (
  productId: string,
  productData?: {
    productName?: string;
    productSlug?: string;
    productImage?: string;
    variantId?: string;
    variantName?: string;
    notes?: string;
  },
) => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "User not authenticated", data: null };
    }

    const customer = await CustomerRepo.fetchCustomerByClerkId(user.id);

    if (!customer) {
      return { error: "Customer not found", data: null };
    }

    const favorite = await Favorite.addFavorite(
      customer.id,
      productId,
      productData || {},
    );

    return { data: favorite, error: null };
  } catch (error) {
    console.error("Error adding favorite:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to add favorite",
      data: null,
    };
  }
};

/**
 * Remove a favorite by ID
 */
export const removeFavoriteAction = async (favoriteId: string) => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "User not authenticated", success: false };
    }

    const customer = await CustomerRepo.fetchCustomerByClerkId(user.id);

    if (!customer) {
      return { error: "Customer not found", success: false };
    }

    const success = await Favorite.removeFavorite(customer.id, favoriteId);

    if (!success) {
      return { error: "Favorite not found or already removed", success: false };
    }

    return { error: null, success: true };
  } catch (error) {
    console.error("Error removing favorite:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to remove favorite",
      success: false,
    };
  }
};

/**
 * Remove a favorite by product ID
 */
export const removeFavoriteByProductIdAction = async (productId: string) => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "User not authenticated", success: false };
    }

    const customer = await CustomerRepo.fetchCustomerByClerkId(user.id);

    if (!customer) {
      return { error: "Customer not found", success: false };
    }

    const success = await Favorite.removeFavoriteByProductId(
      customer.id,
      productId,
    );

    if (!success) {
      return { error: "Favorite not found or already removed", success: false };
    }

    return { error: null, success: true };
  } catch (error) {
    console.error("Error removing favorite by product ID:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to remove favorite",
      success: false,
    };
  }
};

/**
 * Toggle favorite status
 */
export const toggleFavoriteAction = async (
  productId: string,
  productData?: {
    productName?: string;
    productSlug?: string;
    productImage?: string;
    variantId?: string;
    variantName?: string;
  },
) => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "User not authenticated", data: null };
    }

    const customer = await CustomerRepo.fetchCustomerByClerkId(user.id);

    if (!customer) {
      return { error: "Customer not found", data: null };
    }

    const result = await Favorite.toggleFavorite(
      customer.id,
      productId,
      productData,
    );

    return { data: result, error: null };
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to toggle favorite",
      data: null,
    };
  }
};

/**
 * Check if a product is in favorites
 */
export const checkIsFavoriteAction = async (productId: string) => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "User not authenticated", data: null };
    }

    const customer = await CustomerRepo.fetchCustomerByClerkId(user.id);

    if (!customer) {
      return { error: "Customer not found", data: null };
    }

    const isFavorite = await Favorite.checkIsFavorite(customer.id, productId);

    return { data: isFavorite, error: null };
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to check favorite status",
      data: null,
    };
  }
};

/**
 * Update favorite notes
 */
export const updateFavoriteNotesAction = async (
  favoriteId: string,
  notes: string,
) => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "User not authenticated", data: null };
    }

    const customer = await CustomerRepo.fetchCustomerByClerkId(user.id);

    if (!customer) {
      return { error: "Customer not found", data: null };
    }

    const favorite = await Favorite.updateFavoriteNotes(
      customer.id,
      favoriteId,
      notes,
    );

    if (!favorite) {
      return { error: "Favorite not found", data: null };
    }

    return { data: favorite, error: null };
  } catch (error) {
    console.error("Error updating favorite notes:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to update notes",
      data: null,
    };
  }
};

/**
 * Clear all favorites
 */
export const clearAllFavoritesAction = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "User not authenticated", data: null };
    }

    const customer = await CustomerRepo.fetchCustomerByClerkId(user.id);

    if (!customer) {
      return { error: "Customer not found", data: null };
    }

    const count = await Favorite.clearAllFavorites(customer.id);

    return { data: { count }, error: null };
  } catch (error) {
    console.error("Error clearing favorites:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to clear favorites",
      data: null,
    };
  }
};
