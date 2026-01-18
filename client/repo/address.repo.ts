import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Define address query structure
const addressBasicInfo = Prisma.validator<Prisma.addressesDefaultArgs>()({
  select: {
    id: true,
    fullName: true,
    phone: true,
    addressLine1: true,
    addressLine2: true,
    city: true,
    state: true,
    postalCode: true,
    country: true,
    isDefault: true,
    createdAt: true,
    updatedAt: true,
    customerId: true,
  },
});

// Extract type
export type AddressBasicInfo = Prisma.addressesGetPayload<
  typeof addressBasicInfo
>;

export class Address {
  static async getAddressByCustomerId(
    customerId: string,
  ): Promise<AddressBasicInfo[]> {
    try {
      const addresses = await db.addresses.findMany({
        where: {
          customerId,
        },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          fullName: true,
          phone: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true,
          customerId: true,
        },
      });

      return addresses;
    } catch (error) {
      console.error("Error fetching addresses by customer ID:", error);
      throw new Error("Failed to fetch customer addresses");
    }
  }

  static async deleteAddress(
    customerId: string,
    addressId: string,
  ): Promise<boolean> {
    try {
      const deletionResult = await db.addresses.deleteMany({
        where: {
          id: addressId,
          customerId: customerId,
        },
      });

      return deletionResult.count > 0;
    } catch (error) {
      console.error("Error deleting address:", error);
      return false;
    }
  }
}
