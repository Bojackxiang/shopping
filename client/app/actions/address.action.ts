"use server";

import { CustomerRepo } from "@/repo";
import { Address } from "@/repo/address.repo";
import type { AddressBasicInfo } from "@/repo/address.repo";
import { currentUser } from "@clerk/nextjs/server";

export const fetchUserAddressesAction = async () => {
  try {
    // 1. Get current user
    const user = await currentUser();

    if (!user) {
      return { error: "User not authenticated", data: null };
    }

    // 2. Get customer by clerkId
    const customer = await CustomerRepo.fetchCustomerByClerkId(user.id);

    if (!customer) {
      return { error: "Customer not found", data: null };
    }

    // 3. Call repository to fetch addresses
    const addresses = await Address.getAddressByCustomerId(customer.id);

    // 4. Return success
    return { data: addresses, error: null };
  } catch (error) {
    // 5. Handle errors
    console.error("Error fetching user addresses:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to fetch addresses",
      data: null,
    };
  }
};

export const removeUserAddressAction = async (addressId: string) => {
  try {
    // 1. Get current user
    const user = await currentUser();

    if (!user) {
      return { error: "User not authenticated", success: false };
    }

    // 2. Get customer by clerkId
    const customer = await CustomerRepo.fetchCustomerByClerkId(user.id);

    if (!customer) {
      return { error: "Customer not found", success: false };
    }

    // 3. Call repository to delete address
    const deletionResult = await Address.deleteAddress(customer.id, addressId);

    if (!deletionResult) {
      return { error: "Address deletion failed", success: false };
    }

    // 4. Return success
    return { error: null, success: true };
  } catch (error) {
    // 5. Handle errors
    console.error("Error deleting user address:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to delete address",
      success: false,
    };
  }
};

export const saveUserAddressAction = async (
  addressData: Partial<AddressBasicInfo> & { id?: string },
) => {
  try {
    // 1. Get current user
    const user = await currentUser();

    if (!user) {
      return { error: "User not authenticated", success: false };
    }

    // 2. Get customer by clerkId
    const customer = await CustomerRepo.fetchCustomerByClerkId(user.id);

    if (!customer) {
      return { error: "Customer not found", success: false };
    }

    // 3. Validate required fields
    if (
      !addressData.fullName ||
      !addressData.phone ||
      !addressData.addressLine1 ||
      !addressData.city ||
      !addressData.postalCode ||
      !addressData.country
    ) {
      return { error: "Missing required fields", success: false };
    }

    // 4. Prepare address data with required fields
    const validatedData = {
      fullName: addressData.fullName,
      phone: addressData.phone,
      addressLine1: addressData.addressLine1,
      addressLine2: addressData.addressLine2 || null,
      city: addressData.city,
      state: addressData.state || null,
      postalCode: addressData.postalCode,
      country: addressData.country,
      isDefault: addressData.isDefault ?? false,
    };

    // 5. Call repository to save address (create or update)
    const savedAddress = addressData.id
      ? await Address.updateAddress(customer.id, addressData.id, validatedData)
      : await Address.createAddress(customer.id, validatedData);

    if (!savedAddress) {
      return { error: "Failed to save address", success: false };
    }

    // 6. Return success
    return { error: null, success: true, data: savedAddress };
  } catch (error) {
    // 7. Handle errors
    console.error("Error saving user address:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to save address",
      success: false,
    };
  }
};
