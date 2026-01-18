# Development Principles & Code Templates

This document defines the development principles and code templates for the project to ensure code consistency and maintainability.

## Table of Contents

- [Architecture: Client vs Server](#architecture-client-vs-server)
- [Data Fetching Hooks](#data-fetching-hooks)
- [Prisma Type Extraction](#prisma-type-extraction)
- [General Principles](#general-principles)

---

## Architecture: Client vs Server

### Critical Rule: Never Use Prisma in Client Components

**⚠️ IMPORTANT**: Prisma Client can ONLY run on the server. Never import or use Prisma directly in client components or hooks.

#### The Problem

```typescript
// ❌ WRONG: This will cause "PrismaClient is unable to run in this browser environment" error
"use client";

import { OrderRepo } from "@/repo/order.repo"; // ❌ Uses Prisma internally

export const useOrders = () => {
  const { data } = useSWR("orders", async () => {
    return await OrderRepo.fetchOrders(); // ❌ Prisma runs in browser!
  });
  return { data };
};
```

#### The Solution: Use Server Actions

**Three-Layer Architecture:**

1. **Repository Layer** (Server-only) → Uses Prisma
2. **Server Action Layer** (Server-only) → Calls Repository
3. **Hook Layer** (Client) → Calls Server Action

#### Step 1: Repository (Server-only)

```typescript
// repo/order.repo.ts
import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const orderWithItems = Prisma.validator<Prisma.ordersDefaultArgs>()({
  include: {
    order_items: true,
  },
});

export type OrderWithItems = Prisma.ordersGetPayload<typeof orderWithItems>;

export class OrderRepo {
  static async fetchOrdersByUserId(userId: string): Promise<OrderWithItems[]> {
    const customer = await db.customers.findUnique({
      where: { clerkId: userId },
    });

    if (!customer) {
      throw new Error(`Customer with clerkId ${userId} not found`);
    }

    return await db.orders.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      include: {
        order_items: true,
      },
    });
  }
}
```

#### Step 2: Server Action (Server-only)

```typescript
// app/actions/order.action.ts
"use server";

import { OrderRepo } from "@/repo/order.repo";
import { currentUser } from "@clerk/nextjs/server";

export const fetchUserOrdersAction = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "User not authenticated", data: null };
    }

    const orders = await OrderRepo.fetchOrdersByUserId(user.id);

    return { data: orders, error: null };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to fetch orders",
      data: null,
    };
  }
};
```

#### Step 3: Hook (Client)

```typescript
// feature/dashboard/hook/use-overview.ts
"use client";

import { fetchUserOrdersAction } from "@/app/actions";
import useSWR from "swr";

export const useOverview = () => {
  const { data, error, isLoading, mutate } = useSWR(
    "dashboard/overview",
    async () => {
      const result = await fetchUserOrdersAction();

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data;
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};
```

### Rules to Follow

#### ✅ MUST DO

1. **Always use Server Actions** for database access in client components
2. **Mark Server Actions with `"use server"`** at the top of the file
3. **Mark client hooks with `"use client"`** at the top of the file
4. **Return error objects** from Server Actions, don't throw directly
5. **Handle authentication** in Server Actions using `currentUser()` from Clerk
6. **Export Server Actions** from `app/actions/index.ts` for centralized imports

#### ❌ MUST NOT DO

1. ❌ **Never import Prisma or Repository** directly in client components or hooks
2. ❌ **Never use `useAuth()`** in Repository methods (it's a client-only hook)
3. ❌ **Never call database queries** directly from client-side code
4. ❌ **Never use `db` (Prisma Client)** in files marked with `"use client"`

### Server Action Template

```typescript
// app/actions/[entity].action.ts
"use server";

import { [Entity]Repo } from "@/repo/[entity].repo";
import { currentUser } from "@clerk/nextjs/server";

export const fetch[Entity]Action = async () => {
  try {
    // 1. Get current user
    const user = await currentUser();

    if (!user) {
      return { error: "User not authenticated", data: null };
    }

    // 2. Call repository
    const data = await [Entity]Repo.fetchByUserId(user.id);

    // 3. Return success
    return { data, error: null };
  } catch (error) {
    // 4. Handle errors
    console.error("Error fetching [entity]:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to fetch [entity]",
      data: null,
    };
  }
};
```

### File Organization

```
app/
  actions/
    index.ts                    # Export all actions
    order.action.ts             # Order-related actions
    product.action.ts           # Product-related actions
    cart.action.ts              # Cart-related actions
repo/
  order.repo.ts                 # Server-only, uses Prisma
  product.repo.ts               # Server-only, uses Prisma
feature/
  dashboard/
    hook/
      use-overview.ts           # Client hook, calls Server Action
```

### Handling Prisma Decimal Types

**Problem**: Prisma's `Decimal` type cannot be serialized and passed to client components. You'll get an error:

```
Only plain objects can be passed to Client Components from Server Components.
Decimal objects are not supported.
```

**Solution**: Convert `Decimal` to `number` in the Repository before returning data.

#### Pattern: Serialization Helper

```typescript
// repo/order.repo.ts
import { Prisma } from "@prisma/client";

// Step 1: Define Prisma query structure
const orderWithItems = Prisma.validator<Prisma.ordersDefaultArgs>()({
  include: {
    order_items: true,
  },
});

type OrderWithItems = Prisma.ordersGetPayload<typeof orderWithItems>;

// Step 2: Define serializable type (Decimal → number)
export type SerializableOrderWithItems = Omit<
  OrderWithItems,
  | "subtotal"
  | "shippingCost"
  | "tax"
  | "discount"
  | "total"
  | "refundAmount"
  | "order_items"
> & {
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  refundAmount: number | null;
  order_items: Array<
    Omit<OrderWithItems["order_items"][number], "price" | "total"> & {
      price: number;
      total: number;
    }
  >;
};

// Step 3: Create serialization helper
const serializeOrder = (order: OrderWithItems): SerializableOrderWithItems => {
  return {
    ...order,
    subtotal: order.subtotal.toNumber(),
    shippingCost: order.shippingCost.toNumber(),
    tax: order.tax.toNumber(),
    discount: order.discount.toNumber(),
    total: order.total.toNumber(),
    refundAmount: order.refundAmount?.toNumber() ?? null,
    order_items: order.order_items.map((item) => ({
      ...item,
      price: item.price.toNumber(),
      total: item.total.toNumber(),
    })),
  };
};

// Step 4: Use in repository method
export class OrderRepo {
  static async fetchOrdersByUserId(
    userId: string
  ): Promise<SerializableOrderWithItems[]> {
    const orders = await db.orders.findMany({
      where: { customerId: userId },
      include: {
        order_items: true,
      },
    });

    // Convert Decimal to number for client serialization
    return orders.map(serializeOrder);
  }
}
```

#### Rules for Decimal Serialization

✅ **MUST DO**:

1. **Always convert `Decimal` to `number`** before returning from Repository
2. **Create a serializable type** that replaces `Decimal` with `number`
3. **Use `.toNumber()` method** to convert Prisma Decimal to JavaScript number
4. **Handle nullable Decimals** with `?.toNumber() ?? null`
5. **Convert nested Decimals** in related models (e.g., `order_items`)

❌ **MUST NOT DO**:

1. ❌ Don't return Prisma `Decimal` types directly from Repository
2. ❌ Don't try to serialize `Decimal` in Server Actions (do it in Repository)
3. ❌ Don't forget to update related/nested objects
4. ❌ Don't use `.toString()` unless you specifically need string representation

#### Common Decimal Fields to Convert

Based on your Prisma schema:

- **Orders**: `subtotal`, `shippingCost`, `tax`, `discount`, `total`, `refundAmount`
- **Order Items**: `price`, `total`
- **Products/Variants**: `price`, `discountPrice`, `costPrice`
- **Any monetary values** using `@db.Decimal(10, 2)`

---

## Data Fetching Hooks

### Core Principles

All custom hooks for data fetching should follow a unified pattern and structure to ensure:

- **Consistency**: All hooks are used in the same way
- **Predictability**: Developers can easily understand and use any data fetching hook
- **Maintainability**: Unified structure facilitates code review and maintenance
- **Type Safety**: Use TypeScript to ensure type safety

### File Organization: Global vs Feature-Specific Hooks

**Critical Decision**: Where to place your hooks depends on their scope of use.

#### Global Hooks → `hooks/` Directory

Place hooks in the root `hooks/` directory when they:

- ✅ Are used across multiple features/pages
- ✅ Fetch global application data (current user, app settings, etc.)
- ✅ Provide shared functionality needed throughout the app

**Examples:**

```
hooks/
  index.ts
  use-customer.ts          # ✅ Current user info - used everywhere
  use-cart.ts              # ✅ Shopping cart - used in multiple features
  use-auth.ts              # ✅ Authentication state - global
  product.hook.ts          # ✅ Product queries - used in multiple pages
```

#### Feature-Specific Hooks → `feature/[name]/hook/` Directory

Place hooks in feature directories when they:

- ✅ Are only used within a specific feature
- ✅ Contain feature-specific business logic
- ✅ Are tightly coupled to a particular feature's components

**Examples:**

```
feature/
  dashboard/
    hook/
      use-overview.ts      # ✅ Only used in dashboard overview
      use-order-stats.ts   # ✅ Dashboard-specific statistics
  checkout/
    hook/
      use-payment.ts       # ✅ Only used in checkout flow
      use-shipping.ts      # ✅ Checkout-specific logic
```

#### Decision Matrix

Ask yourself: **"Will this hook be used outside the current feature?"**

- **YES** → Place in `hooks/` (global)
- **NO** → Place in `feature/[name]/hook/` (feature-specific)

**Example: useCustomer**

```typescript
// ❌ WRONG: Don't put global hooks in feature directories
// feature/dashboard/hook/use-customer.ts

// ✅ CORRECT: Global hooks in root hooks directory
// hooks/use-customer.ts
"use client";

import { fetchCurrentCustomerAction } from "@/app/actions";
import type { SerializableCustomerBasicInfo } from "@/repo/customer.repo";
import useSWR from "swr";

export const useCustomer = () => {
  const { data, error, isLoading, mutate } =
    useSWR<SerializableCustomerBasicInfo | null>(
      "current-customer",
      async () => {
        const result = await fetchCurrentCustomerAction();
        if (result.error) {
          throw new Error(result.error);
        }
        return result.data;
      }
    );

  return { data, error, isLoading, mutate };
};
```

#### Import Patterns

```typescript
// ✅ Global hooks - import from @/hooks
import { useCustomer, useCart } from "@/hooks";

// ✅ Feature-specific hooks - import from relative path
import { useOverview } from "../hook";
import { useOrderStats } from "../hook/use-order-stats";
```

### Standard Template

All custom hooks for data fetching should follow a unified pattern and structure to ensure:

- **Consistency**: All hooks are used in the same way
- **Predictability**: Developers can easily understand and use any data fetching hook
- **Maintainability**: Unified structure facilitates code review and maintenance
- **Type Safety**: Use TypeScript to ensure type safety

### Standard Template

Reference implementation: [feature/dashboard/hook/use-overview.ts](feature/dashboard/hook/use-overview.ts)

```typescript
import useSWR from "swr";

// 1. Define data type interface
interface [EntityName]Data {
  // Define the structure of returned data
}

// 2. Define hook parameters interface (if needed)
interface Use[EntityName]Params {
  // Define parameters that the hook receives
}

// 3. Export the hook
export const use[EntityName] = (params?: Use[EntityName]Params) => {
  // 4. Use SWR for data fetching
  const { data, error, isLoading, mutate } = useSWR<[EntityName]Data>(
    // SWR Key - used for cache identification
    "[unique-key-for-this-data]",
    // Fetcher function
    async () => {
      // Implement data fetching logic
      // Can be API calls, database queries, etc.
      return {} as [EntityName]Data;
    }
  );

  // 5. Return standard object
  return {
    data,      // Fetched data
    error,     // Error information
    isLoading, // Loading state
    mutate,    // Function to revalidate/update data
  };
};
```

### Practical Examples

#### Example 1: useOverview

```typescript
import useSWR from "swr";

interface OverviewData {}

export const useOverview = () => {
  const { data, error, isLoading, mutate } = useSWR<OverviewData>(
    "path/to/overview/data",
    async () => {
      return {};
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};
```

#### Example 2: useUserProfile (with parameters)

```typescript
import useSWR from "swr";

interface UserProfileData {
  id: string;
  name: string;
  email: string;
}

interface UseUserProfileParams {
  userId: string;
}

export const useUserProfile = ({ userId }: UseUserProfileParams) => {
  const { data, error, isLoading, mutate } = useSWR<UserProfileData>(
    userId ? `user/profile/${userId}` : null, // Conditional fetching
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};
```

#### Example 3: useProductList (with query parameters)

```typescript
import useSWR from "swr";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ProductListData {
  products: Product[];
  total: number;
}

interface UseProductListParams {
  category?: string;
  page?: number;
  limit?: number;
}

export const useProductList = (params?: UseProductListParams) => {
  const { category, page = 1, limit = 10 } = params || {};

  // Build query key
  const queryKey = category
    ? `products?category=${category}&page=${page}&limit=${limit}`
    : `products?page=${page}&limit=${limit}`;

  const { data, error, isLoading, mutate } = useSWR<ProductListData>(
    queryKey,
    async () => {
      const response = await fetch(`/api/${queryKey}`);
      return response.json();
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};
```

### Naming Conventions

1. **Hook Names**: Use `use[EntityName]` format

   - ✅ `useOverview`, `useUserProfile`, `useProductList`
   - ❌ `getOverview`, `fetchUserProfile`, `OverviewHook`

2. **File Names**: Use kebab-case format, corresponding to hook name

   - ✅ `use-overview.ts`, `use-user-profile.ts`, `use-product-list.ts`
   - ❌ `useOverview.ts`, `overview.hook.ts`, `OverviewHook.ts`

3. **Data Interfaces**: Use `[EntityName]Data` format

   - ✅ `OverviewData`, `UserProfileData`, `ProductListData`
   - ❌ `Overview`, `UserResponse`, `ProductsInterface`

4. **Parameter Interfaces**: Use `Use[EntityName]Params` format
   - ✅ `UseUserProfileParams`, `UseProductListParams`
   - ❌ `UserProfileOptions`, `ProductListProps`

### Rules to Follow

#### ✅ DO

1. **Use SWR** for data fetching and cache management
2. **Define TypeScript interfaces** for data and parameters
3. **Return standard object** containing `{ data, error, isLoading, mutate }`
4. **Use meaningful SWR keys** to ensure cache correctness
5. **Handle conditional fetching** using `null` as key when parameters are missing
6. **Export hooks** using `export const` declaration

#### ❌ DON'T

1. ❌ Don't manage additional state inside hooks (unless necessary)
2. ❌ Don't handle UI logic inside hooks
3. ❌ Don't hardcode API URLs (use environment variables or configuration)
4. ❌ Don't ignore error handling
5. ❌ Don't return inconsistent object structures
6. ❌ Don't use `any` type, always define explicit types

### SWR Key Best Practices

```typescript
// ✅ Good examples
const key = userId ? `user/${userId}` : null;
const key = `products?page=${page}&limit=${limit}`;
const key = ["user", userId, "posts"]; // Array-form key

// ❌ Examples to avoid
const key = "data"; // Too generic
const key = Math.random().toString(); // Random keys break caching
```

### Error Handling Example

```typescript
export const useUserProfile = ({ userId }: UseUserProfileParams) => {
  const { data, error, isLoading, mutate } = useSWR<UserProfileData>(
    userId ? `user/profile/${userId}` : null,
    async () => {
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }

      return response.json();
    },
    {
      // SWR configuration options
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 3,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};
```

### Usage in Components

```typescript
// Using the hook in a component
function UserProfileComponent() {
  const { data, error, isLoading, mutate } = useUserProfile({
    userId: "123",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
      <button onClick={() => mutate()}>Refresh</button>
    </div>
  );
}
```

---

## Prisma Type Extraction

### Core Principles

**REQUIRED**: When working with Prisma, you MUST always extract and define proper types for your query results to ensure type safety throughout the application.

**Standard Pattern**: Always use the two-step approach with `Prisma.validator` + `Prisma.GetPayload`:

```typescript
// Step 1: Define query structure with validator
const orderWithItems = Prisma.validator<Prisma.ordersDefaultArgs>()({
  include: {
    order_items: true,
  },
});

// Step 2: Extract the type
type OrderWithItems = Prisma.ordersGetPayload<typeof orderWithItems>;
```

This two-step pattern is concise, type-safe, and ensures consistency across the codebase.

Reference implementation: [repo/order.repo.ts](repo/order.repo.ts)
Additional examples: [types/prisma-types-examples.ts](types/prisma-types-examples.ts)

### Why This Matters

1. **Type Safety**: Get full TypeScript intellisense and compile-time checks
2. **Consistency**: Ensure the same data structure across repositories, hooks, and components
3. **Documentation**: Types serve as living documentation for data structure
4. **Refactoring**: Easier to refactor when database schema or query structure changes
5. **Reusability**: Share type definitions across different parts of the application

### Mandatory Approach: Prisma.validator + GetPayload

**This is the REQUIRED standard for all Prisma queries in this project.**

```typescript
import { Prisma } from "@prisma/client";

// ✅ ALWAYS use this pattern

// Step 1: Define the query structure using validator
const orderWithItems = Prisma.validator<Prisma.ordersDefaultArgs>()({
  include: {
    order_items: true,
  },
});

// Step 2: Extract the type
type OrderWithItems = Prisma.ordersGetPayload<typeof orderWithItems>;

// Step 3: Use in repository with explicit return type
export class OrderRepo {
  static async fetchOrdersByUserId(): Promise<OrderWithItems[]> {
    const orders = await db.orders.findMany({
      include: {
        order_items: true,
      },
    });
    return orders;
  }
}
```

### Why This Pattern?

✅ **Advantages**:

- **Single source of truth**: Query structure is defined once
- **Reusable**: Can reference `orderWithItems` in multiple places
- **Clear separation**: Structure definition separate from type extraction
- **IntelliSense friendly**: Full autocomplete support
- **Refactor-safe**: Change the query structure, type updates automatically

❌ **Avoid inline definitions**:

```typescript
// ❌ DON'T: Inline type definition (less maintainable)
type OrderWithItems = Prisma.ordersGetPayload<{
  include: { order_items: true };
}>;
```

### Complete Repository Pattern

Here's the complete pattern for creating a repository method with Prisma:

```typescript
import { Prisma } from "@prisma/client";
import { db } from "@/lib/prisma";

// 1. Define query structure at the top of the file
const userWithOrdersAndCart = Prisma.validator<Prisma.customersDefaultArgs>()({
  include: {
    orders: {
      include: {
        order_items: true,
      },
    },
    carts: {
      include: {
        items: {
          include: {
            variant: true,
          },
        },
      },
    },
  },
});

// 2. Extract the type
type UserWithOrdersAndCart = Prisma.customersGetPayload<
  typeof userWithOrdersAndCart
>;

// 3. Use in repository class
export class UserRepo {
  static async getUserProfile(
    userId: string
  ): Promise<UserWithOrdersAndCart | null> {
    return await db.customers.findUnique({
      where: { id: userId },
      include: {
        orders: {
          include: {
            order_items: true,
          },
        },
        carts: {
          include: {
            items: {
              include: {
                variant: true,
              },
            },
          },
        },
      },
    });
  }
}
```

### File Organization

**Location**: Define query structures and types at the top of repository files, before the class definition.

```typescript
// repo/product.repo.ts

import { Prisma } from "@prisma/client";
import { db } from "@/lib/prisma";

// ✅ Define all query structures at the top
const productWithVariants = Prisma.validator<Prisma.productsDefaultArgs>()({
  include: {
    variants: true,
    product_images: true,
  },
});

const productFullDetails = Prisma.validator<Prisma.productsDefaultArgs>()({
  include: {
    variants: {
      include: {
        variant_images: true,
      },
    },
    product_images: true,
    categories: {
      include: {
        categories: true,
      },
    },
    reviews: true,
  },
});

// Extract types
type ProductWithVariants = Prisma.productsGetPayload<
  typeof productWithVariants
>;
type ProductFullDetails = Prisma.productsGetPayload<typeof productFullDetails>;

// Then define repository class
export class ProductRepo {
  static async getProduct(id: string): Promise<ProductFullDetails | null> {
    // Implementation
  }

  static async listProducts(): Promise<ProductWithVariants[]> {
    // Implementation
  }
}
```

### Using Select for Specific Fields

When you need only specific fields (not the entire model), use `select` instead of `include`:

```typescript
// Define structure with select
const orderSummary = Prisma.validator<Prisma.ordersDefaultArgs>()({
  select: {
    id: true,
    orderNumber: true,
    total: true,
    status: true,
    customers: {
      select: {
        firstName: true,
        lastName: true,
      },
    },
  },
});

// Extract type
type OrderSummary = Prisma.ordersGetPayload<typeof orderSummary>;
```

### Naming Conventions

1. **Validator Constant Names**: Use camelCase with descriptive relation names

   - ✅ `orderWithItems`, `productWithVariants`, `customerWithOrders`
   - ❌ `order1`, `productQuery`, `data`

2. **Type Names**: Use PascalCase matching the constant name

   - ✅ `OrderWithItems`, `ProductWithVariants`, `CustomerWithOrders`
   - ❌ `Order1`, `ProductType`, `CustomerData`

3. **Consistency**: The type name should match the validator constant

   ```typescript
   // ✅ Good: Names match
   const orderWithItems = Prisma.validator<Prisma.ordersDefaultArgs>()({ ... });
   type OrderWithItems = Prisma.ordersGetPayload<typeof orderWithItems>;

   // ❌ Bad: Names don't match
   const orderQuery = Prisma.validator<Prisma.ordersDefaultArgs>()({ ... });
   type OrderData = Prisma.ordersGetPayload<typeof orderQuery>;
   ```

### Integration with Hooks

When using these types in data fetching hooks, the pattern ensures type consistency:

```typescript
// repo/order.repo.ts
const orderWithItems = Prisma.validator<Prisma.ordersDefaultArgs>()({
  include: {
    order_items: true,
  },
});

type OrderWithItems = Prisma.ordersGetPayload<typeof orderWithItems>;

export class OrderRepo {
  static async fetchOrdersByUserId(userId: string): Promise<OrderWithItems[]> {
    // Implementation
  }
}

// hooks/use-orders.ts
import { OrderWithItems } from "@/repo/order.repo";

export const useOrders = (userId: string) => {
  const { data, error, isLoading, mutate } = useSWR<OrderWithItems[]>(
    userId ? `orders/${userId}` : null,
    () => OrderRepo.fetchOrdersByUserId(userId)
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};
```

### Rules to Follow

#### ✅ MUST DO

1. **Always use the two-step pattern** for ALL Prisma queries:

   ```typescript
   const queryStructure = Prisma.validator<Prisma.[model]DefaultArgs>()({ ... });
   type TypeName = Prisma.[model]GetPayload<typeof queryStructure>;
   ```

2. **Define at the top of repository files** before class definitions

3. **Export types** so they can be used in hooks and components

4. **Match names** between validator constant (camelCase) and type (PascalCase)

5. **Add explicit return types** to repository methods using the extracted type

6. **Keep query structure DRY**: Define once, use everywhere

#### ❌ MUST NOT DO

1. ❌ **Never use inline type definitions**

   ```typescript
   // ❌ DON'T DO THIS
   type OrderWithItems = Prisma.ordersGetPayload<{
     include: { order_items: true };
   }>;
   ```

2. ❌ **Never skip type extraction** - always define types for Prisma queries

3. ❌ **Never use `any` or generic types** for Prisma results

4. ❌ **Never manually define types** that Prisma can generate

5. ❌ **Never duplicate query structures** - define once and reuse

6. ❌ **Never forget return type annotations** on repository methods

### Real-World Examples

#### Example 1: Simple Query with Relations

```typescript
// repo/order.repo.ts
import { Prisma } from "@prisma/client";
import { db } from "@/lib/prisma";

// Define query structure
const orderWithItems = Prisma.validator<Prisma.ordersDefaultArgs>()({
  include: {
    order_items: true,
  },
});

// Extract type
type OrderWithItems = Prisma.ordersGetPayload<typeof orderWithItems>;

export class OrderRepo {
  static async fetchOrdersByUserId(userId: string): Promise<OrderWithItems[]> {
    const orders = await db.orders.findMany({
      where: { customerId: userId },
      include: {
        order_items: true,
      },
    });
    return orders;
  }
}
```

#### Example 2: Complex Nested Relations

```typescript
// repo/order.repo.ts
import { Prisma } from "@prisma/client";
import { db } from "@/lib/prisma";

// Define complex query structure
const orderFullDetails = Prisma.validator<Prisma.ordersDefaultArgs>()({
  include: {
    order_items: {
      include: {
        variant: {
          include: {
            products: true,
          },
        },
      },
    },
    customers: true,
    addresses: true,
  },
});

// Extract type
type OrderFullDetails = Prisma.ordersGetPayload<typeof orderFullDetails>;

export class OrderRepo {
  static async getOrderById(id: string): Promise<OrderFullDetails | null> {
    return await db.orders.findUnique({
      where: { id },
      include: {
        order_items: {
          include: {
            variant: {
              include: {
                products: true,
              },
            },
          },
        },
        customers: true,
        addresses: true,
      },
    });
  }
}
```

#### Example 3: Multiple Query Types in One File

```typescript
// repo/product.repo.ts
import { Prisma } from "@prisma/client";
import { db } from "@/lib/prisma";

// Query 1: Basic product with variants
const productWithVariants = Prisma.validator<Prisma.productsDefaultArgs>()({
  include: {
    variants: true,
    product_images: true,
  },
});

type ProductWithVariants = Prisma.productsGetPayload<
  typeof productWithVariants
>;

// Query 2: Full product details
const productFullDetails = Prisma.validator<Prisma.productsDefaultArgs>()({
  include: {
    variants: true,
    product_images: true,
    categories: {
      include: {
        categories: true,
      },
    },
    reviews: {
      include: {
        customers: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    },
  },
});

type ProductFullDetails = Prisma.productsGetPayload<typeof productFullDetails>;

// Query 3: Product list item (minimal data)
const productListItem = Prisma.validator<Prisma.productsDefaultArgs>()({
  select: {
    id: true,
    name: true,
    slug: true,
    thumbnail: true,
    avgRating: true,
    reviewCount: true,
    variants: {
      select: {
        price: true,
        discountPrice: true,
      },
      take: 1,
    },
  },
});

type ProductListItem = Prisma.productsGetPayload<typeof productListItem>;

// Repository class using all three types
export class ProductRepo {
  static async listProducts(): Promise<ProductListItem[]> {
    return await db.products.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        thumbnail: true,
        avgRating: true,
        reviewCount: true,
        variants: {
          select: {
            price: true,
            discountPrice: true,
          },
          take: 1,
        },
      },
    });
  }

  static async getProduct(slug: string): Promise<ProductFullDetails | null> {
    return await db.products.findUnique({
      where: { slug },
      include: {
        variants: true,
        product_images: true,
        categories: {
          include: {
            categories: true,
          },
        },
        reviews: {
          include: {
            customers: {
              select: {
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  }

  static async getProductWithVariants(
    id: string
  ): Promise<ProductWithVariants | null> {
    return await db.products.findUnique({
      where: { id },
      include: {
        variants: true,
        product_images: true,
      },
    });
  }
}
```

### Summary

**The Two-Step Pattern is Mandatory:**

```typescript
// Step 1: Validator
const [queryName] = Prisma.validator<Prisma.[model]DefaultArgs>()({
  // query structure
});

// Step 2: Type Extraction
type [TypeName] = Prisma.[model]GetPayload<typeof [queryName]>;
```

This ensures:

- ✅ Type safety across the entire application
- ✅ Single source of truth for query structure
- ✅ Easy refactoring when schema changes
- ✅ Clear, maintainable code
- ✅ Reusable types in hooks and components

---

## General Principles

### File Organization

- **Feature-first**: Organize code by feature modules (feature-based structure)
- **Clear hierarchy**: Each feature module contains subdirectories like `components/`, `hooks/`, `views/`
- **Single responsibility**: Each file is responsible for one clear functionality

### TypeScript

- **Strict typing**: Always use strict TypeScript types
- **Avoid any**: Don't use `any` type unless absolutely necessary
- **Interface first**: Prefer `interface` over `type` (unless advanced features like union types are needed)

### Import/Export

```typescript
// ✅ Use named exports
export const useOverview = () => { ... };
export interface OverviewData { ... };

// ✅ Centralized exports (in index.ts)
export { useOverview } from './use-overview';
export { useUserProfile } from './use-user-profile';
```

---

## Changelog

- **2026-01-05**: Initial version, defined Data Fetching Hooks template and principles
