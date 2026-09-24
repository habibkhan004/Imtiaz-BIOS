import { NextResponse } from "next/server";
import type { Role } from "../domain/types";
import { loadDb, publicUser } from "./db";
import { getSession, type SessionPayload } from "./session";

const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
): { ok: true } | { ok: false; response: NextResponse } {
  const now = Date.now();
  const row = buckets.get(key);
  if (!row || row.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true };
  }
  row.count += 1;
  if (row.count > limit) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Too many requests. Try again later.", code: "RATE_LIMIT" },
        { status: 429 },
      ),
    };
  }
  return { ok: true };
}

export function jsonError(message: string, status = 400, code = "BAD_REQUEST") {
  return NextResponse.json({ error: message, code }, { status });
}

export async function requireSession(
  roles?: Role[],
): Promise<
  | { ok: true; session: SessionPayload; user: NonNullable<ReturnType<typeof publicUser>> }
  | { ok: false; response: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, response: jsonError("Unauthorized", 401, "UNAUTHORIZED") };
  }
  const db = await loadDb();
  const user = db.users.find((u) => u.id === session.userId);
  if (!user || user.status === "Suspended") {
    return { ok: false, response: jsonError("Unauthorized", 401, "UNAUTHORIZED") };
  }
  if (roles && !roles.includes(user.role)) {
    return { ok: false, response: jsonError("Forbidden", 403, "FORBIDDEN") };
  }
  return { ok: true, session, user: publicUser(user) };
}

/** Alias: any authenticated user. */
export const requireAuth = requireSession;

/** Require one of the listed roles (§19). */
export async function requireRole(...roles: Role[]) {
  return requireSession(roles);
}

export function corsHeaders(origin: string | null): HeadersInit {
  const allow = (process.env.CORS_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
  };
  if (origin && allow.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
    headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
  }
  return headers;
}
