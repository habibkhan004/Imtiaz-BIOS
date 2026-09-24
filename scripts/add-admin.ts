/**
 * One-off: create an admin user.
 * Usage: node --import tsx scripts/add-admin.ts
 * or: npx tsx scripts/add-admin.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local
try {
  const envPath = resolve(process.cwd(), ".env.local");
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim();
    }
  }
} catch {
  /* optional */
}

const EMAIL = "testmailmk92@gmail.com";
const NAME = "Test Admin";
const PASSWORD = "Admin123!";

async function main() {
  const { hashPassword } = await import("../app/lib/server/password");
  const { loadDb, updateDb, now, randomUUID, reloadDb, getDbStatus } =
    await import("../app/lib/server/db");

  await reloadDb();
  const status = getDbStatus();
  console.log("[add-admin] backend:", status);

  const passwordHash = await hashPassword(PASSWORD);
  const ts = now();

  const user = await updateDb((db) => {
    const existing = db.users.find((u) => u.email === EMAIL);
    if (existing) {
      existing.name = NAME;
      existing.passwordHash = passwordHash;
      existing.role = "ADMIN";
      existing.status = "Active";
      existing.updatedAt = ts;
      return existing;
    }
    const days = db.settings.introDurationDays;
    const u = {
      id: randomUUID(),
      name: NAME,
      email: EMAIL,
      passwordHash,
      phone: "",
      country: "",
      role: "ADMIN" as const,
      status: "Active" as const,
      trialStartDate: ts,
      trialEndDate: new Date(Date.now() + days * 86400000).toISOString(),
      createdAt: ts,
      updatedAt: ts,
    };
    db.users.unshift(u);
    return u;
  });

  console.log("[add-admin] OK:", {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
  });
  console.log("[add-admin] Sign in at /login with", EMAIL, "/", PASSWORD);
  process.exit(0);
}

main().catch((err) => {
  console.error("[add-admin] FAILED:", err);
  process.exit(1);
});
