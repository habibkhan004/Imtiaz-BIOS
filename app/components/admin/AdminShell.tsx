"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { readAuth, type AuthSession } from "../../lib/auth";
import { getDashboardStats } from "../../lib/admin-data";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "User Management",
  "/admin/files": "File Management",
  "/admin/uploads": "Upload Review",
  "/admin/categories": "Categories",
  "/admin/brands": "Brands",
  "/admin/services": "Services",
  "/admin/requests": "Requests",
  "/admin/support": "Support Tickets",
  "/admin/plans": "Plans",
  "/admin/subscriptions": "Subscriptions",
  "/admin/payments": "Payments",
  "/admin/reports": "Reports",
  "/admin/settings": "Settings",
  "/admin/audit": "Audit Logs",
};

function titleFor(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/admin/users/")) return "User detail";
  if (pathname.startsWith("/admin/files/")) return "File detail";
  if (pathname.startsWith("/admin/uploads/")) return "Upload review";
  if (pathname.startsWith("/admin/requests/")) return "Request detail";
  if (pathname.startsWith("/admin/support/")) return "Support detail";
  if (pathname.startsWith("/admin/subscriptions/")) return "Subscription detail";
  return "Administration";
}

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const session = readAuth();
    setUser(session);
    setReady(true);
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (session.role === "customer") {
      router.replace("/portal");
      return;
    }
    if (session.role === "technician") {
      router.replace("/tech");
    }
  }, [pathname, router]);

  useEffect(() => {
    const sync = () => setUser(readAuth());
    window.addEventListener("imtiaz-auth-change", sync);
    return () => window.removeEventListener("imtiaz-auth-change", sync);
  }, []);

  const alerts = useMemo(() => {
    const s = getDashboardStats();
    return s.uploadsPending + s.openFileRequests + s.failedPayments;
  }, []);

  if (!ready || !user || user.role !== "admin") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "var(--text-secondary)",
        }}
      >
        Checking admin session…
      </div>
    );
  }

  return (
    <div className="portal-shell admin-shell">
      <div className="admin-shell-glow" aria-hidden />
      {menuOpen ? (
        <button
          type="button"
          className="portal-sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="portal-main">
        <AdminTopbar
          user={user}
          alerts={alerts}
          title={titleFor(pathname)}
          onMenu={() => setMenuOpen(true)}
        />
        <div className="portal-content admin-content">{children}</div>
      </div>
    </div>
  );
}
