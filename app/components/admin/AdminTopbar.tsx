"use client";

import { TopbarUserCluster } from "../TopbarUserCluster";
import type { AuthSession } from "../../lib/auth";

export function AdminTopbar({
  user,
  alerts,
  title,
  onMenu,
}: {
  user: Extract<AuthSession, { role: "admin" }>;
  alerts: number;
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
          <div className="admin-topbar-kicker">Administration</div>
          <div className="admin-topbar-title">{title}</div>
        </div>
      </div>
      <TopbarUserCluster
        name={user.name}
        unread={alerts}
        profileHref="/admin/settings"
        notificationsHref="/admin/audit"
        settingsHref="/admin/settings"
      />
    </div>
  );
}
