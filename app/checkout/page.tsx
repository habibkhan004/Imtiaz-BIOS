"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { SiteShell } from "../components/SiteShell";
import { readAuth } from "../lib/auth";
import {
  CART_EVENT,
  cartTotal,
  clearCartItems,
  readCart,
  type CartItem,
} from "../lib/cart";

type CheckoutFile = {
  id: string;
  name: string;
  modelNumber: string;
  price: number;
  brandName?: string;
  fileType: string;
  description?: string;
};

function CheckoutInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const fileIdParam = sp.get("fileId") || "";

  const [userId, setUserId] = useState<string | undefined>();
  const [lines, setLines] = useState<CartItem[]>([]);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  const total = useMemo(() => cartTotal(lines), [lines]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const auth = readAuth();
    setUserId(auth?.userId);

    if (!auth) {
      const next = fileIdParam
        ? `/checkout?fileId=${encodeURIComponent(fileIdParam)}`
        : "/checkout";
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    try {
      if (fileIdParam) {
        const res = await fetch(
          `/api/payments/checkout?fileId=${encodeURIComponent(fileIdParam)}`,
          { credentials: "include" },
        );
        const data = await res.json();
        if (res.status === 401) {
          router.replace(
            `/login?next=${encodeURIComponent(`/checkout?fileId=${fileIdParam}`)}`,
          );
          return;
        }
        if (!res.ok) {
          setError(data.error || "Unable to load checkout");
          return;
        }
        if (data.entitlement?.ok) {
          router.replace(`/library/${data.file.id}`);
          return;
        }
        const f = data.file as CheckoutFile;
        setLines([
          {
            fileId: f.id,
            name: f.name,
            model: f.modelNumber || f.name,
            brand: f.brandName || "—",
            type: f.fileType,
            price: f.price,
            description: f.description,
          },
        ]);
      } else {
        const cart = readCart(auth.userId);
        if (!cart.length) {
          setError("Cart is empty.");
          setLines([]);
          return;
        }
        setLines(cart);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [fileIdParam, router]);

  useEffect(() => {
    load();
    window.addEventListener(CART_EVENT, load);
    return () => window.removeEventListener(CART_EVENT, load);
  }, [load]);

  const pay = async () => {
    if (!lines.length) return;
    setPending(true);
    setToast("");
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileIds: lines.map((l) => l.fileId),
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent("/checkout")}`);
        return;
      }
      if (!res.ok) {
        setToast(data.error || "Payment failed");
        return;
      }
      const paidIds: string[] = data.paidFileIds || lines.map((l) => l.fileId);
      clearCartItems(paidIds, userId);
      setToast("Payment successful — unlocking downloads…");
      const redirect =
        data.redirectTo ||
        (paidIds.length === 1 ? `/library/${paidIds[0]}` : "/library");
      router.push(redirect);
    } catch {
      setToast("Network error");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="wrap checkout-page">
      <div className="section-head reveal" style={{ maxWidth: 720 }}>
        <span className="eyebrow">CHECKOUT</span>
        <h2>
          <span className="gradient-cyan">Proceed to payment</span>
        </h2>
        <p>Review your order, then unlock downloads with a one-time payment.</p>
      </div>

      <div className="checkout-panel reveal">
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading…</p>
        ) : error ? (
          <div>
            <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>{error}</p>
            <Link href="/library" className="btn btn-primary">
              Back to library
            </Link>
            <Link href="/cart" className="btn btn-ghost" style={{ marginLeft: 8 }}>
              View cart
            </Link>
          </div>
        ) : (
          <>
            {lines.map((item) => (
              <div className="checkout-line" key={item.fileId}>
                <div>
                  <div className="checkout-line-title">{item.name || item.model}</div>
                  <div className="checkout-line-meta">
                    {item.brand} · {item.type}
                  </div>
                  {item.description ? (
                    <p
                      style={{
                        marginTop: 8,
                        fontSize: 13,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {item.description.slice(0, 180)}
                      {item.description.length > 180 ? "…" : ""}
                    </p>
                  ) : null}
                </div>
                <strong>${Number(item.price).toFixed(2)}</strong>
                <Link
                  href={`/library/${item.fileId}`}
                  className="btn btn-outline btn-sm"
                >
                  Details
                </Link>
              </div>
            ))}

            <div className="checkout-total-row">
              <span>Order total</span>
              <span>${total.toFixed(2)} USD</span>
            </div>

            <p style={{ marginTop: 14, fontSize: 13, color: "var(--text-muted)" }}>
              Demo checkout — records paid unlocks for your account (no live card charge).
            </p>

            <div className="action-btns" style={{ marginTop: 22 }}>
              <button
                type="button"
                className="btn btn-primary"
                disabled={pending || !lines.length}
                onClick={pay}
              >
                {pending ? "Processing…" : `Pay now · $${total.toFixed(2)}`}
              </button>
              <Link href="/cart" className="btn btn-ghost">
                Back to cart
              </Link>
              {fileIdParam ? (
                <Link href={`/library/${fileIdParam}`} className="btn btn-outline btn-sm">
                  Cancel
                </Link>
              ) : null}
            </div>
            {toast ? (
              <div className="toast show" style={{ marginTop: 16 }}>
                {toast}
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <SiteShell>
      <Suspense fallback={<p className="wrap" style={{ color: "var(--text-muted)" }}>Loading checkout…</p>}>
        <CheckoutInner />
      </Suspense>
    </SiteShell>
  );
}
