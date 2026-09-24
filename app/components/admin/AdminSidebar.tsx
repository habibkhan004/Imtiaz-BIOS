"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", exact: true }],
  },
  {
    label: "People",
    items: [{ href: "/admin/users", label: "Users" }],
  },
  {
    label: "Library",
    items: [
      { href: "/admin/files", label: "Files" },
      { href: "/admin/uploads", label: "Upload Review" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/brands", label: "Brands" },
      { href: "/admin/services", label: "Services" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/requests", label: "Requests" },
      { href: "/admin/support", label: "Support Tickets" },
    ],
  },
  {
    label: "Billing",
    items: [
      { href: "/admin/plans", label: "Plans" },
      { href: "/admin/subscriptions", label: "Subscriptions" },
      { href: "/admin/payments", label: "Payments" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/reports", label: "Reports" },
      { href: "/admin/settings", label: "Settings" },
      { href: "/admin/audit", label: "Audit Logs" },
    ],
  },
] as const;

function active(pathname: string, href: string, exact?: boolean) {
  if (exact || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className={`portal-sidebar admin-sidebar${open ? " open" : ""}`}>
      <Link href="/admin" className="logo" onClick={onClose}>
        <svg className="logo-mark" viewBox="0 0 34 34" fill="none" aria-hidden>
          <rect
            x="8"
            y="8"
            width="18"
            height="18"
            rx="3"
            stroke="url(#adminSideLogoGrad)"
            strokeWidth="2"
          />
          <rect
            x="13"
            y="13"
            width="8"
            height="8"
            rx="2"
            fill="url(#adminSideLogoGrad)"
          />
          <path
            d="M12 2V8M17 2V8M22 2V8M12 26V32M17 26V32M22 26V32M2 12H8M2 17H8M2 22H8M26 12H32M26 17H32M26 22H32"
            stroke="#4a6a8a"
            strokeWidth="1.4"
          />
          <defs>
            <linearGradient
              id="adminSideLogoGrad"
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
          <small>Admin console</small>
        </span>
      </Link>

      <nav className="admin-side-nav" aria-label="Admin">
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
