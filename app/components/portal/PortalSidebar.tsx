"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_GROUPS = [
  {
    label: "Account",
    items: [
      { href: "/portal", label: "Dashboard", exact: true },
      { href: "/portal/profile", label: "Profile" },
      { href: "/portal/notifications", label: "Notifications" },
    ],
  },
  {
    label: "Library",
    items: [
      { href: "/portal/downloads", label: "Downloads" },
      { href: "/portal/uploads", label: "Upload File", exact: true },
      { href: "/portal/uploads/mine", label: "My Uploads" },
    ],
  },
  {
    label: "Support",
    items: [
      { href: "/portal/requests", label: "File Requests" },
      { href: "/portal/support", label: "Tech Support" },
    ],
  },
  {
    label: "Billing",
    items: [
      { href: "/portal/subscription", label: "Subscription" },
      { href: "/portal/payments", label: "Payments" },
    ],
  },
] as const;

function active(pathname: string, href: string, exact?: boolean) {
  if (exact || href === "/portal") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className={`portal-sidebar admin-sidebar${open ? " open" : ""}`}>
      <Link href="/portal" className="logo" onClick={onClose}>
        <svg className="logo-mark" viewBox="0 0 34 34" fill="none" aria-hidden>
          <rect
            x="8"
            y="8"
            width="18"
            height="18"
            rx="3"
            stroke="url(#portalSideLogoGrad)"
            strokeWidth="2"
          />
          <rect
            x="13"
            y="13"
            width="8"
            height="8"
            rx="2"
            fill="url(#portalSideLogoGrad)"
          />
          <path
            d="M12 2V8M17 2V8M22 2V8M12 26V32M17 26V32M22 26V32M2 12H8M2 17H8M2 22H8M26 12H32M26 17H32M26 22H32"
            stroke="#4a6a8a"
            strokeWidth="1.4"
          />
          <defs>
            <linearGradient
              id="portalSideLogoGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="100%" stopColor="#0099cc" />
            </linearGradient>
          </defs>
        </svg>
        <span>
          <span className="logo-text">IMTIAZ BIOS</span>
          <small>Customer portal</small>
        </span>
      </Link>

      <nav className="admin-side-nav" aria-label="Customer portal">
        {NAV_GROUPS.map((group) => (
          <div className="admin-nav-group" key={group.label}>
            <div className="admin-nav-label">{group.label}</div>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link${active(pathname, item.href, "exact" in item && item.exact) ? " active" : ""}`}
                onClick={onClose}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="admin-side-foot">
        <Link href="/" className="admin-nav-link admin-back-site" onClick={onClose}>
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
