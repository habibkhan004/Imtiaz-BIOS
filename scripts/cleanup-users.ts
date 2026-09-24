/**
 * Keep only testmailmk92@gmail.com as ADMIN; delete every other user.
 */
import { readFileSync } from "fs";
import { resolve } from "path";

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

const KEEP_EMAIL = "testmailmk92@gmail.com";
const KEEP_NAME = "Test Admin";
const KEEP_PASSWORD = "Admin123!";

async function main() {
  const { hashPassword } = await import("../app/lib/server/password");
  const { updateDb, now, randomUUID, reloadDb, getDbStatus } =
    await import("../app/lib/server/db");

  await reloadDb();
  console.log("[cleanup] backend:", getDbStatus());

  const passwordHash = await hashPassword(KEEP_PASSWORD);
  const ts = now();

  const result = await updateDb((db) => {
    const removed = db.users
      .filter((u) => u.email !== KEEP_EMAIL)
      .map((u) => u.email);

    let admin = db.users.find((u) => u.email === KEEP_EMAIL);
    if (!admin) {
      const days = db.settings.introDurationDays;
      admin = {
        id: randomUUID(),
        name: KEEP_NAME,
        email: KEEP_EMAIL,
        passwordHash,
        phone: "",
        country: "",
        role: "ADMIN",
        status: "Active",
        trialStartDate: ts,
        trialEndDate: new Date(Date.now() + days * 86400000).toISOString(),
        createdAt: ts,
        updatedAt: ts,
      };
    } else {
      admin.name = KEEP_NAME;
      admin.passwordHash = passwordHash;
      admin.role = "ADMIN";
      admin.status = "Active";
      admin.updatedAt = ts;
    }

    db.users = [admin];
    return { admin, removed };
  });

  console.log("[cleanup] removed:", result.removed);
  console.log("[cleanup] kept admin:", {
    email: result.admin.email,
    role: result.admin.role,
    status: result.admin.status,
  });
  process.exit(0);
}

main().catch((err) => {
  console.error("[cleanup] FAILED:", err);
  process.exit(1);
});
