# Development Principles

This document outlines the core development principles and standards for this project. All code changes and AI-assisted development should follow these guidelines.

## Table of Contents

- [Data Model & Schema](#data-model--schema)
- [Repository Layer](#repository-layer)
- [Custom Hooks with SWR](#custom-hooks-with-swr)
- [URL State Management](#url-state-management)
- [Data Table & Pagination](#data-table--pagination)

---

## Data Model & Schema

### Strict Adherence to Prisma Schema

**Rule:** All data structures, types, and database operations MUST strictly follow the definitions in `prisma/schema.prisma`. This is the single source of truth for all data models.

**Why:**

- Ensures type safety across the entire application
- Prevents runtime errors from schema mismatches
- Maintains data integrity and consistency
- Enables better IDE support and autocomplete
- Simplifies debugging and maintenance

**Implementation:**

1. **Always check Prisma schema first:**

   Before creating any data-related feature, review the relevant model in `prisma/schema.prisma`:

   ```prisma
   // Example: coupons model
   model coupons {
     id          String      @id @default(uuid())
     code        String      @unique
     isActive    Boolean     @default(true)
     type        CouponType
     value       Decimal     @db.Decimal(10, 2)
     // ... other fields
   }
   ```

2. **Use Prisma-generated types:**

   ```typescript
   import { CouponType, coupons } from '@prisma/client';

   // ✅ Correct: Using Prisma types
   type Coupon = coupons;
   type CreateCouponData = {
     type: CouponType; // Enum from Prisma
     isActive: boolean; // Boolean from Prisma
   };

   // ❌ Wrong: Creating custom types that don't match schema
   type Coupon = {
     type: 'percentage' | 'fixed'; // Should use CouponType enum
     isActive: string; // Should be boolean
   };
   ```

3. **Verify field names and types:**

   ```typescript
   // Before creating a hook or component, verify in schema.prisma:
   // - Field name: isActive (not is_active or active)
   // - Field type: Boolean (not string)
   // - Default value: true
   // - Is it required or optional?

   const toggleData = {
     id: 'xxx',
     isActive: false // ✅ Matches schema exactly
   };
   ```

**Workflow:**

```
1. Check prisma/schema.prisma for the model
   ↓
2. Identify field names, types, and constraints
   ↓
3. Use these exact names/types in TypeScript code
   ↓
4. Import Prisma-generated types when available
```

**Do NOT:**

- ❌ Assume field names without checking schema
- ❌ Use different types than defined in Prisma
- ❌ Create custom types that contradict Prisma models
- ❌ Skip schema verification for "small" changes

**Example - Complete Workflow:**

```typescript
// Step 1: Check schema.prisma
// model coupons {
//   isActive Boolean @default(true)
// }

// Step 2: Import Prisma types
import { CouponType } from '@prisma/client';

// Step 3: Create types matching schema
export type ToggleCouponActiveData = {
  id: string;
  isActive: boolean; // ✅ Matches schema
};

// Step 4: Use in implementation
const toggle = async (data: ToggleCouponActiveData) => {
  await toggleCouponStatus(data.id, data.isActive);
};
```

---

## Repository Layer

### Centralized Data Operations

**Rule:** All database operations MUST go through the repository layer in `src/repositories/`. Before creating new hooks or features, ALWAYS check if the required repository methods exist.

**Why:**

- Centralizes data access logic
- Prevents duplicate database queries
- Enables easier testing and mocking
- Maintains consistent error handling
- Simplifies refactoring and optimization

**Implementation:**

1. **Check existing repository methods:**

   Before creating a new feature, search `src/repositories/` for existing methods:

   ```bash
   # Example: Looking for coupon operations
   ls src/repositories/coupons/
   # Check coupon.ts for available methods
   ```

2. **Use existing methods:**

   ```typescript
   // src/repositories/coupons/coupon.ts
   export async function toggleCouponStatus(id: string, isActive: boolean) {
     // Database operation
   }

   // In your hook
   import { toggleCouponStatus } from '@/repositories/coupons/coupon';

   const trigger = async (data: ToggleCouponActiveData) => {
     await toggleCouponStatus(data.id, data.isActive); // ✅ Use existing method
   };
   ```

3. **Create new repository methods if needed:**

   If the required method doesn't exist, add it to the appropriate repository file:

   ```typescript
   // src/repositories/coupons/coupon.ts
   'use server';

   import { db } from '@/lib/prisma';

   export async function toggleCouponStatus(id: string, isActive: boolean) {
     const coupon = await db.coupons.update({
       where: { id },
       data: { isActive }
     });

     // Serialize Decimal and Date types for client components
     return {
       ...coupon,
       value: Number(coupon.value),
       startDate: coupon.startDate.toISOString(),
       endDate: coupon.endDate.toISOString()
     };
   }
   ```

**Directory Structure:**

```
src/repositories/
├── index.ts
├── shared-type.ts
├── category/
├── coupons/
│   └── coupon.ts       # Coupon-related operations
├── customer/
├── product/
└── tag/
```

**Do NOT:**

- ❌ Call `db.model.findMany()` directly in components or hooks
- ❌ Duplicate database logic across multiple files
- ❌ Create repository methods without `'use server'` directive
- ❌ Skip checking for existing methods before creating new ones

**Workflow:**

```
1. Identify the data operation needed
   ↓
2. Check src/repositories/[model]/ for existing methods
   ↓
3a. If exists: Use the existing method
3b. If not: Create new method in repository
   ↓
4. Use repository method in hook/component
```

---

## Custom Hooks with SWR

### State Management for Data Operations

**Rule:** All data mutation hooks (create, update, delete, toggle, etc.) MUST use `useSWRMutation` to wrap repository functions. DO NOT manually manage loading and error states with `useState`.

**Why:**

- SWR automatically manages loading, error, and data states
- Provides consistent state management across all hooks
- Reduces boilerplate code
- Enables built-in cache invalidation
- Better type safety and error handling
- Prevents duplicate state management logic

**Implementation:**

1. **Standard hook structure with useSWRMutation:**

   ```typescript
   'use client';

   import useSWRMutation from 'swr/mutation';
   import { mutate } from 'swr';
   import { repositoryMethod } from '@/repositories/model/file';

   export type OperationData = {
     // Define based on Prisma schema
     id: string;
     field: Type;
   };

   export function useOperation() {
     const { trigger, isMutating, error, data, reset } = useSWRMutation(
       'operation-key', // Unique key for this mutation
       async (_key, { arg }: { arg: OperationData }) => {
         // Call repository method
         const result = await repositoryMethod(arg);

         // Invalidate related caches after successful mutation
         await mutate(
           (key) => typeof key === 'string' && key.startsWith('/api/models'),
           undefined,
           { revalidate: true }
         );

         await mutate(['models', { page: 1 }]);
         await mutate(['model', arg.id]);

         return result;
       }
     );

     return {
       trigger,       // Function to trigger the mutation
       isLoading: isMutating,  // Loading state from SWR
       error,         // Error from SWR
       data,          // Returned data from mutation
       reset          // Reset mutation state
     };
   }
   }
   ```

2. **Cache invalidation patterns:**

   ```typescript
   // Invalidate by API route pattern
   await mutate(
     (key) => typeof key === 'string' && key.startsWith('/api/coupons'),
     undefined,
     { revalidate: true }
   );

   // Invalidate specific list query
   await mutate(['coupons', { page: 1 }]);

   // Invalidate specific item
   await mutate(['coupon', couponId]);
   ```

3. **Usage in components:**

   ```typescript
   const { trigger, isLoading, error, data } = useActiveCoupon();

   const handleToggle = async () => {
     try {
       await trigger({
         id: coupon.id,
         isActive: !coupon.isActive
       });
       toast.success('状态已更新');
     } catch (err) {
       toast.error('操作失败');
     }
   };

   return (
     <Button onClick={handleToggle} disabled={isLoading}>
       {isLoading ? 'Processing...' : 'Toggle'}
     </Button>
   );
   ```

**Required Return Values:**

| Property    | Type                           | Purpose                     |
| ----------- | ------------------------------ | --------------------------- |
| `trigger`   | `(data: T) => Promise<Result>` | Execute the mutation        |
| `isLoading` | `boolean` (from `isMutating`)  | Loading state from SWR      |
| `error`     | `Error \| null`                | Error from SWR              |
| `data`      | `Result \| undefined`          | Returned data from mutation |
| `reset`     | `() => void`                   | Reset mutation state        |

**Do NOT:**

- ❌ Use `useState` to manually manage loading/error states
- ❌ Skip using `useSWRMutation` for mutation operations
- ❌ Manually handle try/catch for state management (let SWR handle it)
- ❌ Skip cache invalidation after mutations
- ❌ Use inconsistent return value names

**Complete Example - Toggle Coupon Active:**

```typescript
// src/features/coupon/hook/use-active-coupon.ts
'use client';

import useSWRMutation from 'swr/mutation';
import { toggleCouponStatus } from '@/repositories/coupons/coupon';
import { mutate } from 'swr';

export type ToggleCouponActiveData = {
  id: string;
  isActive: boolean;
};

export function useActiveCoupon() {
  const { trigger, isMutating, error, data, reset } = useSWRMutation(
    'toggle-coupon-status',
    async (_key, { arg }: { arg: ToggleCouponActiveData }) => {
      const result = await toggleCouponStatus(arg.id, arg.isActive);

      // Invalidate related caches after successful mutation
      await mutate(
        (key) => typeof key === 'string' && key.startsWith('/api/coupons'),
        undefined,
        { revalidate: true }
      );

      await mutate(['coupons', { page: 1 }]);
      await mutate(['coupon', arg.id]);

      return result;
    }
  );

  return {
    trigger,
    isLoading: isMutating,
    error,
    data,
    reset
  };
}
```

**Workflow Summary:**

```
1. Check prisma/schema.prisma for data model
   ↓
2. Check src/repositories/ for existing methods
   ↓
3. Wrap repository method with useSWRMutation
   ↓
4. Return SWR-provided states (trigger, isMutating, error, data)
   ↓
5. Invalidate relevant caches after mutation
```

---

## URL State Management

### Pagination with nuqs

**Rule:** All pagination features MUST use the `nuqs` library for URL query state management.

**Why:**

- Ensures URL state synchronization
- Enables shareable links with page state
- Maintains browser history correctly
- Provides type-safe query parameter handling

**Implementation:**

1. **Install nuqs:**

   ```bash
   pnpm add nuqs
   ```

2. **Import required hooks:**

   ```typescript
   import { useQueryState, parseAsInteger } from 'nuqs';
   import { useEffect } from 'react';
   ```

3. **Setup page state:**

   ```typescript
   // clearOnDefault: false ensures page=1 always shows in URL
   const [page, setPage] = useQueryState(
     'page',
     parseAsInteger.withDefault(1).withOptions({ clearOnDefault: false })
   );

   // Force page=1 to appear in URL on initial load
   useEffect(() => {
     if (!window.location.search.includes('page=')) {
       setPage(1);
     }
   }, [setPage]);
   ```

4. **Update page state:**
   ```typescript
   // When user clicks next/previous
   <Button onClick={() => setPage(page + 1)}>Next</Button>
   <Button onClick={() => setPage(page - 1)}>Previous</Button>
   ```

**Complete Example:**

```typescript
'use client';

import { useQueryState, parseAsInteger } from 'nuqs';
import { useEffect } from 'react';

const ListView = () => {
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: false })
  );

  useEffect(() => {
    if (!window.location.search.includes('page=')) {
      setPage(1);
    }
  }, [setPage]);

  // Use page state for data fetching
  const { data } = useFetchData({ page });

  return (
    <div>
      {/* Your list content */}
      <Button onClick={() => setPage(page - 1)}>Previous</Button>
      <Button onClick={() => setPage(page + 1)}>Next</Button>
    </div>
  );
};
```

**Do NOT:**

- ❌ Use plain `useState` for pagination
- ❌ Manage page state without URL synchronization
- ❌ Skip the initial `useEffect` hook (page=1 won't show in URL)

**Additional Query Parameters:**

For other URL state (search, filters, etc.), also use nuqs:

```typescript
// Search query
const [search, setSearch] = useQueryState('search');

// Status filter
const [status, setStatus] = useQueryState(
  'status',
  parseAsStringLiteral(['active', 'inactive', 'all'] as const)
);

// Multiple states at once
const { page, search, status } = useQueryStates({
  page: parseAsInteger.withDefault(1),
  search: parseAsString.withDefault(''),
  status: parseAsStringLiteral(['active', 'inactive', 'all'] as const)
});
```

---

## Data Table & Pagination

### Server-Side Pagination (Required)

**Rule:** All data tables with pagination MUST use server-side pagination. DO NOT use TanStack Table's client-side pagination features (`getPaginationRowModel`).

**Why:**

- Reduces initial page load time
- Minimizes memory usage on client
- Handles large datasets efficiently
- Prevents fetching unnecessary data
- Better performance for users with slow connections

**Implementation:**

1. **Fetch only current page data from server:**

   ```typescript
   const { items, total, totalPages } = useFetchData({ page, pageSize: 10 });
   ```

2. **Setup TanStack Table WITHOUT pagination:**

   ```typescript
   const table = useReactTable({
     data: items,
     columns,
     getCoreRowModel: getCoreRowModel(),
     getSortedRowModel: getSortedRowModel(),
     getFilteredRowModel: getFilteredRowModel()
     // ❌ DO NOT use getPaginationRowModel()
   });
   ```

3. **Use nuqs for page state (see [URL State Management](#url-state-management)):**

   ```typescript
   const [page, setPage] = useQueryState(
     'page',
     parseAsInteger.withDefault(1).withOptions({ clearOnDefault: false })
   );
   ```

4. **Handle pagination with server state:**
   ```typescript
   <Button
     onClick={() => setPage(page + 1)}
     disabled={page >= totalPages}
   >
     Next
   </Button>
   ```

**Complete Example:**

```typescript
'use client';

import { useQueryState, parseAsInteger } from 'nuqs';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';

const DataTable = () => {
  // URL state for page
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: false })
  );

  // Fetch ONLY current page data
  const { items, total, totalPages, isLoading } = useFetchData({
    page,
    pageSize: 10
  });

  // TanStack Table without client-side pagination
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel()
    // No getPaginationRowModel()
  });

  return (
    <div>
      <Table>
        {/* Table rendering */}
      </Table>

      {/* Server-side pagination controls */}
      <div>
        <span>Page {page} of {totalPages} ({total} total items)</span>
        <Button
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <Button
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
```

**Do NOT:**

- ❌ Use `getPaginationRowModel()` from TanStack Table
- ❌ Fetch all data and paginate on client side
- ❌ Use `table.nextPage()` or `table.previousPage()`
- ❌ Use `table.getState().pagination`
- ❌ Mix client-side and server-side pagination

**Repository Pattern:**

Your data fetching function should support pagination parameters:

```typescript
// repositories/example/example.ts
export async function getItems(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  const { page = 1, pageSize = 10, search } = params;

  const [items, total] = await Promise.all([
    db.items.findMany({
      where: search ? { name: { contains: search } } : {},
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    }),
    db.items.count({
      where: search ? { name: { contains: search } } : {}
    })
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}
```

---

## Future Principles

Additional development principles will be added here as the project evolves.

---

**Last Updated:** 2025-12-24
