import { NextRequest, NextResponse } from "next/server";
import { homeForRole } from "@/app/lib/domain/types";
import { writeAudit } from "@/app/lib/server/audit";
import { loadDb, publicUser, updateDb } from "@/app/lib/server/db";
import { jsonError, rateLimit } from "@/app/lib/server/http";
import { verifyPassword } from "@/app/lib/server/password";
import { setSessionCookie } from "@/app/lib/server/session";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = rateLimit(`login:${ip}`, 20, 60_000);
  if (!rl.ok) return rl.response;

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  if (!email || !password) return jsonError("Email and password are required.");

  const db = await loadDb();
  const user = db.users.find((u) => u.email === email);
  if (!user) {
    await updateDb((d) => {
      writeAudit(d, {
        actorId: "anonymous",
        action: "auth.login_failed",
        targetType: "user",
        targetId: email,
        summary: `Failed login for unknown/invalid email (ip=${ip})`,
      });
    });
    return jsonError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }
  if (user.status === "Suspended") {
    await updateDb((d) => {
      writeAudit(d, {
        actorId: user.id,
        action: "auth.login_blocked",
        targetType: "user",
        targetId: user.id,
        summary: `Suspended user login blocked (ip=${ip})`,
      });
    });
    return jsonError("This account is suspended.", 403, "SUSPENDED");
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    await updateDb((d) => {
      writeAudit(d, {
        actorId: user.id,
        action: "auth.login_failed",
        targetType: "user",
        targetId: user.id,
        summary: `Failed login — bad password (ip=${ip})`,
      });
    });
    return jsonError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  await updateDb((d) => {
    writeAudit(d, {
      actorId: user.id,
      action: "auth.login",
      targetType: "user",
      targetId: user.id,
      summary: `Login success role=${user.role} (ip=${ip})`,
    });
  });

  return NextResponse.json({
    user: publicUser(user),
    redirectTo: homeForRole(user.role),
  });
}
