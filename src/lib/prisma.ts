import { PrismaClient } from "@prisma/client";

// Singleton PrismaClient để tránh tạo nhiều connection trong môi trường serverless
// (Next.js HMR / Netlify Functions) gây cạn kiệt connection pool.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}