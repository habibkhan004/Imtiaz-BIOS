"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const closeNav = () => setNavOpen(false);

  return (
    <header>
      <nav>
        <Link href="/" className="logo" onClick={closeNav}>
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
          <Link href="/#services" onClick={closeNav}>
            Services
          </Link>
          <Link href="/#library" onClick={closeNav}>
            Library
          </Link>
          <Link href="/#unlock" onClick={closeNav}>
            Unlock
          </Link>
          <Link href="/#why" onClick={closeNav}>
            Why Us
          </Link>
          <Link href="/#faq" onClick={closeNav}>
            FAQ
          </Link>
          <Link href="/#contact" onClick={closeNav}>
            Contact
          </Link>
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
          <Link href="/#library" className="btn btn-outline btn-sm">
            Browse
          </Link>
          <Link href="/#upload-tab" className="btn btn-primary btn-sm">
            Upload
          </Link>
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
