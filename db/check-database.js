const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log("🔍 检查数据库现状...\n");

  try {
    // 1. 检查 customers
    const customers = await prisma.customers.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        clerkId: true,
      },
    });
    console.log(`👥 Customers: ${customers.length} 个`);
    customers.forEach((c, idx) => {
      console.log(
        `   ${idx + 1}. ${c.firstName || ""} ${c.lastName || ""} (${c.email})`
      );
    });

    // 2. 检查 coupons
    console.log("\n🎟️  Coupons:");
    const coupons = await prisma.coupons.findMany({
      select: {
        id: true,
        code: true,
        description: true,
        type: true,
        value: true,
        isActive: true,
      },
    });
    console.log(`   总共: ${coupons.length} 个`);
    coupons.forEach((c, idx) => {
      console.log(
        `   ${idx + 1}. ${c.code} - ${c.description} (${c.type}: ${
          c.value
        }) - ${c.isActive ? "✅ 活跃" : "❌ 未激活"}`
      );
    });

    // 3. 检查 addresses
    console.log("\n📍 Addresses:");
    const addresses = await prisma.addresses.findMany({
      include: {
        customers: {
          select: {
            email: true,
          },
        },
      },
    });
    console.log(`   总共: ${addresses.length} 个`);
    addresses.forEach((a, idx) => {
      console.log(
        `   ${idx + 1}. ${a.fullName} - ${a.city} (客户: ${a.customers.email})`
      );
    });

    // 4. 检查 products 和 variants
    console.log("\n📦 Products:");
    const products = await prisma.products.findMany({
      include: {
        variants: {
          select: {
            id: true,
            sku: true,
            name: true,
            price: true,
            inventory: true,
          },
        },
      },
    });
    console.log(`   总共: ${products.length} 个产品`);
    let totalVariants = 0;
    products.forEach((p, idx) => {
      console.log(
        `   ${idx + 1}. ${p.name} (${p.slug}) - ${p.variants.length} 个变体`
      );
      totalVariants += p.variants.length;
    });
    console.log(`   总变体数: ${totalVariants} 个`);

    // 5. 检查现有 orders
    console.log("\n🛒 Orders:");
    const orders = await prisma.orders.findMany({
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
      },
    });
    console.log(`   总共: ${orders.length} 个订单`);
    if (orders.length > 0) {
      orders.slice(0, 5).forEach((o, idx) => {
        console.log(
          `   ${idx + 1}. ${o.orderNumber} - ${o.status} - ¥${o.total}`
        );
      });
      if (orders.length > 5) {
        console.log(`   ... 还有 ${orders.length - 5} 个订单`);
      }
    }

    // 总结
    console.log("\n📊 数据库状态总结:");
    console.log(`   ✅ Customers: ${customers.length}`);
    console.log(`   ✅ Coupons: ${coupons.length}`);
    console.log(`   ✅ Addresses: ${addresses.length}`);
    console.log(`   ✅ Products: ${products.length}`);
    console.log(`   ✅ Variants: ${totalVariants}`);
    console.log(`   ✅ Orders: ${orders.length}`);

    // 检查是否缺少必要数据
    console.log("\n⚠️  缺失检查:");
    const missing = [];
    if (customers.length === 0) missing.push("customers");
    if (addresses.length === 0) missing.push("addresses");
    if (products.length === 0) missing.push("products");
    if (totalVariants === 0) missing.push("product variants");

    if (missing.length > 0) {
      console.log(`   ❌ 缺少: ${missing.join(", ")}`);
      console.log(
        "\n💡 建议: 请先运行相应脚本创建缺失的基础数据，然后再创建订单"
      );
    } else {
      console.log("   ✅ 所有必要数据都已准备好！");
      console.log("\n💡 可以开始创建订单了！");
    }
  } catch (error) {
    console.error("❌ 错误:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
