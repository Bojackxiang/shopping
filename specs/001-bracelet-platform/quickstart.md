# Quickstart Guide: Bracelet Shopping Platform

**Last Updated**: 2025-11-05
**Feature**: Bracelet Shopping Platform
**Purpose**: Get developers up and running with the dual Next.js e-commerce platform

## Overview

This platform consists of two separate Next.js applications sharing backend services:

- **Customer App** (`/client`): Public shopping interface for browsing and purchasing bracelets
- **Admin App** (`/admin`): Private management interface for inventory, orders, and analytics
- **Shared Services** (`/shared`): Common database models, API utilities, and business logic

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL 14+ database
- Stripe account for payments
- AWS account for S3 image storage (optional for local dev)
- Git for version control

## Quick Setup (5 minutes)

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd bracelet-shopping

# Install dependencies for all applications
npm install
cd client && npm install && cd ..
cd admin && npm install && cd ..
cd shared && npm install && cd ..
```

### 2. Environment Configuration

Create environment files for each application:

**Root `.env.local`:**

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bracelet_shop"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AWS S3 (optional for local dev)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="bracelet-shop-images"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

**Client app (`client/.env.local`):**

```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

**Admin app (`admin/.env.local`):**

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_SITE_URL="http://localhost:3001"
```

### 3. Database Setup

```bash
# Generate Prisma client
cd shared
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with sample data
npx prisma db seed
```

### 4. Start Development Servers

```bash
# Terminal 1: Start client app (port 3000)
cd client
npm run dev

# Terminal 2: Start admin app (port 3001)
cd admin
npm run dev

# Terminal 3: Watch shared services for changes
cd shared
npm run dev
```

### 5. Access Applications

- **Customer Store**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001
- **API Documentation**: http://localhost:3000/api/docs (Swagger UI)

## Development Workflow

### Project Structure

```
bracelet-shopping/
├── client/                 # Customer-facing Next.js app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Next.js pages and API routes
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and configurations
│   │   ├── styles/        # Tailwind CSS and global styles
│   │   └── types/         # TypeScript type definitions
│   └── public/            # Static assets
├── admin/                 # Admin portal Next.js app
│   ├── src/
│   │   ├── components/    # Admin-specific components
│   │   ├── pages/         # Admin pages and API routes
│   │   └── ...           # Similar structure to client
├── shared/                # Shared backend services
│   ├── lib/
│   │   ├── db/           # Prisma schema and database utilities
│   │   ├── auth/         # Authentication logic
│   │   ├── payments/     # Stripe integration
│   │   ├── emails/       # Email templates and sending
│   │   └── types/        # Shared TypeScript types
│   └── api/              # Shared API utilities
└── tests/                # End-to-end and integration tests
```

### Key Commands

```bash
# Install new dependency
npm install <package>                    # Root dependencies
cd client && npm install <package>      # Client-specific
cd admin && npm install <package>       # Admin-specific
cd shared && npm install <package>      # Shared services

# Database operations
cd shared
npx prisma migrate dev                   # Create new migration
npx prisma db push                       # Push schema changes
npx prisma studio                        # Open database GUI
npx prisma generate                      # Regenerate client

# Testing
npm run test                             # Unit tests
npm run test:e2e                         # End-to-end tests
npm run test:integration                 # Integration tests

# Code quality
npm run lint                             # ESLint
npm run type-check                       # TypeScript check
npm run format                           # Prettier formatting

# Building
cd client && npm run build               # Build client app
cd admin && npm run build                # Build admin app
```

### Database Schema Updates

When modifying the database schema:

1. Edit `shared/lib/db/schema.prisma`
2. Create migration: `npx prisma migrate dev --name your-migration-name`
3. Regenerate client: `npx prisma generate`
4. Update TypeScript types if needed
5. Test changes locally before committing

### Adding New Features

1. **Create feature branch**: `git checkout -b feature/your-feature-name`
2. **Identify scope**: Determine if feature affects client, admin, or shared services
3. **Update data model**: Modify Prisma schema if database changes needed
4. **Create API endpoints**: Add routes in appropriate app's `pages/api/` directory
5. **Build UI components**: Create React components with Tailwind CSS styling
6. **Add tests**: Write unit tests for components and integration tests for API
7. **Update documentation**: Update this quickstart or create feature-specific docs

### Authentication Flow

The platform uses NextAuth.js for unified authentication:

- **Customer Authentication**: Email/password with optional social login
- **Admin Authentication**: Email/password with role-based access control
- **Session Management**: Database sessions for better control and security
- **API Protection**: Middleware protects admin routes and authenticated endpoints

### Payment Processing

Stripe integration handles secure payments:

- **Checkout Flow**: Create payment intent → Collect payment → Confirm order
- **Webhook Handling**: Process payment status updates asynchronously
- **Test Mode**: Use Stripe test keys for development
- **Security**: Never store payment details, let Stripe handle PCI compliance

## Common Development Tasks

### Adding a New Product Field

1. **Update Prisma schema** (`shared/lib/db/schema.prisma`):

```prisma
model Product {
  // ... existing fields
  newField String?
}
```

2. **Run migration**:

```bash
cd shared
npx prisma migrate dev --name add-new-field
```

3. **Update TypeScript types** (`shared/lib/types/product.ts`)

4. **Update API endpoints** (client/admin product routes)

5. **Update UI components** (product forms, displays)

### Creating a New Page

**Client page example** (`client/src/pages/new-page.tsx`):

```typescript
import { GetStaticProps } from "next";
import { Layout } from "../components/Layout";

interface Props {
  data: any;
}

export default function NewPage({ data }: Props) {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">New Page</h1>
        {/* Page content */}
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // Fetch data if needed
  return {
    props: {
      data: null,
    },
  };
};
```

### Adding API Endpoint

**API route example** (`client/src/pages/api/products/[id].ts`):

```typescript
import { NextApiRequest, NextApiResponse } from "next";
import { getProduct } from "../../../lib/db/products";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const product = await getProduct(id as string);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
```

## Testing Strategy

### Unit Tests

- Components with React Testing Library
- API route handlers with Jest
- Database operations with test database

### Integration Tests

- API endpoint flows
- Authentication workflows
- Payment processing (with Stripe test mode)

### E2E Tests

- Critical customer journeys (browse → cart → checkout)
- Admin workflows (product management, order processing)
- Cross-browser testing with Playwright

### Performance Testing

- Page load speeds (target <3 seconds)
- Image optimization verification
- Database query performance

## Deployment

### Production Environment

1. **Environment Setup**:

   - Production database (PostgreSQL)
   - Stripe live keys
   - AWS S3 production bucket
   - Domain configuration

2. **Build and Deploy**:

   - Client app to Vercel (domain: shop.yourdomain.com)
   - Admin app to Vercel (domain: admin.yourdomain.com)
   - Database migrations in production

3. **Monitoring**:
   - Vercel Analytics for performance
   - Sentry for error tracking
   - PostHog for user analytics

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Secure environment variables
- [ ] Enable CSRF protection
- [ ] Implement rate limiting
- [ ] Regular dependency updates
- [ ] Database backup strategy
- [ ] Admin access logging

## Troubleshooting

### Common Issues

**Database Connection Failed**:

- Check PostgreSQL is running
- Verify DATABASE_URL in environment
- Ensure database exists and migrations are applied

**Stripe Payments Not Working**:

- Verify Stripe keys are correct (test vs live)
- Check webhook endpoint configuration
- Ensure HTTPS for production webhooks

**Images Not Loading**:

- Check AWS S3 configuration
- Verify bucket permissions and CORS settings
- Ensure CDN distribution is active

**Build Errors**:

- Clear `.next` directories and node_modules
- Regenerate Prisma client
- Check TypeScript errors

### Getting Help

- Check GitHub Issues for known problems
- Review API documentation at `/api/docs`
- Join development Discord for real-time help
- Email dev team: dev@braceletshop.com

## Next Steps

1. **Complete Core Features**: Implement all user stories from specification
2. **Performance Optimization**: Implement caching, image optimization, CDN
3. **SEO Enhancement**: Add structured data, meta tags, sitemap
4. **Analytics Implementation**: Set up conversion tracking and user behavior analysis
5. **Mobile App**: Consider React Native app for enhanced mobile experience
6. **Internationalization**: Add multi-language support for global markets

---

**Happy coding!** 🚀 This quickstart should get you productive quickly. Refer to individual component documentation and API specs for detailed implementation guidance.
