"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "../BrandLogo";

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
      <BrandLogo
        href="/portal"
        className="logo"
        subtitle="Customer portal"
        gradId="portalSideLogoGrad"
        onClick={onClose}
      />

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
