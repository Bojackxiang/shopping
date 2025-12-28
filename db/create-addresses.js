const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// 中国城市地址数据
const addressesData = [
  {
    fullName: "张三",
    phone: "13800138000",
    addressLine1: "朝阳区建国路88号SOHO现代城",
    addressLine2: "A座1001室",
    city: "北京",
    state: "北京市",
    postalCode: "100020",
    country: "China",
    isDefault: true,
  },
  {
    fullName: "李四",
    phone: "13900139000",
    addressLine1: "浦东新区陆家嘴环路1000号",
    addressLine2: "恒生银行大厦20楼",
    city: "上海",
    state: "上海市",
    postalCode: "200120",
    country: "China",
    isDefault: false,
  },
  {
    fullName: "王五",
    phone: "13700137000",
    addressLine1: "天河区天河路208号粤海天河城",
    addressLine2: null,
    city: "广州",
    state: "广东省",
    postalCode: "510620",
    country: "China",
    isDefault: false,
  },
];

async function createAddresses() {
  console.log("📍 开始创建地址数据...\n");

  try {
    // 获取所有客户
    const customers = await prisma.customers.findMany();

    if (customers.length === 0) {
      console.error("❌ 没有找到客户数据，请先创建客户");
      process.exit(1);
    }

    console.log(`找到 ${customers.length} 个客户`);

    let createdCount = 0;

    // 为每个客户创建地址
    for (const customer of customers) {
      console.log(`\n为客户 ${customer.email} 创建地址...`);

      for (let i = 0; i < addressesData.length; i++) {
        const addressTemplate = addressesData[i];

        const address = await prisma.addresses.create({
          data: {
            id: `addr_${customer.id}_${i + 1}`,
            ...addressTemplate,
            isDefault: i === 0, // 第一个地址设为默认
            createdAt: new Date(),
            updatedAt: new Date(),
            customerId: customer.id,
          },
        });

        console.log(
          `  ✅ 创建地址 ${i + 1}: ${address.fullName} - ${address.city}`
        );
        createdCount++;
      }
    }

    console.log(`\n🎉 成功创建 ${createdCount} 个地址！`);
    console.log(`📊 每个客户有 ${addressesData.length} 个地址`);
  } catch (error) {
    console.error("❌ 创建地址时出错:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAddresses();
