const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const categories = [
  // TOP LEVEL
  {
    id: "cate-all",
    name: "All Categories",
    slug: "all-categories",
    description: "All categories",
    imageUrl: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    parentId: null, // Top level
    isProtected: true,
  },
  {
    id: "marketing-all",
    name: "All Marketing categories",
    slug: "all-marketing-categories",
    description: "All marketing categories",
    imageUrl: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    parentId: null, // Top level
    isProtected: true,
    allowChildren: false,
  },
  {
    id: "marketing-hot-buy",
    name: "Hot Buy",
    slug: "marketing-hot-buy",
    description: "Hot Buy marketing category",
    imageUrl: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    parentId: "marketing-all", // Top level
    isProtected: true,
    allowChildren: false,
  },
  {
    id: "marketing-recommend",
    name: "Recommend",
    slug: "marketing-recommend",
    description: "Recommend marketing category",
    imageUrl: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    parentId: "marketing-all", // Top level
    isProtected: true,
    allowChildren: false,
  },
];

// Mock Coupon Data
const coupons = [
  {
    code: "WELCOME10",
    description: "New User 10% Discount",
    type: "PERCENTAGE",
    value: 10,
    minPurchase: 100,
    maxDiscount: 50,
    usageLimit: 1000,
    usageLimitPerCustomer: 1,
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: "SAVE20",
    description: "Save $20 on purchases over $200",
    type: "FIXED_AMOUNT",
    value: 20,
    minPurchase: 200,
    maxDiscount: null,
    usageLimit: 500,
    usageLimitPerCustomer: 3,
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-06-30"),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: "FREESHIP",
    description: "Free Shipping Coupon on orders over $150",
    type: "FREE_SHIPPING",
    value: 0,
    minPurchase: 150,
    maxDiscount: null,
    usageLimit: null,
    usageLimitPerCustomer: null,
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: "VIP15",
    description: "VIP Members Exclusive 15% Discount",
    type: "PERCENTAGE",
    value: 15,
    minPurchase: 300,
    maxDiscount: 100,
    usageLimit: 2000,
    usageLimitPerCustomer: 5,
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function main() {
  console.log("🌱 Starting database cleanup...");
  await prisma.coupons.deleteMany();
  await prisma.categories.deleteMany();
  console.log("✅ Database cleanup completed");

  // 1. Category Creation
  console.log("📁 Creating categories...");
  for (const cat of categories) {
    await prisma.categories.create({ data: cat });
  }
  console.log(`✅ Created ${categories.length} categories`);

  // 2. Mock Coupon Data Creation
  console.log("🎟️  Creating mock coupon data...");
  for (const coupon of coupons) {
    await prisma.coupons.create({ data: coupon });
  }
  console.log(`✅ Created ${coupons.length} coupons`);

  console.log("🚀 Initialization is Finished");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
