"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutEverywhere, readAuth, type AuthSession } from "../lib/auth";
import { LogoutIcon, TopbarUserCluster } from "./TopbarUserCluster";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/library", label: "Library" },
  { href: "/categories", label: "Categories" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/testimonials", label: "Testimonials" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function roleLinks(user: AuthSession) {
  if (user.role === "admin") {
    return {
      consoleHref: "/admin",
      consoleLabel: "Admin",
      profileHref: "/admin/settings",
      notificationsHref: "/admin/audit",
      settingsHref: "/admin/settings",
    };
  }
  if (user.role === "technician") {
    return {
      consoleHref: "/tech",
      consoleLabel: "Tech console",
      profileHref: "/tech",
      notificationsHref: "/tech",
      settingsHref: "/tech?type=upload",
    };
  }
  return {
    consoleHref: "/portal",
    consoleLabel: "Portal",
    profileHref: "/portal/profile",
    notificationsHref: "/portal/notifications",
    settingsHref: "/portal/subscription",
  };
}

export function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const [user, setUser] = useState<AuthSession | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const sync = () => setUser(readAuth());
    sync();
    window.addEventListener("imtiaz-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("imtiaz-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  const closeNav = () => setNavOpen(false);
  const links = user ? roleLinks(user) : null;

  const onLogout = async () => {
    await logoutEverywhere();
    setUser(null);
    router.push("/");
  };

  return (
    <header>
      <nav className="site-nav">
        <Link href="/" className="logo nav-brand" onClick={closeNav}>
          <svg className="logo-mark" viewBox="0 0 34 34" fill="none">
            <rect
              x="8"
              y="8"
              width="18"
              height="18"
              rx="3"
              stroke="url(#logoGrad)"
              strokeWidth="2"
            />
            <rect x="13" y="13" width="8" height="8" rx="2" fill="url(#logoGrad)" />
            <path
              d="M12 2V8M17 2V8M22 2V8M12 26V32M17 26V32M22 26V32M2 12H8M2 17H8M2 22H8M26 12H32M26 17H32M26 22H32"
              stroke="#4a6a8a"
              strokeWidth="1.4"
            />
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d4ff" />
                <stop offset="100%" stopColor="#0099cc" />
              </linearGradient>
            </defs>
          </svg>
          <span>
            <span className="logo-text">IMTIAZ BIOS</span>
            <small>Advanced Repair Lab</small>
          </span>
        </Link>

        <div className={`nav-links${navOpen ? " open" : ""}`} id="navLinks">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeNav}
              style={
                isActive(pathname, item.href)
                  ? { color: "var(--accent-cyan)" }
                  : undefined
              }
            >
              {item.label}
            </Link>
          ))}
          {links ? (
            <Link href={links.consoleHref} onClick={closeNav}>
              {links.consoleLabel}
            </Link>
          ) : null}
          <a
            href="https://t.me/IMTIAZBIOS1"
            target="_blank"
            rel="noopener noreferrer"
            className="telegram-link"
            onClick={closeNav}
          >
            📨 Telegram
          </a>
        </div>

        <div className="nav-cta">
          {user && links ? (
            <>
              <TopbarUserCluster
                name={user.name}
                profileHref={links.profileHref}
                notificationsHref={links.notificationsHref}
                settingsHref={links.settingsHref}
                showLogout={false}
              />
              <button type="button" className="logout-btn site-header-logout" onClick={onLogout}>
                <LogoutIcon />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/library" className="btn btn-outline btn-sm" onClick={closeNav}>
                Browse
              </Link>
              <Link href="/login" className="btn btn-primary btn-sm" onClick={closeNav}>
                Login
              </Link>
            </>
          )}
          <button
            className="nav-toggle"
            id="navToggle"
            aria-label="Toggle menu"
            type="button"
            onClick={() => setNavOpen((o) => !o)}
          >
            ☰
          </button>
        </div>
      </nav>
    </header>
  );
}
