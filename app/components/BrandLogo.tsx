import Link from "next/link";
import type { ReactNode } from "react";

type BrandLogoProps = {
  href?: string;
  subtitle?: string;
  className?: string;
  /** Unique suffix so multiple logos on one page don't clash gradient ids */
  gradId?: string;
  showMark?: boolean;
  onClick?: () => void;
  children?: ReactNode;
};

/** Shared IMTIAZ mark + title — colors follow `--logo-*` theme tokens. */
export function BrandLogo({
  href,
  subtitle,
  className = "logo",
  gradId = "brandLogoGrad",
  showMark = true,
  onClick,
}: BrandLogoProps) {
  const mark = showMark ? (
    <svg className="logo-mark" viewBox="0 0 34 34" fill="none" aria-hidden>
      <rect
        x="8"
        y="8"
        width="18"
        height="18"
        rx="3"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
      />
      <rect
        x="13"
        y="13"
        width="8"
        height="8"
        rx="2"
        fill={`url(#${gradId})`}
      />
      <path
        className="logo-pins"
        d="M12 2V8M17 2V8M22 2V8M12 26V32M17 26V32M22 26V32M2 12H8M2 17H8M2 22H8M26 12H32M26 17H32M26 22H32"
        strokeWidth="1.4"
      />
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--logo-cyan)" />
          <stop offset="100%" stopColor="var(--logo-cyan-dim)" />
        </linearGradient>
      </defs>
    </svg>
  ) : null;

  const label = (
    <span className="logo-label">
      <span className="logo-text">IMTIAZ BIOS</span>
      {subtitle ? <small>{subtitle}</small> : null}
    </span>
  );

  const inner = (
    <>
      {mark}
      {label}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {inner}
      </Link>
    );
  }

  return (
    <span className={className} onClick={onClick}>
      {inner}
    </span>
  );
}
