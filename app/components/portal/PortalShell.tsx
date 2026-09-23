"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { readAuth, type AuthSession } from "../../lib/auth";
import { NOTIFICATIONS } from "../../lib/portal-data";
import { PortalSidebar } from "./PortalSidebar";
import { PortalTopbar } from "./PortalTopbar";

const TITLES: Record<string, string> = {
  "/portal": "Dashboard",
  "/portal/profile": "Profile",
  "/portal/downloads": "Downloads",
  "/portal/requests": "File Requests",
  "/portal/support": "Tech Support",
  "/portal/uploads": "Upload File",
  "/portal/uploads/mine": "My Uploads",
  "/portal/subscription": "Subscription",
  "/portal/payments": "Payments",
  "/portal/notifications": "Notifications",
};

function titleFor(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/portal/requests/")) return "Request detail";
  if (pathname.startsWith("/portal/support/")) return "Support detail";
  return "Customer portal";
}

const READ_KEY = "imtiaz-notif-read";

export function PortalShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    const session = readAuth();
    setUser(session);
    setReady(true);
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (session.role === "technician") {
      router.replace("/tech");
      return;
    }
    if (session.role === "admin") {
      router.replace("/admin");
      return;
    }
    try {
      const raw = localStorage.getItem(READ_KEY);
      if (raw) setReadIds(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, [pathname, router]);

  useEffect(() => {
    const sync = () => setUser(readAuth());
    window.addEventListener("imtiaz-auth-change", sync);
    return () => window.removeEventListener("imtiaz-auth-change", sync);
  }, []);

  const unread = useMemo(() => {
    return NOTIFICATIONS.filter((n) => !n.read && !readIds.includes(n.id)).length;
  }, [readIds]);

  if (!ready || !user || user.role !== "customer") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "var(--text-secondary)",
        }}
      >
        Checking session…
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
      <PortalSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="portal-main">
        <PortalTopbar
          user={user}
          unread={unread}
          title={titleFor(pathname)}
          onMenu={() => setMenuOpen(true)}
        />
        <div className="portal-content admin-content">{children}</div>
      </div>
    </div>
  );
}
