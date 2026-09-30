"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "./BrandLogo";

const PIN_COORDS = [
  { x: 80, y: 20, w: 6, h: 26 },
  { x: 100, y: 20, w: 6, h: 26 },
  { x: 120, y: 20, w: 6, h: 26 },
  { x: 140, y: 20, w: 6, h: 26 },
  { x: 160, y: 20, w: 6, h: 26 },
  { x: 180, y: 20, w: 6, h: 26 },
  { x: 200, y: 20, w: 6, h: 26 },
  { x: 80, y: 254, w: 6, h: 26 },
  { x: 100, y: 254, w: 6, h: 26 },
  { x: 120, y: 254, w: 6, h: 26 },
  { x: 140, y: 254, w: 6, h: 26 },
  { x: 160, y: 254, w: 6, h: 26 },
  { x: 180, y: 254, w: 6, h: 26 },
  { x: 200, y: 254, w: 6, h: 26 },
  { x: 20, y: 80, w: 26, h: 6 },
  { x: 20, y: 100, w: 26, h: 6 },
  { x: 20, y: 120, w: 26, h: 6 },
  { x: 20, y: 140, w: 26, h: 6 },
  { x: 20, y: 160, w: 26, h: 6 },
  { x: 20, y: 180, w: 26, h: 6 },
  { x: 20, y: 200, w: 26, h: 6 },
  { x: 254, y: 80, w: 26, h: 6 },
  { x: 254, y: 100, w: 26, h: 6 },
  { x: 254, y: 120, w: 26, h: 6 },
  { x: 254, y: 140, w: 26, h: 6 },
  { x: 254, y: 160, w: 26, h: 6 },
  { x: 254, y: 180, w: 26, h: 6 },
  { x: 254, y: 200, w: 26, h: 6 },
];

export function Hero() {
  const [activePin, setActivePin] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActivePin((i) => (i + 1) % PIN_COORDS.length);
    }, 400);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="hero-content">
          <BrandLogo
            className="logo hero-brand-logo"
            subtitle="Advanced Repair Lab"
            gradId="homeHeroLogoGrad"
          />
          <span className="eyebrow">BIOS · SCHEMATIC · BOARDVIEW</span>
          <h1>
            Flash it right,
            <br />
            <span className="accent-cyan">first time.</span>{" "}
            <span className="accent-gold">Every time.</span>
          </h1>
          <p className="lead">
            Professional BIOS files, schematics, boardviews, and password unlocking
            for all laptop brands. Browse the library or open a request instantly.
          </p>
          <div className="hero-actions">
            <Link href="/library" className="btn btn-primary">
              📚 File Library
            </Link>
            <Link href="/services" className="btn btn-purple">
              🔧 Services
            </Link>
            <a
              href="https://t.me/IMTIAZBIOS1"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-telegram"
            >
              💬 Telegram
            </a>
          </div>
          <div className="stat-row">
            <div className="stat">
              <b>12.4K</b>
              <span>Files shared</span>
            </div>
            <div className="stat">
              <b>6.9K</b>
              <span>Boards fixed</span>
            </div>
            <div className="stat">
              <b>8</b>
              <span>Brands supported</span>
            </div>
            <div className="stat">
              <b>24/7</b>
              <span>Support</span>
            </div>
          </div>
        </div>

        <div className="chip-stage">
          <svg className="chip-glow" viewBox="0 0 300 300" fill="none">
            <g id="pins">
              {PIN_COORDS.map((pin, idx) => (
                <rect
                  key={idx}
                  className={`pin${idx === activePin ? " is-active" : ""}`}
                  x={pin.x}
                  y={pin.y}
                  width={pin.w}
                  height={pin.h}
                  rx="2"
                />
              ))}
            </g>
            <rect
              className="chip-body"
              x="60"
              y="60"
              width="180"
              height="180"
              rx="12"
              strokeWidth="2"
            />
            <rect
              className="chip-inner"
              x="90"
              y="90"
              width="120"
              height="120"
              rx="8"
              strokeWidth="1.6"
            />
            <circle cx="105" cy="105" r="4" className="chip-pulse" />
            <text
              className="chip-title"
              x="150"
              y="145"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="14"
              fontWeight="600"
            >
              IMTIAZ
            </text>
            <text
              className="chip-sub"
              x="150"
              y="163"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="9"
            >
              BIOS · SPI 25Q64
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}
