"use server";

import { OrderRepo } from "@/repo/order.repo";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Fetch orders for the current logged-in user
 */
export const fetchUserRecentOrderAction = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "User not authenticated", data: null };
    }

    const orders = await OrderRepo.fetchRecentOrderByUserId(user.id);

    return { data: orders, error: null };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to fetch orders",
      data: null,
    };
  }
};

/**
 * Fetch paginated orders for the current logged-in user
 * @param page - Page number (starts from 1)
 * @param limit - Number of orders per page (1-100, default 10)
 */
export const fetchUserOrdersByPageAction = async (
  page: number = 1,
  limit: number = 10
) => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "User not authenticated", data: null };
    }

    const result = await OrderRepo.fetchUserOrderByPage(user.id, page, limit);

    return { data: result, error: null };
  } catch (error) {
    console.error("Error fetching paginated user orders:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to fetch orders",
      data: null,
    };
  }
};
