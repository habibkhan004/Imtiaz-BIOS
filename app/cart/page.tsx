"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "../components/SiteShell";
import { readAuth } from "../lib/auth";
import {
  CART_EVENT,
  cartTotal,
  readCart,
  removeFromCart,
  type CartItem,
} from "../lib/cart";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | undefined>();

  const sync = () => {
    const auth = readAuth();
    setUserId(auth?.userId);
    setItems(readCart(auth?.userId));
  };

  useEffect(() => {
    sync();
    window.addEventListener("imtiaz-auth-change", sync);
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("imtiaz-auth-change", sync);
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const total = useMemo(() => cartTotal(items), [items]);

  return (
    <SiteShell>
      <section className="wrap cart-page">
        <div className="section-head reveal" style={{ maxWidth: 720 }}>
          <span className="eyebrow">CART</span>
          <h2>
            <span className="gradient-cyan">Your cart</span>
          </h2>
          <p>Paid library files ready for checkout.</p>
        </div>

        <div className="checkout-panel reveal">
          {items.length === 0 ? (
            <div>
              <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
                Your cart is empty.
              </p>
              <Link href="/library" className="btn btn-primary">
                Browse library
              </Link>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div className="cart-line" key={item.fileId}>
                  <div>
                    <div className="cart-line-title">{item.name || item.model}</div>
                    <div className="cart-line-meta">
                      {item.brand} · {item.type}
                      {item.description
                        ? ` — ${item.description.slice(0, 100)}${item.description.length > 100 ? "…" : ""}`
                        : ""}
                    </div>
                    <Link
                      href={`/library/${item.fileId}`}
                      style={{ fontSize: 13, color: "var(--accent-cyan)" }}
                    >
                      View details
                    </Link>
                  </div>
                  <strong>${Number(item.price).toFixed(2)}</strong>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => removeFromCart(item.fileId, userId)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="cart-total-row">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="action-btns" style={{ marginTop: 20 }}>
                <Link href="/checkout" className="btn btn-primary">
                  Proceed to payment
                </Link>
                <Link href="/library" className="btn btn-ghost">
                  Continue browsing
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
