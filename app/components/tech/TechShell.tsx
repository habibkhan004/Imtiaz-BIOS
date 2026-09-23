"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { readAuth, type AuthSession } from "../../lib/auth";
import { TECH_CHANGE_EVENT, unreadMessageCount } from "../../lib/tech-data";
import { TechSidebar } from "./TechSidebar";
import { TechTopbar } from "./TechTopbar";

function titleFor(pathname: string, type: string | null) {
  if (pathname === "/tech" && type === "upload") return "Pending verification";
  if (pathname === "/tech") return "Assigned requests";
  if (pathname.startsWith("/tech/review/")) return "Technical review";
  if (pathname.startsWith("/tech/verification/")) return "File verification";
  if (pathname.startsWith("/tech/notes/")) return "Technical notes";
  if (pathname.includes("/status")) return "Status update";
  if (pathname.startsWith("/tech/messages/")) return "Customer messages";
  return "Technician portal";
}

function TechShellInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

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
    if (session.role === "admin") {
      router.replace("/admin");
      return;
    }
  }, [pathname, router]);

  useEffect(() => {
    const sync = () => setUser(readAuth());
    window.addEventListener("imtiaz-auth-change", sync);
    return () => window.removeEventListener("imtiaz-auth-change", sync);
  }, []);

  useEffect(() => {
    const syncUnread = () => setUnread(unreadMessageCount());
    syncUnread();
    window.addEventListener(TECH_CHANGE_EVENT, syncUnread);
    window.addEventListener("storage", syncUnread);
    return () => {
      window.removeEventListener(TECH_CHANGE_EVENT, syncUnread);
      window.removeEventListener("storage", syncUnread);
    };
  }, []);

  if (!ready || !user || user.role !== "technician") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "var(--text-secondary)",
        }}
      >
        Checking technician session…
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
      <TechSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="portal-main">
        <TechTopbar
          user={user}
          unread={unread}
          title={titleFor(pathname, searchParams.get("type"))}
          onMenu={() => setMenuOpen(true)}
        />
        <div className="portal-content admin-content">{children}</div>
      </div>
    </div>
  );
}

export function TechShell({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            color: "var(--text-secondary)",
          }}
        >
          Loading technician portal…
        </div>
      }
    >
      <TechShellInner>{children}</TechShellInner>
    </Suspense>
  );
}
