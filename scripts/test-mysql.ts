/**
 * MySQL/Prisma connectivity check.
 * Usage: npx tsx scripts/test-mysql.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

for (const file of [".env.local", ".env"]) {
  try {
    const envPath = resolve(process.cwd(), file);
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m && !process.env[m[1].trim()]) {
        let v = m[2].trim();
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        ) {
          v = v.slice(1, -1);
        }
        process.env[m[1].trim()] = v;
      }
    }
  } catch {
    /* optional */
  }
}

const url = process.env.DATABASE_URL || "";
console.log("DATABASE_URL set:", Boolean(url));
console.log("Looks like mysql:", url.startsWith("mysql://"));

if (!url) {
  console.error("FAIL: DATABASE_URL missing");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  await prisma.$queryRaw`SELECT 1 AS ok`;
  const users = await prisma.user.count();
  const settings = await prisma.platformSettings.count();
  console.log("SUCCESS connected to MySQL");
  console.log("users:", users, "settings rows:", settings);
}

main()
  .catch((err) => {
    console.error("FAIL:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
