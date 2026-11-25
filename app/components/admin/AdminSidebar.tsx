"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "../BrandLogo";

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
      { href: "/admin/testimonials", label: "Client feedback" },
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
      <BrandLogo
        href="/admin"
        className="logo"
        subtitle="Admin console"
        gradId="adminSideLogoGrad"
        onClick={onClose}
      />

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
