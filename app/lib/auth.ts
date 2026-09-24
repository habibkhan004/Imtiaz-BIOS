export type AuthSession =
  | { role: "customer"; email: string; name: string }
  | { role: "technician"; email: string; name: string }
  | { role: "admin"; email: string; name: string };

export const AUTH_KEY = "imtiaz-auth";

export const TECH_DEMO_EMAIL = "tech@imtiaz.demo";
export const ADMIN_DEMO_EMAIL = "admin@imtiaz.demo";

export function isTechnicianEmail(email: string) {
  const e = email.trim().toLowerCase();
  return e === TECH_DEMO_EMAIL || e.endsWith("@imtiaz.tech") || e.startsWith("tech@");
}

export function isAdminEmail(email: string) {
  const e = email.trim().toLowerCase();
  return e === ADMIN_DEMO_EMAIL || e.endsWith("@imtiaz.admin") || e.startsWith("admin@");
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
