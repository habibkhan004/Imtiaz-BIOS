"use client";

import { useEffect, useState } from "react";

export type PublicTestimonial = {
  id: string;
  name: string;
  roleOrCompany: string;
  quote: string;
  rating: number;
};

function stars(n: number) {
  return "★".repeat(Math.min(5, Math.max(1, n || 5)));
}

export function TestimonialsGrid({
  initial,
}: {
  initial?: PublicTestimonial[];
}) {
  const [items, setItems] = useState<PublicTestimonial[]>(initial || []);

  useEffect(() => {
    if (initial?.length) return;
    let cancelled = false;
    fetch("/api/public/testimonials", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.testimonials) {
          setItems(data.testimonials);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [initial]);

  if (!items.length) {
    return (
      <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
        Client feedback will appear here soon.
      </p>
    );
  }

  return (
    <div className="testimonial-grid">
      {items.map((t) => (
        <div className="testimonial-card reveal" key={t.id}>
          <div className="stars">{stars(t.rating)}</div>
          <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
          <div className="author">
            {t.name} <span>— {t.roleOrCompany}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
