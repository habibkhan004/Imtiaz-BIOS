"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ReviewForm } from "./ReviewForm";
import { StatusBadge, TechPageHeader } from "./ui";

type LiveItem = {
  kind: "request" | "ticket" | "upload";
  id: string;
  displayId: string;
  type: "file_request" | "support" | "upload";
  model: string;
  brand: string;
  customerName: string;
  status: string;
  description: string;
  updatedAt: string;
};

export function ReviewPageClient() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [item, setItem] = useState<LiveItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const reqRes = await fetch(`/api/requests/${id}`, {
        credentials: "include",
      });
      if (reqRes.ok) {
        const data = await reqRes.json();
        if (data.request) {
          const r = data.request;
          setItem({
            kind: "request",
            id: r.id,
            displayId: r.requestNumber,
            type: "file_request",
            model: r.boardModel,
            brand: r.brand,
            customerName: "Customer",
            status: r.status,
            description: r.description || "",
            updatedAt: r.updatedAt,
          });
          return;
        }
        if (data.ticket) {
          const t = data.ticket;
          setItem({
            kind: "ticket",
            id: t.id,
            displayId: t.ticketNumber,
            type: "support",
            model: t.model || t.boardNumber || "—",
            brand: t.brand || "—",
            customerName: "Customer",
            status: t.status,
            description: t.description || "",
            updatedAt: t.updatedAt,
          });
          return;
        }
      }

      const upRes = await fetch(`/api/uploads/${id}`, {
        credentials: "include",
      });
      if (upRes.ok) {
        const data = await upRes.json();
        const u = data.upload;
        setItem({
          kind: "upload",
          id: u.id,
          displayId: u.id.slice(0, 8),
          type: "upload",
          model: u.boardNumber || u.modelNumber,
          brand: "—",
          customerName: "Uploader",
          status: u.status,
          description: u.notes || u.description || "",
          updatedAt: u.updatedAt || u.createdAt,
        });
        return;
      }

      setError("Item not found");
      setItem(null);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p style={{ color: "var(--text-muted)" }}>Loading…</p>;
  }

  if (error || !item) {
    return (
      <>
        <TechPageHeader title="Not found" description={error} />
        <Link href="/tech" className="btn btn-outline btn-sm">
          Back to queue
        </Link>
      </>
    );
  }

  return (
    <>
      <TechPageHeader
        title={`Review ${item.displayId}`}
        description="Assess the item and update status in the live database."
      />
      <div className="portal-grid-2">
        <div>
          <div className="portal-panel">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <h2 style={{ marginBottom: 0 }}>{item.displayId}</h2>
              <StatusBadge status={item.status} />
            </div>
            <p style={{ fontSize: 14 }}>
              {item.model} · {item.brand} · {item.type}
            </p>
            <p style={{ fontSize: 14, marginTop: 12 }}>{item.description || "—"}</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
              Updated {new Date(item.updatedAt).toLocaleString()}
            </p>
          </div>
          <div className="portal-panel">
            <h2>Quick links</h2>
            <div className="action-btns">
              <Link
                href={`/tech/requests/${item.id}/status`}
                className="btn btn-gold btn-sm"
              >
                Status
              </Link>
              {item.type === "upload" ? (
                <Link
                  href={`/tech/verification/${item.id}`}
                  className="btn btn-primary btn-sm"
                >
                  Verification
                </Link>
              ) : null}
              {item.type === "support" ? (
                <Link
                  href={`/tech/messages/${item.id}`}
                  className="btn btn-success btn-sm"
                >
                  Messages
                </Link>
              ) : null}
            </div>
          </div>
        </div>
        <ReviewForm item={item} onDone={load} />
      </div>
    </>
  );
}
