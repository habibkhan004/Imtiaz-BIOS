export { assertCanDownload, isTrialActive, trialDaysRemaining, hasActiveSubscription } from "../server/entitlement";
export type { EntitlementResult } from "../server/entitlement";

import type { Database, FileAsset, User } from "../domain/types";
import { assertCanDownload } from "../server/entitlement";
import { jsonError, requireSession } from "../server/http";
import { loadDb } from "../server/db";
import { NextResponse } from "next/server";

/**
 * Server helper: auth + entitlement for a file id.
 * Staff may download for review (audited separately by caller).
 */
export async function requireEntitlement(fileId: string): Promise<
  | {
      ok: true;
      user: User;
      file: FileAsset;
      entitlement: Extract<ReturnType<typeof assertCanDownload>, { ok: true }>;
      db: Database;
    }
  | { ok: false; response: NextResponse }
> {
  const auth = await requireSession();
  if (!auth.ok) return auth;
  const db = await loadDb();
  const user = db.users.find((u) => u.id === auth.user.id);
  const file = db.files.find((f) => f.id === fileId);
  if (!user || !file) {
    return { ok: false, response: jsonError("Not found", 404, "NOT_FOUND") };
  }
  const entitlement = assertCanDownload(db, user, file);
  if (!entitlement.ok) {
    return {
      ok: false,
      response: jsonError(entitlement.message, 403, "NO_ENTITLEMENT"),
    };
  }
  return { ok: true, user, file, entitlement, db };
}
