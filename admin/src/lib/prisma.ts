import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}
export const db =
  globalThis.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn'] // 移除了 'query'
        : ['error'],
    transactionOptions: {
      maxWait: 10000,
      timeout: 15000
    }
  });

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;
