import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { cuid } from "@/utils/cuid";

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

  static async createAddress(
    customerId: string,
    addressData: Omit<
      AddressBasicInfo,
      "id" | "customerId" | "createdAt" | "updatedAt"
    >,
  ): Promise<AddressBasicInfo | null> {
    try {
      // If this is set as default, unset other default addresses
      if (addressData.isDefault) {
        await db.addresses.updateMany({
          where: {
            customerId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      const newAddress = await db.addresses.create({
        data: {
          id: cuid(),
          customerId,
          fullName: addressData.fullName,
          phone: addressData.phone,
          addressLine1: addressData.addressLine1,
          addressLine2: addressData.addressLine2 || null,
          city: addressData.city,
          state: addressData.state || null,
          postalCode: addressData.postalCode,
          country: addressData.country,
          isDefault: addressData.isDefault,
          updatedAt: new Date(),
        },
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

      return newAddress;
    } catch (error) {
      console.error("Error creating address:", error);
      return null;
    }
  }

  static async updateAddress(
    customerId: string,
    addressId: string,
    addressData: Partial<
      Omit<AddressBasicInfo, "id" | "customerId" | "createdAt" | "updatedAt">
    >,
  ): Promise<AddressBasicInfo | null> {
    try {
      // If this is set as default, unset other default addresses
      if (addressData.isDefault) {
        await db.addresses.updateMany({
          where: {
            customerId,
            isDefault: true,
            NOT: {
              id: addressId,
            },
          },
          data: {
            isDefault: false,
          },
        });
      }

      const updatedAddress = await db.addresses.update({
        where: {
          id: addressId,
          customerId,
        },
        data: {
          ...addressData,
          updatedAt: new Date(),
        },
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

      return updatedAddress;
    } catch (error) {
      console.error("Error updating address:", error);
      return null;
    }
  }
}
