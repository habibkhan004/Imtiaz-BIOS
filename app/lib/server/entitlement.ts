import type { Database, FileAsset, User } from "../domain/types";

export type EntitlementResult =
  | { ok: true; reason: "free" | "trial" | "subscription" | "purchase" | "admin" }
  | { ok: false; reason: "unauthenticated" | "suspended" | "not_published" | "no_entitlement"; message: string };

export function isTrialActive(user: User, settings: Database["settings"]): boolean {
  if (!settings.introEnabled) return false;
  const end = new Date(user.trialEndDate).getTime();
  return Number.isFinite(end) && end > Date.now();
}

export function trialDaysRemaining(user: User): number {
  const end = new Date(user.trialEndDate).getTime();
  if (!Number.isFinite(end)) return 0;
  return Math.max(0, Math.ceil((end - Date.now()) / 86400000));
}

export function hasActiveSubscription(db: Database, userId: string): boolean {
  const now = Date.now();
  return db.subscriptions.some(
    (s) =>
      s.userId === userId &&
      s.status === "active" &&
      new Date(s.endsAt).getTime() > now,
  );
}

export function hasPaidPurchase(db: Database, userId: string, fileId: string): boolean {
  return db.payments.some(
    (p) =>
      p.userId === userId &&
      p.status === "paid" &&
      p.purpose === `file:${fileId}`,
  );
}

/** Central entitlement gate for restricted downloads (FR-13 / §9). */
export function assertCanDownload(
  db: Database,
  user: User | null | undefined,
  file: FileAsset,
): EntitlementResult {
  if (!user) {
    return { ok: false, reason: "unauthenticated", message: "Sign in required." };
  }
  if (user.status === "Suspended") {
    return { ok: false, reason: "suspended", message: "Account suspended." };
  }
  if (user.role === "ADMIN" || user.role === "TECHNICIAN") {
    return { ok: true, reason: "admin" };
  }
  if (file.status !== "published") {
    return { ok: false, reason: "not_published", message: "File is not available." };
  }
  if (file.accessType === "free" || file.price <= 0) {
    return { ok: true, reason: "free" };
  }
  const settings = db.settings;
  if (
    isTrialActive(user, settings) &&
    settings.introCoversAccessTypes.includes(file.accessType) &&
    (settings.introCategoryIds.length === 0 ||
      settings.introCategoryIds.includes(file.categoryId))
  ) {
    return { ok: true, reason: "trial" };
  }
  if (hasActiveSubscription(db, user.id)) {
    return { ok: true, reason: "subscription" };
  }
  if (hasPaidPurchase(db, user.id, file.id)) {
    return { ok: true, reason: "purchase" };
  }
  return {
    ok: false,
    reason: "no_entitlement",
    message: "Subscribe or purchase to download this file.",
  };
}
