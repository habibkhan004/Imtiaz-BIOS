"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutEverywhere } from "../lib/auth";

export function BellIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
    </svg>
  );
}

export function SettingsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function LogoutIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

export function TopbarUserCluster({
  name,
  profileHref,
  notificationsHref,
  settingsHref,
  unread = 0,
  showLogout = true,
}: {
  name: string;
  profileHref: string;
  notificationsHref: string;
  settingsHref: string;
  unread?: number;
  showLogout?: boolean;
}) {
  const router = useRouter();
  const initial = (name?.trim()?.[0] || "U").toUpperCase();

  return (
    <div className="topbar-user-cluster">
      <span className="portal-topbar-name">{name}</span>
      <Link href={profileHref} className="header-avatar-btn" aria-label="Profile" title="Profile">
        {initial}
      </Link>
      <Link
        href={notificationsHref}
        className={`header-icon-btn${unread > 0 ? " has-unread" : ""}`}
        aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
        title="Notifications"
      >
        <BellIcon />
        {unread > 0 ? <span className="header-icon-dot" aria-hidden /> : null}
      </Link>
      <Link
        href={settingsHref}
        className="header-icon-btn"
        aria-label="Settings"
        title="Settings"
      >
        <SettingsIcon />
      </Link>
      {showLogout ? (
        <button
          type="button"
          className="logout-btn"
          onClick={async () => {
            await logoutEverywhere();
            router.push("/");
          }}
        >
          <LogoutIcon />
          Logout
        </button>
      ) : null}
    </div>
  );
}
