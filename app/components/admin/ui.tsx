import Link from "next/link";
import type { ReactNode } from "react";
import { BackButton } from "../BackButton";

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let tone: "cyan" | "green" | "gold" | "danger" | "muted" = "muted";
  if (
    ["fulfilled", "verified", "paid", "resolved", "active", "admin"].includes(s)
  )
    tone = "green";
  else if (
    [
      "pending",
      "queued",
      "open",
      "in review",
      "in progress",
      "customer",
      "technician",
    ].includes(s)
  )
    tone = "cyan";
  else if (
    ["waiting on customer", "needs changes", "expiring", "suspended"].includes(s)
  )
    tone = "gold";
  else if (["rejected", "failed", "refunded", "cancelled", "none"].includes(s))
    tone = "danger";

  return <span className={`status-pill ${tone}`}>{status}</span>;
}

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="portal-empty admin-empty">
      <p className="admin-empty-title">{title}</p>
      <p className="admin-empty-body">{body}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn btn-primary btn-sm">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function StatCards({
  items,
}: {
  items: { label: string; value: string | number }[];
}) {
  return (
    <div className="stat-row admin-stat-row" style={{ marginBottom: 24 }}>
      {items.map((item) => (
        <div className="stat" key={item.label}>
          <b>{item.value}</b>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  backFallback = "/admin",
  showBack = true,
  accent = "cyan",
  actions,
}: {
  /** @deprecated ignored */
  eyebrow?: string;
  title: string;
  description: string;
  backFallback?: string;
  showBack?: boolean;
  accent?: "cyan" | "gold" | "purple";
  actions?: ReactNode;
}) {
  const accentClass =
    accent === "gold"
      ? "accent-gold"
      : accent === "purple"
        ? "gradient-purple"
        : "accent-cyan";

  return (
    <div className="portal-page-head admin-page-head">
      <div className="admin-page-head-top">
        {showBack ? <BackButton fallback={backFallback} /> : null}
        {actions ? <div className="admin-page-actions">{actions}</div> : null}
      </div>
      <h1>
        <span className={accentClass}>{title}</span>
      </h1>
      <p>{description}</p>
    </div>
  );
}

export function AdminToolbar({ children }: { children: ReactNode }) {
  return <div className="lib-toolbar admin-toolbar">{children}</div>;
}

export function AdminPanel({
  title,
  actions,
  children,
}: {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="portal-panel admin-panel">
      {title || actions ? (
        <div className="admin-panel-head">
          {title ? <h2>{title}</h2> : <span />}
          {actions ? <div className="admin-page-actions">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="admin-table-scroll">
      <div className="lib-table admin-table">{children}</div>
    </div>
  );
}

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return <div className="toast show admin-toast">{message}</div>;
}
