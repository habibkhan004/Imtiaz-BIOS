"use client";

import { TopbarUserCluster } from "../TopbarUserCluster";
import type { AuthSession } from "../../lib/auth";

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
  return (
    <div className="portal-topbar admin-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <button type="button" className="portal-menu-btn" onClick={onMenu}>
          ☰
        </button>
        <div style={{ minWidth: 0 }}>
          <div className="admin-topbar-kicker">Customer portal</div>
          <div className="admin-topbar-title">{title}</div>
        </div>
      </div>
      <TopbarUserCluster
        name={user.name}
        unread={unread}
        profileHref="/portal/profile"
        notificationsHref="/portal/notifications"
        settingsHref="/portal/subscription"
      />
    </div>
  );
}
