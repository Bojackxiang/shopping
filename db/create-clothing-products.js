const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// 先创建衣服分类
const clothingCategory = {
  id: "cate-clothing",
  name: "衣服",
  slug: "clothing",
  description: "各种款式的服装",
  imageUrl: "",
  isActive: true,
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  parentId: "cate-all",
  path: "cate-all/cate-clothing",
  allowChildren: true,
  isProtected: false,
};

// 3 个商品数据
const products = [
  {
    id: "prod-tshirt-001",
    name: "经典圆领T恤",
    slug: "classic-round-neck-tshirt",
    description: "舒适透气的纯棉T恤，适合日常穿着",
    isActive: true,
    isFeatured: true,
    isNew: true,
    status: "ACTIVE",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "prod-hoodie-001",
    name: "时尚连帽卫衣",
    slug: "fashionable-hoodie",
    description: "保暖舒适的连帽卫衣，冬季必备单品",
    isActive: true,
    isFeatured: true,
    isNew: false,
    status: "ACTIVE",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "prod-shirt-001",
    name: "商务休闲衬衫",
    slug: "business-casual-shirt",
    description: "正式场合和休闲场合都适合的衬衫",
    isActive: true,
    isFeatured: false,
    isNew: true,
    status: "ACTIVE",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// 为每个产品创建 S、M、L 三个尺寸的变体
const createVariantsForProduct = (productId, productName, basePrice) => {
  const sizes = ["S", "M", "L"];
  return sizes.map((size, index) => ({
    id: `${productId}-variant-${size.toLowerCase()}`,
    productId: productId,
    sku: `${productId}-${size}`,
    name: `${size}码`,
    size: size,
    price: basePrice + index * 10, // S码基础价，M码+10，L码+20
    compareAtPrice: basePrice + index * 10 + 20, // 对比价格
    cost: (basePrice + index * 10) * 0.6, // 成本价约为售价的60%
    inventory: 50 + index * 10, // S:50, M:60, L:70
    lowStockThreshold: 5,
    trackInventory: true,
    isDefault: size === "M", // M码设为默认
    sortOrder: index,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
};

async function main() {
  console.log("🛍️  开始创建衣服类别和商品...");

  // 1. 创建衣服分类
  console.log("📁 创建衣服分类...");
  const category = await prisma.categories.upsert({
    where: { id: clothingCategory.id },
    update: clothingCategory,
    create: clothingCategory,
  });
  console.log(`✅ 创建分类: ${category.name}`);

  // 2. 创建商品和变体
  for (const productData of products) {
    console.log(`\n👕 创建商品: ${productData.name}`);

    // 创建产品
    const product = await prisma.products.upsert({
      where: { id: productData.id },
      update: productData,
      create: productData,
    });

    // 关联产品和分类
    await prisma.product_categories.upsert({
      where: {
        productId_categoryId: {
          productId: product.id,
          categoryId: category.id,
        },
      },
      update: {
        isPrimary: true,
        sortOrder: 0,
      },
      create: {
        productId: product.id,
        categoryId: category.id,
        isPrimary: true,
        sortOrder: 0,
        createdAt: new Date(),
      },
    });

    // 确定基础价格
    let basePrice = 99;
    if (productData.id.includes("hoodie")) {
      basePrice = 199;
    } else if (productData.id.includes("shirt")) {
      basePrice = 149;
    }

    // 创建变体
    const variants = createVariantsForProduct(
      product.id,
      product.name,
      basePrice
    );

    for (const variantData of variants) {
      const variant = await prisma.product_variants.upsert({
        where: { id: variantData.id },
        update: variantData,
        create: variantData,
      });
      console.log(
        `  ✅ 创建变体: ${variant.name} - 价格: ¥${variant.price} - 库存: ${variant.inventory}`
      );
    }
  }

  console.log("\n🎉 所有商品创建完成！");
  console.log("\n📊 总结:");
  console.log(`  - 分类: 1 个 (衣服)`);
  console.log(`  - 商品: ${products.length} 个`);
  console.log(`  - 变体: ${products.length * 3} 个 (每个商品 S/M/L 三个尺寸)`);
}

main()
  .catch((e) => {
    console.error("❌ 错误:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
