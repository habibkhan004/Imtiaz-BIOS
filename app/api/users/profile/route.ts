import { NextRequest, NextResponse } from "next/server";
import { loadDb, now, publicUser, updateDb } from "@/app/lib/server/db";
import { trialDaysRemaining } from "@/app/lib/server/entitlement";
import { jsonError, requireSession } from "@/app/lib/server/http";
import { hashPassword, verifyPassword } from "@/app/lib/server/password";
import { setSessionCookie } from "@/app/lib/server/session";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  const db = await loadDb();
  const user = db.users.find((u) => u.id === auth.user.id)!;
  const sub = db.subscriptions.find(
    (s) => s.userId === user.id && s.status === "active" && new Date(s.endsAt).getTime() > Date.now(),
  );
  const plan = sub ? db.plans.find((p) => p.id === sub.planId) : null;
  return NextResponse.json({
    user: publicUser(user),
    trialDaysRemaining: trialDaysRemaining(user),
    subscription: sub
      ? { ...sub, planName: plan?.name, planPrice: plan?.price }
      : null,
  });
}

export async function PUT(req: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  let body: {
    name?: string;
    phone?: string;
    country?: string;
    currentPassword?: string;
    newPassword?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  try {
    const user = await updateDb(async (db) => {
      const u = db.users.find((x) => x.id === auth.user.id);
      if (!u) throw new Error("NOT_FOUND");
      if (body.name !== undefined) {
        const name = body.name.trim();
        if (!name) throw new Error("Name is required.");
        u.name = name;
      }
      if (body.phone !== undefined) u.phone = body.phone.trim();
      if (body.country !== undefined) u.country = body.country.trim();
      if (body.newPassword) {
        if (!body.currentPassword) throw new Error("Current password required.");
        const ok = await verifyPassword(body.currentPassword, u.passwordHash);
        if (!ok) throw new Error("Current password is incorrect.");
        if (body.newPassword.length < 6) throw new Error("New password must be at least 6 characters.");
        u.passwordHash = await hashPassword(body.newPassword);
      }
      u.updatedAt = now();
      return u;
    });

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({ user: publicUser(user) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    if (msg === "NOT_FOUND") return jsonError("User not found", 404);
    return jsonError(msg);
  }
}
