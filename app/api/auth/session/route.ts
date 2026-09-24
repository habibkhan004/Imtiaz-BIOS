import { NextResponse } from "next/server";
import { loadDb, publicUser } from "@/app/lib/server/db";
import { trialDaysRemaining } from "@/app/lib/server/entitlement";
import { getSession } from "@/app/lib/server/session";
import { toClientRole } from "@/app/lib/domain/types";

/** Sync client auth cookie mirror with server session. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }
  const db = await loadDb();
  const user = db.users.find((u) => u.id === session.userId);
  if (!user || user.status === "Suspended") {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      ...publicUser(user),
      clientRole: toClientRole(user.role),
      trialDaysRemaining: trialDaysRemaining(user),
    },
  });
}
