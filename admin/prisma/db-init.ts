import { PrismaClient, ProductStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

const categories = [
  // TOP LEVEL
  // {
  //   id: 'cate-all',
  //   name: 'All Categories',
  //   slug: 'all-categories',
  //   description: 'All categories',
  //   imageUrl: '',
  //   createdAt: new Date(),
  //   updatedAt: new Date(),
  //   parentId: null, // Top level
  //   removable: false
  // },
  // {
  //   id: 'marketing-all',
  //   name: 'All Marketing categories',
  //   slug: 'all-marketing-categories',
  //   description: 'All marketing categories',
  //   imageUrl: '',
  //   createdAt: new Date(),
  //   updatedAt: new Date(),
  //   parentId: null, // Top level
  //   removable: false
  // },
  {
    id: 'marketing-hot-buy',
    name: 'Hot Buy',
    slug: 'marketing-hot-buy',
    description: 'Hot Buy marketing category',
    imageUrl: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    parentId: 'marketing-all', // Top level
    removable: false
  },
  {
    id: 'marketing-recommend',
    name: 'Recommend',
    slug: 'marketing-recommend',
    description: 'Recommend marketing category',
    imageUrl: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    parentId: 'marketing-all', // Top level
    removable: false
  }
];

async function main() {
  console.log('🌱 Starting database cleanup...');

  // await prisma.categories.deleteMany();

  console.log('✅ Database cleanup completed');
  console.log('');

  // 1. Category Creation
  console.log('📁 Creating categories...');
  for (const cat of categories) {
    await prisma.categories.create({ data: cat });
  }
  console.log(`✅ Created ${categories.length} categories`);

  console.log('🚀 Initialization is Finished');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
