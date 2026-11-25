"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logoutEverywhere, readAuth, type AuthSession } from "../lib/auth";
import { CART_EVENT, cartCount } from "../lib/cart";
import { SERVICES } from "../lib/site-data";
import { useTheme } from "../lib/theme";
import { BrandLogo } from "./BrandLogo";
import { LogoutIcon, TopbarUserCluster } from "./TopbarUserCluster";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/library", label: "Files" },
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
  const [servicesOpen, setServicesOpen] = useState(false);
  const [user, setUser] = useState<AuthSession | null>(null);
  const [count, setCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => {
      const auth = readAuth();
      setUser(auth);
      setCount(cartCount(auth?.userId));
    };
    sync();
    window.addEventListener("imtiaz-auth-change", sync);
    window.addEventListener("storage", sync);
    window.addEventListener(CART_EVENT, sync);
    return () => {
      window.removeEventListener("imtiaz-auth-change", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener(CART_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNavOpen(false);
        setServicesOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setNavOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("nav-open", navOpen);
    return () => document.body.classList.remove("nav-open");
  }, [navOpen]);

  useEffect(() => {
    if (!servicesOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!servicesRef.current?.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [servicesOpen]);

  const closeNav = () => {
    setNavOpen(false);
    setServicesOpen(false);
  };
  const links = user ? roleLinks(user) : null;
  const servicesActive = isActive(pathname, "/services");

  const onLogout = async () => {
    await logoutEverywhere();
    setUser(null);
    router.push("/");
  };

  return (
    <header>
      <nav className="site-nav">
        <BrandLogo
          href="/"
          className="logo nav-brand"
          subtitle="Advanced Repair Lab"
          gradId="headerLogoGrad"
          onClick={closeNav}
        />

        <div className={`nav-links${navOpen ? " open" : ""}`} id="navLinks">
          <Link
            href="/"
            onClick={closeNav}
            style={
              isActive(pathname, "/")
                ? { color: "var(--accent-cyan)" }
                : undefined
            }
          >
            Home
          </Link>

          <div
            className={`nav-dropdown${servicesOpen ? " open" : ""}`}
            ref={servicesRef}
          >
            <button
              type="button"
              className="nav-dropdown-trigger"
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              style={servicesActive ? { color: "var(--accent-cyan)" } : undefined}
              onClick={() => setServicesOpen((o) => !o)}
            >
              Services
              <span className="nav-dropdown-caret" aria-hidden>
                ▾
              </span>
            </button>
            <div className="nav-dropdown-menu" role="menu">
              {SERVICES.map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  role="menuitem"
                  onClick={closeNav}
                  className={
                    pathname === `/services/${s.slug}` ? "is-active" : undefined
                  }
                >
                  <span aria-hidden>{s.icon}</span>
                  {s.title}
                </Link>
              ))}
              <Link
                href="/services"
                role="menuitem"
                className="nav-dropdown-all"
                onClick={closeNav}
              >
                View all services →
              </Link>
            </div>
          </div>

          {NAV.filter((item) => item.href !== "/").map((item) => (
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
          {user && links ? (
            <div className="nav-account-panel">
              <div className="nav-account-label">Account</div>
              <TopbarUserCluster
                name={user.name}
                profileHref={links.profileHref}
                notificationsHref={links.notificationsHref}
                settingsHref={links.settingsHref}
                showLogout
                onNavigate={closeNav}
              />
            </div>
          ) : null}
        </div>

        <div className="nav-cta">
          <button
            type="button"
            className="theme-toggle"
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            title={theme === "light" ? "Dark mode" : "Light mode"}
            onClick={toggleTheme}
          >
            {theme === "light" ? "☾" : "☀"}
          </button>
          <Link href="/cart" className="nav-cart-link" onClick={closeNav} aria-label="Cart">
            Cart
            {count > 0 ? <span className="nav-cart-badge">{count}</span> : null}
          </Link>
          {user && links ? (
            <div className="nav-cta-account">
              <TopbarUserCluster
                name={user.name}
                profileHref={links.profileHref}
                notificationsHref={links.notificationsHref}
                settingsHref={links.settingsHref}
                showLogout={false}
              />
              <button
                type="button"
                className="logout-btn site-header-logout"
                onClick={onLogout}
                aria-label="Logout"
                title="Logout"
              >
                <LogoutIcon />
                <span className="logout-btn-label">Logout</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/library"
                className="btn btn-outline btn-sm nav-browse-btn"
                onClick={closeNav}
              >
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
