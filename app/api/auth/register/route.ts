import { NextRequest, NextResponse } from "next/server";
import { homeForRole, type User } from "@/app/lib/domain/types";
import { loadDb, now, publicUser, randomUUID, updateDb } from "@/app/lib/server/db";
import { isEmailConfigured, sendWelcomeEmail } from "@/app/lib/server/email";
import { jsonError, rateLimit } from "@/app/lib/server/http";
import { pushNotification } from "@/app/lib/server/notifications";
import { hashPassword } from "@/app/lib/server/password";
import { setSessionCookie } from "@/app/lib/server/session";

export async function POST(req: NextRequest) {
  const rl = rateLimit(`register:${req.headers.get("x-forwarded-for") || "local"}`, 10, 60_000);
  if (!rl.ok) return rl.response;

  let body: {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    country?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const phone = (body.phone || "").trim();
  const country = (body.country || "").trim();

  if (!name || !email || !password) {
    return jsonError("Name, email, and password are required.");
  }
  if (!email.includes("@")) return jsonError("Enter a valid email address.");
  if (password.length < 6) return jsonError("Password must be at least 6 characters.");

  const existing = (await loadDb()).users.find((u) => u.email === email);
  if (existing) {
    return jsonError("An account with this email already exists.", 409, "EMAIL_EXISTS");
  }

  const passwordHash = await hashPassword(password);
  const ts = now();

  const user = await updateDb((db) => {
    const days = db.settings.introDurationDays;
    const trialEnd = new Date(Date.now() + days * 86400000).toISOString();
    const u: User = {
      id: randomUUID(),
      name,
      email,
      passwordHash,
      phone,
      country,
      role: "USER",
      status: "Active",
      trialStartDate: ts,
      trialEndDate: trialEnd,
      createdAt: ts,
      updatedAt: ts,
    };
    db.users.push(u);
    pushNotification(db, {
      userId: u.id,
      type: "welcome",
      title: "Welcome to IMTIAZ BIOS",
      body: `Your introductory access is active until ${new Date(trialEnd).toLocaleDateString()}.`,
      href: "/portal",
    });
    return u;
  });

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  if (isEmailConfigured()) {
    void sendWelcomeEmail(user.email, user.name, user.trialEndDate).then((r) => {
      if (!r.ok) console.error("[register] welcome email failed:", r.error);
      else console.info("[register] welcome email sent to", user.email);
    });
  } else {
    console.warn("[register] SMTP not configured — skipped welcome email");
  }

  return NextResponse.json({
    user: publicUser(user),
    redirectTo: homeForRole(user.role),
  });
}
