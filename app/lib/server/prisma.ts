import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  __imtiazPrisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.__imtiazPrisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__imtiazPrisma = prisma;
}

export default prisma;
