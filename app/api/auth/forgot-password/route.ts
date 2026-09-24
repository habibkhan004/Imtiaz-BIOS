import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { loadDb, now, randomUUID, updateDb } from "@/app/lib/server/db";
import { isEmailConfigured, sendPasswordResetEmail } from "@/app/lib/server/email";
import { jsonError, rateLimit } from "@/app/lib/server/http";
import { newToken } from "@/app/lib/server/session";

const GENERIC =
  "If an account exists for that email, password reset instructions have been sent.";

export async function POST(req: NextRequest) {
  const rl = rateLimit(`forgot:${req.headers.get("x-forwarded-for") || "local"}`, 8, 60_000);
  if (!rl.ok) return rl.response;

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body");
  }
  const email = (body.email || "").trim().toLowerCase();
  if (!email) return jsonError("Email is required.");

  const db = await loadDb();
  const user = db.users.find((u) => u.email === email);

  // Always generic — never reveal whether the email exists (FR-E02)
  if (user && user.status === "Active") {
    const token = newToken();
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await updateDb((d) => {
      d.resetTokens = d.resetTokens.filter((t) => t.userId !== user.id || t.usedAt);
      d.resetTokens.push({
        id: randomUUID(),
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        createdAt: now(),
      });
    });

    const base = (process.env.APP_URL || req.nextUrl.origin).replace(/\/$/, "");
    const resetUrl = `${base}/reset-password?token=${token}`;

    if (isEmailConfigured()) {
      const sent = await sendPasswordResetEmail(user.email, resetUrl, user.name);
      if (!sent.ok) {
        console.error("[forgot-password] email failed:", sent.error);
        if (process.env.NODE_ENV !== "production") {
          console.info(`[demo-email] Password reset link (SMTP failed): ${resetUrl}`);
        }
      } else {
        console.info("[forgot-password] reset email sent");
      }
    } else if (process.env.NODE_ENV !== "production") {
      console.info(`[demo-email] Password reset link (SMTP not configured): ${resetUrl}`);
    }
  }

  return NextResponse.json({ message: GENERIC });
}
