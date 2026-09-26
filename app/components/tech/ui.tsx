import Link from "next/link";
import { BackButton } from "../BackButton";

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase().replace(/_/g, " ");
  let tone: "cyan" | "green" | "gold" | "danger" | "muted" = "muted";
  if (
    ["fulfilled", "verified", "approved", "completed", "resolved", "active", "closed"].includes(
      s,
    )
  )
    tone = "green";
  else if (
    ["pending", "queued", "open", "assigned", "in review", "in progress"].includes(s)
  )
    tone = "cyan";
  else if (
    ["waiting on customer", "waiting customer", "needs changes", "needs info", "expiring"].includes(
      s,
    )
  )
    tone = "gold";
  else if (["rejected", "failed"].includes(s)) tone = "danger";

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
        <Link href={actionHref} className="btn btn-success btn-sm">
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

export function TechPageHeader({
  title,
  description,
  backFallback = "/tech",
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
