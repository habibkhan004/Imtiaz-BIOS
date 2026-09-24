"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

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
      <Link href="/tech" className="logo" onClick={onClose}>
        <svg className="logo-mark" viewBox="0 0 34 34" fill="none" aria-hidden>
          <rect
            x="8"
            y="8"
            width="18"
            height="18"
            rx="3"
            stroke="url(#techSideLogoGrad)"
            strokeWidth="2"
          />
          <rect
            x="13"
            y="13"
            width="8"
            height="8"
            rx="2"
            fill="url(#techSideLogoGrad)"
          />
          <path
            d="M12 2V8M17 2V8M22 2V8M12 26V32M17 26V32M22 26V32M2 12H8M2 17H8M2 22H8M26 12H32M26 17H32M26 22H32"
            stroke="#4a6a8a"
            strokeWidth="1.4"
          />
          <defs>
            <linearGradient
              id="techSideLogoGrad"
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
          <small>Tech console</small>
        </span>
      </Link>

      <nav className="admin-side-nav" aria-label="Technician portal">
        <div className="admin-nav-group">
          <div className="admin-nav-label">Queue</div>
          <Link
            href="/tech"
            className={`admin-nav-link${isQueue ? " active" : ""}`}
            onClick={onClose}
          >
            Assigned requests
          </Link>
          <Link
            href="/tech?type=upload"
            className={`admin-nav-link${isPending ? " active" : ""}`}
            onClick={onClose}
          >
            Pending verification
          </Link>
        </div>
      </nav>

      <div className="admin-side-foot">
        <Link href="/" className="admin-nav-link admin-back-site" onClick={onClose}>
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
