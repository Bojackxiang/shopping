const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// 生成订单号
function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ORD${timestamp}${random}`;
}

// 生成随机日期
function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// 随机选择
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function createOrders() {
  console.log("🛒 开始创建订单...\n");

  try {
    // 1. 获取必要数据
    console.log("📊 获取数据...");
    const customers = await prisma.customers.findMany({
      include: {
        addresses: true,
      },
    });

    const products = await prisma.products.findMany({
      include: {
        variants: {
          where: {
            isActive: true,
            inventory: { gt: 0 },
          },
        },
      },
    });

    const coupons = await prisma.coupons.findMany({
      where: {
        isActive: true,
      },
    });

    console.log(`  ✅ 客户: ${customers.length}`);
    console.log(`  ✅ 产品: ${products.length}`);
    console.log(
      `  ✅ 变体: ${products.reduce((sum, p) => sum + p.variants.length, 0)}`
    );
    console.log(`  ✅ 优惠券: ${coupons.length}\n`);

    // 验证数据
    const customersWithAddresses = customers.filter(
      (c) => c.addresses.length > 0
    );
    if (customersWithAddresses.length === 0) {
      console.error("❌ 没有客户有地址");
      process.exit(1);
    }

    // 2. 定义订单状态分布
    const orderTemplates = [
      {
        status: "PENDING",
        paymentStatus: "PENDING",
        name: "待处理订单(未支付)",
        count: 3,
      },
      {
        status: "PROCESSING",
        paymentStatus: "PAID",
        name: "处理中订单(已支付)",
        count: 4,
      },
      {
        status: "SHIPPED",
        paymentStatus: "PAID",
        name: "已发货订单",
        count: 5,
      },
      {
        status: "DELIVERED",
        paymentStatus: "PAID",
        name: "已送达订单",
        count: 6,
      },
      {
        status: "CANCELLED",
        paymentStatus: "PENDING",
        name: "已取消订单",
        count: 2,
      },
      {
        status: "REFUNDED",
        paymentStatus: "REFUNDED",
        name: "已退款订单",
        count: 2,
      },
    ];

    const paymentMethods = ["alipay", "wechat_pay", "credit_card"];

    let totalCreated = 0;

    // 3. 创建订单
    for (const template of orderTemplates) {
      console.log(`\n📦 创建 ${template.name} (${template.count} 个)...`);

      for (let i = 0; i < template.count; i++) {
        // 随机选择客户和地址
        const customer = randomChoice(customersWithAddresses);
        const address = randomChoice(customer.addresses);

        // 随机选择 1-3 个产品变体
        const numItems = Math.floor(Math.random() * 3) + 1;
        const selectedVariants = [];
        const usedProducts = new Set();

        while (
          selectedVariants.length < numItems &&
          selectedVariants.length < products.length
        ) {
          const product = randomChoice(products);
          if (!usedProducts.has(product.id) && product.variants.length > 0) {
            const variant = randomChoice(product.variants);
            selectedVariants.push({
              variant,
              product,
              quantity: Math.floor(Math.random() * 2) + 1,
            });
            usedProducts.add(product.id);
          }
        }

        // 计算金额
        const items = selectedVariants.map((item) => {
          const price = parseFloat(item.variant.price);
          const total = price * item.quantity;
          return {
            variantId: item.variant.id,
            productName: item.product.name,
            productSlug: item.product.slug,
            productImage: item.product.thumbnail || "",
            variantName: item.variant.name || item.variant.size || "",
            quantity: item.quantity,
            price,
            total,
          };
        });

        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const shippingCost = subtotal >= 200 ? 0 : 15;
        const tax = subtotal * 0.06;

        // 30% 概率使用优惠券
        let coupon = null;
        let discount = 0;
        if (Math.random() < 0.3 && coupons.length > 0) {
          coupon = randomChoice(coupons);
          const minPurchase = parseFloat(coupon.minPurchase || 0);

          if (subtotal >= minPurchase) {
            if (coupon.type === "PERCENTAGE") {
              discount = subtotal * (parseFloat(coupon.value) / 100);
              if (coupon.maxDiscount) {
                discount = Math.min(discount, parseFloat(coupon.maxDiscount));
              }
            } else if (coupon.type === "FIXED_AMOUNT") {
              discount = parseFloat(coupon.value);
            } else if (coupon.type === "FREE_SHIPPING") {
              discount = shippingCost;
            }
          }
        }

        const total = subtotal + shippingCost + tax - discount;

        // 生成订单日期（最近30天内）
        const createdAt = randomDate(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          new Date()
        );

        // 创建订单
        const orderData = {
          id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          orderNumber: generateOrderNumber(),
          customerId: customer.id,
          addressId: address.id,
          shippingFullName: address.fullName,
          shippingPhone: address.phone,
          shippingAddressLine1: address.addressLine1,
          shippingAddressLine2: address.addressLine2,
          shippingCity: address.city,
          shippingState: address.state,
          shippingPostalCode: address.postalCode,
          shippingCountry: address.country,
          subtotal,
          shippingCost,
          tax,
          discount,
          total,
          status: template.status,
          paymentStatus: template.paymentStatus,
          paymentMethod:
            template.paymentStatus !== "PENDING"
              ? randomChoice(paymentMethods)
              : null,
          couponId: coupon?.id || null,
          createdAt,
          updatedAt: createdAt,
        };

        // 根据状态添加额外信息
        if (template.status === "SHIPPED") {
          orderData.shippedAt = new Date(
            createdAt.getTime() + 1 * 24 * 60 * 60 * 1000
          );
          orderData.trackingNumber = `SF${Date.now().toString().slice(-10)}`;
        } else if (template.status === "DELIVERED") {
          orderData.shippedAt = new Date(
            createdAt.getTime() + 1 * 24 * 60 * 60 * 1000
          );
          orderData.deliveredAt = new Date(
            createdAt.getTime() + 3 * 24 * 60 * 60 * 1000
          );
          orderData.trackingNumber = `SF${Date.now().toString().slice(-10)}`;
        } else if (template.status === "CANCELLED") {
          orderData.cancelledAt = new Date(
            createdAt.getTime() + 0.5 * 24 * 60 * 60 * 1000
          );
          orderData.cancelReason = "客户取消";
        } else if (template.status === "REFUNDED") {
          orderData.shippedAt = new Date(
            createdAt.getTime() + 1 * 24 * 60 * 60 * 1000
          );
          orderData.deliveredAt = new Date(
            createdAt.getTime() + 3 * 24 * 60 * 60 * 1000
          );
          orderData.refundedAt = new Date(
            createdAt.getTime() + 5 * 24 * 60 * 60 * 1000
          );
          orderData.refundAmount = total;
          orderData.cancelReason = "质量问题";
        }

        // 保存订单和订单项
        await prisma.orders.create({
          data: {
            ...orderData,
            order_items: {
              create: items.map((item, idx) => ({
                id: `item_${orderData.id}_${idx}`,
                variantId: item.variantId,
                productName: item.productName,
                productSlug: item.productSlug,
                productImage: item.productImage,
                variantName: item.variantName,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
              })),
            },
          },
        });

        totalCreated++;
        console.log(
          `  ✅ [${totalCreated}] ${orderData.orderNumber} - ¥${total.toFixed(
            2
          )} ${coupon ? `(使用了 ${coupon.code})` : ""}`
        );
      }
    }

    // 4. 统计信息
    console.log("\n🎉 订单创建完成！\n");
    console.log("📊 订单状态分布:");
    for (const template of orderTemplates) {
      console.log(`   ${template.name}: ${template.count} 个`);
    }

    const allOrders = await prisma.orders.findMany();
    const totalRevenue = allOrders
      .filter((o) => o.paymentStatus === "PAID")
      .reduce((sum, o) => sum + parseFloat(o.total), 0);

    console.log(`\n💰 总收入 (已支付订单): ¥${totalRevenue.toFixed(2)}`);
    console.log(`📦 订单总数: ${totalCreated}`);

    const ordersWithCoupons = allOrders.filter((o) => o.couponId).length;
    console.log(
      `🎟️  使用优惠券的订单: ${ordersWithCoupons} (${(
        (ordersWithCoupons / totalCreated) *
        100
      ).toFixed(1)}%)`
    );
  } catch (error) {
    console.error("❌ 创建订单时出错:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createOrders();
