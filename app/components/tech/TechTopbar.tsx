"use client";

import { TopbarUserCluster } from "../TopbarUserCluster";
import type { AuthSession } from "../../lib/auth";

export function TechTopbar({
  user,
  unread,
  title,
  onMenu,
}: {
  user: Extract<AuthSession, { role: "technician" }>;
  unread: number;
  title: string;
  onMenu: () => void;
}) {
  return (
    <div className="portal-topbar admin-topbar">
      <div className="topbar-lead">
        <button type="button" className="portal-menu-btn" onClick={onMenu}>
          ☰
        </button>
        <div className="topbar-title-block">
          <div className="admin-topbar-kicker">Technician portal</div>
          <div className="admin-topbar-title" title={title}>
            {title}
          </div>
        </div>
      </div>
      <div className="topbar-actions">
        <TopbarUserCluster
          name={user.name}
          unread={unread}
          profileHref="/tech"
          notificationsHref="/tech"
          settingsHref="/tech?type=upload"
        />
      </div>
    </div>
  );
}
