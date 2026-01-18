"use server";

import { CustomerRepo } from "@/repo/customer.repo";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Fetch current user's customer information
 */
export const fetchCurrentCustomerAction = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "User not authenticated", data: null };
    }

    const customer = await CustomerRepo.fetchCustomerByClerkId(user.id);

    if (!customer) {
      return { error: "Customer not found", data: null };
    }

    return { data: customer, error: null };
  } catch (error) {
    console.error("Error fetching customer:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to fetch customer",
      data: null,
    };
  }
};
