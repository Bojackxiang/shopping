import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const db = new PrismaClient();

const FIRST_NAMES = [
  'Alice',
  'Bob',
  'Carol',
  'David',
  'Emma',
  'Frank',
  'Grace',
  'Henry',
  'Iris',
  'Jack',
  'Karen',
  'Leo',
  'Mia',
  'Nathan',
  'Olivia',
  'Paul',
  'Quinn',
  'Rachel',
  'Sam',
  'Tina',
  'Uma',
  'Victor',
  'Wendy',
  'Xander',
  'Yuki',
  'Zoe',
  'Aaron',
  'Bella',
  'Chris',
  'Diana'
];

const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Wilson',
  'Moore',
  'Taylor',
  'Anderson',
  'Thomas',
  'Jackson',
  'White',
  'Harris',
  'Martin',
  'Thompson',
  'Lee',
  'Walker',
  'Hall',
  'Allen',
  'Young',
  'King',
  'Scott',
  'Green',
  'Baker',
  'Adams',
  'Nelson',
  'Carter'
];

const AVATAR_SEEDS = Array.from({ length: 30 }, (_, i) => i + 1);

function randomPhone() {
  const prefix = [
    '138',
    '139',
    '150',
    '151',
    '158',
    '176',
    '177',
    '180',
    '181',
    '188'
  ];
  const p = prefix[Math.floor(Math.random() * prefix.length)];
  const rest = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, '0');
  return p + rest;
}

function randomPastDate(yearsBack = 3) {
  const now = Date.now();
  const past =
    now - Math.floor(Math.random() * yearsBack * 365 * 24 * 60 * 60 * 1000);
  return new Date(past);
}

async function main() {
  console.log('🌱 Seeding 30 fake customers...');

  const records = FIRST_NAMES.map((firstName, i) => {
    const lastName = LAST_NAMES[i];
    const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
    const email = `${username}@example.com`;
    const clerkId = `seed_clerk_${randomUUID()}`;
    const createdAt = randomPastDate(3);

    return {
      id: randomUUID(),
      clerkId,
      email,
      firstName,
      lastName,
      username,
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${AVATAR_SEEDS[i]}`,
      phone: randomPhone(),
      role: 'customer',
      createdAt,
      updatedAt: createdAt
    };
  });

  let created = 0;
  let skipped = 0;

  for (const record of records) {
    try {
      await db.customers.upsert({
        where: { email: record.email },
        update: {},
        create: record
      });
      created++;
    } catch (err) {
      console.warn(`  ⚠️  Skipped ${record.email}:`, (err as Error).message);
      skipped++;
    }
  }

  console.log(`✅ Done. Created/updated: ${created}, skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
