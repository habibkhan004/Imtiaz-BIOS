/**
 * Modular auth surface (§16 / §17).
 * Client session helpers remain in `app/lib/auth.ts` (localStorage mirror).
 * Server RBAC / sessions live under `app/lib/server/*`.
 */
export {
  requireAuth,
  requireRole,
  requireSession,
  jsonError,
  rateLimit,
  corsHeaders,
} from "../server/http";
export {
  getSession,
  setSessionCookie,
  clearSessionCookie,
  type SessionPayload,
} from "../server/session";
export { hashPassword, verifyPassword } from "../server/password";
export { homeForRole, toClientRole, fromClientRole, type Role } from "../domain/types";
