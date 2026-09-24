import Link from "next/link";
import { BackButton } from "../BackButton";

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let tone: "cyan" | "green" | "gold" | "danger" | "muted" = "muted";
  if (["fulfilled", "verified", "paid", "resolved", "active"].includes(s))
    tone = "green";
  else if (
    ["pending", "queued", "open", "in review", "in progress"].includes(s)
  )
    tone = "cyan";
  else if (["waiting on customer", "needs changes", "expiring"].includes(s))
    tone = "gold";
  else if (["rejected", "failed", "refunded"].includes(s)) tone = "danger";

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
    <div className="portal-empty">
      <p style={{ fontSize: 18, marginBottom: 8, color: "var(--text-secondary)" }}>
        {title}
      </p>
      <p style={{ marginBottom: 16 }}>{body}</p>
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
    <div className="stat-grid">
      {items.map((item) => (
        <div className="stat-card" key={item.label}>
          <div className="label">{item.label}</div>
          <div className="value">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export function PortalPageHeader({
  title,
  description,
  backFallback = "/portal",
}: {
  /** @deprecated ignored — replaced by Back button */
  eyebrow?: string;
  title: string;
  description: string;
  backFallback?: string;
}) {
  return (
    <div className="portal-page-head">
      <BackButton fallback={backFallback} />
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
