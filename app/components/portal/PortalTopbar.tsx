"use client";

import { TopbarUserCluster } from "../TopbarUserCluster";
import type { AuthSession } from "../../lib/auth";
import { useTheme } from "../../lib/theme";

export function PortalTopbar({
  user,
  unread,
  title,
  onMenu,
}: {
  user: Extract<AuthSession, { role: "customer" }>;
  unread: number;
  title: string;
  onMenu: () => void;
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="portal-topbar admin-topbar">
      <div className="topbar-lead">
        <button type="button" className="portal-menu-btn" onClick={onMenu}>
          ☰
        </button>
        <div className="topbar-title-block">
          <div className="admin-topbar-kicker">Customer portal</div>
          <div className="admin-topbar-title" title={title}>
            {title}
          </div>
        </div>
      </div>
      <div className="topbar-actions">
        <button
          type="button"
          className="theme-toggle"
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          onClick={toggleTheme}
        >
          {theme === "light" ? "☾" : "☀"}
        </button>
        <TopbarUserCluster
          name={user.name}
          unread={unread}
          profileHref="/portal/profile"
          notificationsHref="/portal/notifications"
          settingsHref="/portal/subscription"
        />
      </div>
    </div>
  );
}
