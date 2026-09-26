export type AuthSession =
  | { role: "customer"; email: string; name: string; userId?: string }
  | { role: "technician"; email: string; name: string; userId?: string }
  | { role: "admin"; email: string; name: string; userId?: string };

export const AUTH_KEY = "imtiaz-auth";

export const TECH_DEMO_EMAIL = "tech@imtiaz.demo";
export const ADMIN_DEMO_EMAIL = "admin@imtiaz.demo";

/** Seeded API demo accounts (password in .env.example). */
export const API_DEMO = {
  admin: "admin@imtiazbios.local",
  tech: "tech@imtiazbios.local",
  user: "user@imtiazbios.local",
} as const;

export function isTechnicianEmail(email: string) {
  const e = email.trim().toLowerCase();
  return (
    e === TECH_DEMO_EMAIL ||
    e === API_DEMO.tech ||
    e.endsWith("@imtiaz.tech") ||
    e.startsWith("tech@")
  );
}

export function isAdminEmail(email: string) {
  const e = email.trim().toLowerCase();
  return (
    e === ADMIN_DEMO_EMAIL ||
    e === API_DEMO.admin ||
    e.endsWith("@imtiaz.admin") ||
    e.startsWith("admin@")
  );
}

export function readAuth(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (
      (parsed?.role === "customer" ||
        parsed?.role === "technician" ||
        parsed?.role === "admin") &&
      parsed.email &&
      parsed.name
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeAuth(session: AuthSession) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("imtiaz-auth-change"));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event("imtiaz-auth-change"));
}

export function homeForRole(role: AuthSession["role"]) {
  if (role === "admin") return "/admin";
  if (role === "technician") return "/tech";
  return "/portal";
}

export function roleFromApi(role: string): AuthSession["role"] {
  if (role === "ADMIN" || role === "admin") return "admin";
  if (role === "TECHNICIAN" || role === "technician") return "technician";
  return "customer";
}

/** Mirror HTTP-only session into localStorage for existing shells. */
export async function syncAuthFromServer(): Promise<AuthSession | null> {
  try {
    const res = await fetch("/api/auth/session", { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.authenticated || !data.user) {
      clearAuth();
      return null;
    }
    const session: AuthSession = {
      role: data.user.clientRole || roleFromApi(data.user.role),
      email: data.user.email,
      name: data.user.name,
      userId: data.user.id,
    };
    writeAuth(session);
    return session;
  } catch {
    return readAuth();
  }
}

export async function logoutEverywhere() {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {
    /* ignore */
  }
  clearAuth();
}
