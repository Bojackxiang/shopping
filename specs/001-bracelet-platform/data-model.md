# Data Model: Bracelet Shopping Platform

**Created**: 2025-11-05
**Feature**: Bracelet Shopping Platform
**Purpose**: Define data entities, relationships, and validation rules for the e-commerce platform

## Core Entities

### User

Represents both customers and admin users with role-based access.

**Fields**:

- `id`: UUID (Primary Key)
- `email`: String (Unique, Required)
- `name`: String (Required)
- `role`: Enum (CUSTOMER, ADMIN) (Required)
- `passwordHash`: String (Required)
- `emailVerified`: DateTime (Optional)
- `image`: String (Optional) - Profile avatar URL
- `createdAt`: DateTime (Auto-generated)
- `updatedAt`: DateTime (Auto-generated)

**Relationships**:

- One-to-many with Orders (as customer)
- One-to-many with CustomerAddresses
- One-to-many with AdminLogs (as admin)

**Validation Rules**:

- Email must be valid format and unique
- Password must meet security requirements (min 8 chars, mixed case, numbers)
- Name must be 2-50 characters
- Role defaults to CUSTOMER

### Product

Represents individual bracelet items in the catalog.

**Fields**:

- `id`: UUID (Primary Key)
- `name`: String (Required)
- `description`: Text (Required)
- `shortDescription`: String (Optional) - For product cards
- `sku`: String (Unique, Required)
- `price`: Decimal (Required) - Base price in cents
- `compareAtPrice`: Decimal (Optional) - Original price for sales
- `material`: Enum (PEARL, CRYSTAL_DIAMOND, MIXED) (Required)
- `style`: String (Required) - e.g., "Classic", "Modern", "Bohemian"
- `size`: String (Optional) - e.g., "S", "M", "L", "Adjustable"
- `weight`: Decimal (Optional) - Weight in grams
- `status`: Enum (ACTIVE, INACTIVE, DRAFT) (Required)
- `featuredOrder`: Integer (Optional) - For homepage featuring
- `seoTitle`: String (Optional)
- `seoDescription`: String (Optional)
- `createdAt`: DateTime (Auto-generated)
- `updatedAt`: DateTime (Auto-generated)

**Relationships**:

- One-to-many with ProductImages
- One-to-many with ProductCategories (junction)
- One-to-many with CartItems
- One-to-many with OrderItems
- One-to-one with Inventory

**Validation Rules**:

- Name must be 3-100 characters
- SKU must be alphanumeric and unique
- Price must be positive integer (cents)
- Description must be 10-2000 characters
- Status defaults to DRAFT

### ProductImage

Stores multiple images for each product with ordering.

**Fields**:

- `id`: UUID (Primary Key)
- `productId`: UUID (Foreign Key to Product)
- `url`: String (Required) - S3 URL
- `altText`: String (Required) - Accessibility text
- `sortOrder`: Integer (Required) - Display order
- `isPrimary`: Boolean (Required) - Main product image
- `width`: Integer (Required)
- `height`: Integer (Required)
- `createdAt`: DateTime (Auto-generated)

**Relationships**:

- Many-to-one with Product

**Validation Rules**:

- URL must be valid S3 URL format
- Each product must have exactly one primary image
- Sort order must be unique per product
- Alt text required for accessibility

### Category

Organizes products into browsable collections.

**Fields**:

- `id`: UUID (Primary Key)
- `name`: String (Required)
- `slug`: String (Unique, Required)
- `description`: Text (Optional)
- `parentId`: UUID (Optional, Foreign Key to Category)
- `sortOrder`: Integer (Required)
- `isActive`: Boolean (Required)
- `seoTitle`: String (Optional)
- `seoDescription`: String (Optional)
- `createdAt`: DateTime (Auto-generated)
- `updatedAt`: DateTime (Auto-generated)

**Relationships**:

- Self-referential (parent/child categories)
- Many-to-many with Products (through ProductCategories)

**Validation Rules**:

- Name must be 2-50 characters
- Slug must be URL-safe and unique
- Cannot be parent of itself
- Max 3 levels of nesting

### ProductCategory

Junction table for Product-Category many-to-many relationship.

**Fields**:

- `productId`: UUID (Foreign Key to Product)
- `categoryId`: UUID (Foreign Key to Category)

**Relationships**:

- Many-to-one with Product
- Many-to-one with Category

### Inventory

Tracks stock levels and reorder information for products.

**Fields**:

- `productId`: UUID (Primary Key, Foreign Key to Product)
- `quantity`: Integer (Required)
- `reservedQuantity`: Integer (Required) - Items in active carts
- `reorderPoint`: Integer (Required) - When to restock
- `reorderQuantity`: Integer (Required) - How much to restock
- `supplierInfo`: Text (Optional)
- `lastRestockedAt`: DateTime (Optional)
- `updatedAt`: DateTime (Auto-generated)

**Relationships**:

- One-to-one with Product

**Validation Rules**:

- Quantity cannot be negative
- Reserved quantity cannot exceed total quantity
- Reorder point must be positive

### Cart

Temporary storage for customer shopping sessions.

**Fields**:

- `id`: UUID (Primary Key)
- `userId`: UUID (Optional, Foreign Key to User) - Null for guest carts
- `sessionId`: String (Optional) - For guest cart persistence
- `expiresAt`: DateTime (Required) - Cart expiration
- `createdAt`: DateTime (Auto-generated)
- `updatedAt`: DateTime (Auto-generated)

**Relationships**:

- Many-to-one with User (optional)
- One-to-many with CartItems

**Validation Rules**:

- Must have either userId or sessionId
- Expires at must be in the future
- Guest carts expire in 7 days, user carts in 30 days

### CartItem

Individual items within a shopping cart.

**Fields**:

- `id`: UUID (Primary Key)
- `cartId`: UUID (Foreign Key to Cart)
- `productId`: UUID (Foreign Key to Product)
- `quantity`: Integer (Required)
- `addedAt`: DateTime (Auto-generated)

**Relationships**:

- Many-to-one with Cart
- Many-to-one with Product

**Validation Rules**:

- Quantity must be positive
- Unique product per cart (update quantity instead of duplicate)
- Cannot exceed available inventory

### Order

Represents completed customer purchases.

**Fields**:

- `id`: UUID (Primary Key)
- `orderNumber`: String (Unique, Required) - Human-readable order ID
- `customerId`: UUID (Foreign Key to User)
- `status`: Enum (PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED) (Required)
- `totalAmount`: Decimal (Required) - Total in cents
- `subtotalAmount`: Decimal (Required) - Before tax/shipping
- `taxAmount`: Decimal (Required)
- `shippingAmount`: Decimal (Required)
- `currency`: String (Required) - ISO currency code
- `paymentStatus`: Enum (PENDING, PAID, FAILED, REFUNDED) (Required)
- `paymentIntentId`: String (Optional) - Stripe payment intent ID
- `shippingAddress`: JSON (Required) - Address object
- `billingAddress`: JSON (Required) - Address object
- `customerEmail`: String (Required)
- `customerPhone`: String (Optional)
- `notes`: Text (Optional) - Customer notes
- `adminNotes`: Text (Optional) - Internal notes
- `trackingNumber`: String (Optional)
- `shippedAt`: DateTime (Optional)
- `deliveredAt`: DateTime (Optional)
- `createdAt`: DateTime (Auto-generated)
- `updatedAt`: DateTime (Auto-generated)

**Relationships**:

- Many-to-one with User (customer)
- One-to-many with OrderItems
- One-to-many with OrderStatusHistory

**Validation Rules**:

- Order number format: YYYY-NNNNNN (year + 6 digits)
- Total amount must equal subtotal + tax + shipping
- All amounts must be non-negative
- Email must be valid format

### OrderItem

Individual products within an order.

**Fields**:

- `id`: UUID (Primary Key)
- `orderId`: UUID (Foreign Key to Order)
- `productId`: UUID (Foreign Key to Product)
- `quantity`: Integer (Required)
- `unitPrice`: Decimal (Required) - Price at time of order (cents)
- `totalPrice`: Decimal (Required) - Unit price × quantity
- `productSnapshot`: JSON (Required) - Product details at time of order

**Relationships**:

- Many-to-one with Order
- Many-to-one with Product

**Validation Rules**:

- Quantity must be positive
- Total price must equal unit price × quantity
- Product snapshot preserves product state at order time

### OrderStatusHistory

Tracks status changes for orders with timestamps.

**Fields**:

- `id`: UUID (Primary Key)
- `orderId`: UUID (Foreign Key to Order)
- `fromStatus`: Enum (Optional) - Previous status
- `toStatus`: Enum (Required) - New status
- `changedByUserId`: UUID (Optional, Foreign Key to User) - Admin who made change
- `notes`: Text (Optional)
- `customerNotified`: Boolean (Required) - Whether customer was emailed
- `createdAt`: DateTime (Auto-generated)

**Relationships**:

- Many-to-one with Order
- Many-to-one with User (admin)

### CustomerAddress

Saved addresses for faster checkout.

**Fields**:

- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key to User)
- `type`: Enum (SHIPPING, BILLING, BOTH) (Required)
- `firstName`: String (Required)
- `lastName`: String (Required)
- `company`: String (Optional)
- `address1`: String (Required)
- `address2`: String (Optional)
- `city`: String (Required)
- `state`: String (Required)
- `postalCode`: String (Required)
- `country`: String (Required)
- `phone`: String (Optional)
- `isDefault`: Boolean (Required)
- `createdAt`: DateTime (Auto-generated)
- `updatedAt`: DateTime (Auto-generated)

**Relationships**:

- Many-to-one with User

**Validation Rules**:

- User can have only one default address per type
- Phone must be valid format if provided
- Postal code format validation by country

### AdminLog

Audit trail for administrative actions.

**Fields**:

- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key to User) - Admin user
- `action`: String (Required) - Action type
- `entityType`: String (Required) - What was modified
- `entityId`: String (Required) - ID of modified entity
- `oldValues`: JSON (Optional) - Previous state
- `newValues`: JSON (Optional) - New state
- `ipAddress`: String (Required)
- `userAgent`: String (Required)
- `createdAt`: DateTime (Auto-generated)

**Relationships**:

- Many-to-one with User (admin)

**Validation Rules**:

- Action must be from predefined list
- IP address must be valid format
- JSON values for audit trail

## State Transitions

### Product Status Flow

```
DRAFT → ACTIVE ↔ INACTIVE
```

### Order Status Flow

```
PENDING → PAID → PROCESSING → SHIPPED → DELIVERED
    ↓         ↓         ↓         ↓
CANCELLED CANCELLED CANCELLED CANCELLED
    ↓         ↓         ↓         ↓
              REFUNDED  REFUNDED  REFUNDED
```

### Payment Status Flow

```
PENDING → PAID
    ↓
  FAILED
    ↓
  REFUNDED (from PAID)
```

## Indexes and Performance

### Required Indexes

- `Product.sku` (unique)
- `Product.status, Product.featuredOrder`
- `Order.customerId, Order.createdAt`
- `Order.orderNumber` (unique)
- `OrderItem.orderId`
- `CartItem.cartId`
- `Inventory.quantity, Inventory.reorderPoint`
- `Category.slug` (unique)
- `User.email` (unique)

### Composite Indexes

- `Product.status, Product.createdAt` (for product listings)
- `Order.customerId, Order.status` (for customer order history)
- `Cart.userId, Cart.expiresAt` (for cart cleanup)

## Data Validation Summary

- All monetary values stored in cents (integers) to avoid floating point issues
- UUID primary keys for security and performance
- Timestamps in UTC with timezone awareness
- JSON fields for flexible address and product snapshot storage
- Enum constraints for status fields to ensure data integrity
- Foreign key constraints to maintain referential integrity
- Unique constraints on business-critical fields (email, SKU, order number)
