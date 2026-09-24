import { NextRequest, NextResponse } from "next/server";
import type { SubscriptionPlan, UserSubscription } from "@/app/lib/domain/types";
import { loadDb, now, randomUUID, updateDb } from "@/app/lib/server/db";
import { writeAudit } from "@/app/lib/server/audit";
import { jsonError, requireSession } from "@/app/lib/server/http";
import { pushNotification } from "@/app/lib/server/notifications";
import { getSession } from "@/app/lib/server/session";

export async function GET() {
  const db = await loadDb();
  const session = await getSession();
  const plans = db.plans.filter((p) => p.active || session?.role === "ADMIN");
  let subscription = null;
  if (session) {
    const sub = db.subscriptions.find(
      (s) =>
        s.userId === session.userId &&
        s.status === "active" &&
        new Date(s.endsAt).getTime() > Date.now(),
    );
    if (sub) {
      const plan = db.plans.find((p) => p.id === sub.planId);
      subscription = { ...sub, plan };
    }
  }
  return NextResponse.json({ plans, subscription });
}

export async function POST(req: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  let body: { planId?: string; action?: "subscribe" | "cancel"; plan?: Partial<SubscriptionPlan> };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  // Admin create plan
  if (body.plan && auth.user.role === "ADMIN") {
    const plan = await updateDb((db) => {
      const p: SubscriptionPlan = {
        id: randomUUID(),
        name: body.plan!.name || "Plan",
        durationDays: Number(body.plan!.durationDays || 30),
        price: Number(body.plan!.price || 0),
        features: body.plan!.features || [],
        active: body.plan!.active !== false,
        createdAt: now(),
      };
      db.plans.push(p);
      writeAudit(db, {
        actorId: auth.user.id,
        action: "plan.create",
        targetType: "plan",
        targetId: p.id,
        summary: `Created plan ${p.name}`,
      });
      return p;
    });
    return NextResponse.json({ plan }, { status: 201 });
  }

  if (body.action === "cancel") {
    await updateDb((db) => {
      for (const s of db.subscriptions) {
        if (s.userId === auth.user.id && s.status === "active") {
          s.status = "cancelled";
        }
      }
      pushNotification(db, {
        userId: auth.user.id,
        type: "subscription",
        title: "Subscription cancelled",
        body: "Your subscription has been cancelled.",
        href: "/portal/subscription",
      });
    });
    return NextResponse.json({ ok: true });
  }

  if (!body.planId) return jsonError("planId required");
  const result = await updateDb((db) => {
    const plan = db.plans.find((p) => p.id === body.planId && p.active);
    if (!plan) return null;
    const paymentId = randomUUID();
    db.payments.unshift({
      id: paymentId,
      userId: auth.user.id,
      amount: plan.price,
      currency: "USD",
      paymentMethod: "demo",
      transactionId: `demo_${paymentId.slice(0, 8)}`,
      status: "paid",
      purpose: `subscription:${plan.id}`,
      createdAt: now(),
    });
    const startsAt = now();
    const endsAt = new Date(Date.now() + plan.durationDays * 86400000).toISOString();
    const existing = db.subscriptions.find(
      (s) => s.userId === auth.user.id && s.status === "active",
    );
    if (existing) {
      existing.endsAt = new Date(
        Math.max(new Date(existing.endsAt).getTime(), Date.now()) + plan.durationDays * 86400000,
      ).toISOString();
      existing.planId = plan.id;
      existing.paymentId = paymentId;
      pushNotification(db, {
        userId: auth.user.id,
        type: "subscription",
        title: "Subscription renewed",
        body: `${plan.name} extended to ${new Date(existing.endsAt).toLocaleDateString()}.`,
        href: "/portal/subscription",
      });
      return existing;
    }
    const sub: UserSubscription = {
      id: randomUUID(),
      userId: auth.user.id,
      planId: plan.id,
      status: "active",
      startsAt,
      endsAt,
      paymentId,
      createdAt: startsAt,
    };
    db.subscriptions.unshift(sub);
    const user = db.users.find((u) => u.id === auth.user.id);
    if (user) user.subscriptionId = sub.id;
    pushNotification(db, {
      userId: auth.user.id,
      type: "payment",
      title: "Payment successful",
      body: `Subscribed to ${plan.name} (demo payment).`,
      href: "/portal/payments",
    });
    return sub;
  });

  if (!result) return jsonError("Plan not found", 404);
  return NextResponse.json({ subscription: result });
}
