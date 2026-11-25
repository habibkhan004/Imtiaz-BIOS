"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BrandLogo } from "../BrandLogo";

export function TechSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const isQueue = pathname === "/tech" && type !== "upload";
  const isPending = pathname === "/tech" && type === "upload";

  return (
    <aside className={`portal-sidebar admin-sidebar${open ? " open" : ""}`}>
      <BrandLogo
        href="/tech"
        className="logo"
        subtitle="Tech console"
        gradId="techSideLogoGrad"
        onClick={onClose}
      />

      <nav className="admin-side-nav" aria-label="Technician portal">
        <div className="admin-nav-group">
          <div className="admin-nav-label">Queue</div>
          <Link
            href="/tech"
            className={`admin-nav-link${isQueue ? " active" : ""}`}
            onClick={onClose}
          >
            Requests
          </Link>
          <Link
            href="/tech?type=upload"
            className={`admin-nav-link${isPending ? " active" : ""}`}
            onClick={onClose}
          >
            Uploads
          </Link>
        </div>
        <div className="admin-side-foot">
          <Link href="/" className="admin-nav-link admin-back-site" onClick={onClose}>
            ← Back to site
          </Link>
        </div>
      </nav>
    </aside>
  );
}
