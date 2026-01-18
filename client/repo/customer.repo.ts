import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Define query structure
const customerBasicInfo = Prisma.validator<Prisma.customersDefaultArgs>()({
  select: {
    id: true,
    clerkId: true,
    email: true,
    firstName: true,
    lastName: true,
    username: true,
    imageUrl: true,
    phone: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  },
});

// Extract type
type CustomerBasicInfo = Prisma.customersGetPayload<typeof customerBasicInfo>;

// Serializable type (DateTime → string)
export type SerializableCustomerBasicInfo = Omit<
  CustomerBasicInfo,
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
};

/**
 * Convert Date fields to ISO strings for client serialization
 */
const serializeCustomer = (
  customer: CustomerBasicInfo
): SerializableCustomerBasicInfo => {
  return {
    ...customer,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  };
};

export class CustomerRepo {
  /**
   * Fetch customer basic information by Clerk user ID
   * @param clerkId - Clerk user ID
   */
  static async fetchCustomerByClerkId(
    clerkId: string
  ): Promise<SerializableCustomerBasicInfo | null> {
    if (!clerkId) {
      throw new Error("Clerk ID is required");
    }

    const customer = await db.customers.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        imageUrl: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      return null;
    }

    return serializeCustomer(customer);
  }

  /**
   * Fetch customer by internal database ID
   * @param id - Customer database ID
   */
  static async fetchCustomerById(
    id: string
  ): Promise<SerializableCustomerBasicInfo | null> {
    if (!id) {
      throw new Error("Customer ID is required");
    }

    const customer = await db.customers.findUnique({
      where: { id },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        imageUrl: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      return null;
    }

    return serializeCustomer(customer);
  }
}
