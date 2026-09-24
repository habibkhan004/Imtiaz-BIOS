import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { now, updateDb } from "@/app/lib/server/db";
import { isEmailConfigured, sendPasswordChangedEmail } from "@/app/lib/server/email";
import { jsonError, rateLimit } from "@/app/lib/server/http";
import { hashPassword } from "@/app/lib/server/password";

export async function POST(req: NextRequest) {
  const rl = rateLimit(`reset:${req.headers.get("x-forwarded-for") || "local"}`, 10, 60_000);
  if (!rl.ok) return rl.response;

  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const token = (body.token || "").trim();
  const password = body.password || "";
  if (!token || !password) return jsonError("Token and new password are required.");
  if (password.length < 6) return jsonError("Password must be at least 6 characters.");

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const passwordHash = await hashPassword(password);

  const result = await updateDb((db) => {
    const row = db.resetTokens.find(
      (t) => t.tokenHash === tokenHash && !t.usedAt && new Date(t.expiresAt).getTime() > Date.now(),
    );
    if (!row) return { ok: false as const };
    const user = db.users.find((u) => u.id === row.userId);
    if (!user) return { ok: false as const };
    user.passwordHash = passwordHash;
    user.updatedAt = now();
    row.usedAt = now();
    for (const t of db.resetTokens) {
      if (t.userId === user.id && !t.usedAt) t.usedAt = now();
    }
    return {
      ok: true as const,
      email: user.email,
      name: user.name,
    };
  });

  if (!result.ok) {
    return jsonError("Reset link is invalid or has expired.", 400, "TOKEN_INVALID");
  }

  if (isEmailConfigured() && result.email) {
    void sendPasswordChangedEmail(result.email, result.name).then((r) => {
      if (!r.ok) console.error("[reset-password] confirmation email failed:", r.error);
    });
  }

  return NextResponse.json({ message: "Password updated. You can sign in now." });
}
