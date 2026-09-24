import type { Database } from "../domain/types";

export type ReportPeriodDays = 7 | 30 | 90 | number;

export type PlatformReport = {
  periodDays: number;
  from: string;
  to: string;
  newUsers: number;
  activeUsers: number;
  expiredTrialUsers: number;
  trialUsers: number;
  paidSubscribers: number;
  mostDownloaded: { fileId: string; name: string; count: number }[];
  mostRequestedBoards: { board: string; count: number }[];
  popularBrands: { brand: string; count: number }[];
  popularCategories: { category: string; count: number }[];
  ticketsByStatus: Record<string, number>;
  requestsByStatus: Record<string, number>;
  uploadsApproved: number;
  uploadsRejected: number;
  uploadsNeedsInfo: number;
  uploadsPending: number;
  revenuePaid: number;
  revenueFailed: number;
  paymentCount: number;
  downloadsInPeriod: number;
  downloadsSeries: { label: string; value: number }[];
};

function inRange(iso: string, fromMs: number, toMs: number) {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t >= fromMs && t <= toMs;
}

/** Live aggregates for /admin/reports (§20) — not hardcoded demo charts. */
export function buildPlatformReport(
  db: Database,
  periodDays: ReportPeriodDays = 30,
): PlatformReport {
  const days = Math.max(1, Number(periodDays) || 30);
  const toMs = Date.now();
  const fromMs = toMs - days * 86400000;
  const from = new Date(fromMs).toISOString();
  const to = new Date(toMs).toISOString();

  const newUsers = db.users.filter((u) => inRange(u.createdAt, fromMs, toMs)).length;
  const activeUsers = db.users.filter((u) => u.status === "Active").length;
  const now = Date.now();
  const trialUsers = db.users.filter(
    (u) => u.role === "USER" && new Date(u.trialEndDate).getTime() > now,
  ).length;
  const expiredTrialUsers = db.users.filter(
    (u) => u.role === "USER" && new Date(u.trialEndDate).getTime() <= now,
  ).length;
  const paidSubscribers = db.subscriptions.filter(
    (s) => s.status === "active" && new Date(s.endsAt).getTime() > now,
  ).length;

  const dlInPeriod = db.downloads.filter(
    (d) => d.result === "success" && inRange(d.at, fromMs, toMs),
  );

  const byFile = new Map<string, number>();
  for (const d of dlInPeriod) {
    byFile.set(d.fileId, (byFile.get(d.fileId) || 0) + 1);
  }
  const mostDownloaded = [...byFile.entries()]
    .map(([fileId, count]) => {
      const f = db.files.find((x) => x.id === fileId);
      return { fileId, name: f?.name || fileId, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const boardCounts = new Map<string, number>();
  for (const r of db.requests) {
    if (!inRange(r.createdAt, fromMs, toMs)) continue;
    const key = `${r.brand} ${r.boardModel}`.trim();
    boardCounts.set(key, (boardCounts.get(key) || 0) + 1);
  }
  const mostRequestedBoards = [...boardCounts.entries()]
    .map(([board, count]) => ({ board, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const brandCounts = new Map<string, number>();
  const catCounts = new Map<string, number>();
  for (const f of db.files) {
    const b = db.brands.find((x) => x.id === f.brandId)?.name || "Unknown";
    const c = db.categories.find((x) => x.id === f.categoryId)?.name || "Unknown";
    brandCounts.set(b, (brandCounts.get(b) || 0) + f.downloadCount);
    catCounts.set(c, (catCounts.get(c) || 0) + f.downloadCount);
  }
  const popularBrands = [...brandCounts.entries()]
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const popularCategories = [...catCounts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const ticketsByStatus: Record<string, number> = {};
  for (const t of db.tickets) {
    ticketsByStatus[t.status] = (ticketsByStatus[t.status] || 0) + 1;
  }
  const requestsByStatus: Record<string, number> = {};
  for (const r of db.requests) {
    requestsByStatus[r.status] = (requestsByStatus[r.status] || 0) + 1;
  }

  const uploadsApproved = db.uploads.filter((u) => u.status === "approved").length;
  const uploadsRejected = db.uploads.filter((u) => u.status === "rejected").length;
  const uploadsNeedsInfo = db.uploads.filter((u) => u.status === "needs_info").length;
  const uploadsPending = db.uploads.filter((u) => u.status === "pending").length;

  const paid = db.payments.filter(
    (p) => p.status === "paid" && inRange(p.createdAt, fromMs, toMs),
  );
  const failed = db.payments.filter(
    (p) => p.status === "failed" && inRange(p.createdAt, fromMs, toMs),
  );

  const bucketCount = Math.min(days, 12);
  const bucketMs = (toMs - fromMs) / bucketCount;
  const downloadsSeries: { label: string; value: number }[] = [];
  for (let i = 0; i < bucketCount; i++) {
    const start = fromMs + i * bucketMs;
    const end = start + bucketMs;
    const value = dlInPeriod.filter((d) => {
      const t = new Date(d.at).getTime();
      return t >= start && t < end;
    }).length;
    downloadsSeries.push({
      label: new Date(start).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      value,
    });
  }

  return {
    periodDays: days,
    from,
    to,
    newUsers,
    activeUsers,
    expiredTrialUsers,
    trialUsers,
    paidSubscribers,
    mostDownloaded,
    mostRequestedBoards,
    popularBrands,
    popularCategories,
    ticketsByStatus,
    requestsByStatus,
    uploadsApproved,
    uploadsRejected,
    uploadsNeedsInfo,
    uploadsPending,
    revenuePaid: paid.reduce((s, p) => s + p.amount, 0),
    revenueFailed: failed.reduce((s, p) => s + p.amount, 0),
    paymentCount: paid.length,
    downloadsInPeriod: dlInPeriod.length,
    downloadsSeries,
  };
}

export function reportToCsv(report: PlatformReport): string {
  const lines = [
    "section,key,value",
    `meta,period_days,${report.periodDays}`,
    `meta,from,${report.from}`,
    `meta,to,${report.to}`,
    `users,new,${report.newUsers}`,
    `users,active,${report.activeUsers}`,
    `users,trial,${report.trialUsers}`,
    `users,expired_trial,${report.expiredTrialUsers}`,
    `users,paid_subscribers,${report.paidSubscribers}`,
    `uploads,approved,${report.uploadsApproved}`,
    `uploads,rejected,${report.uploadsRejected}`,
    `uploads,needs_info,${report.uploadsNeedsInfo}`,
    `uploads,pending,${report.uploadsPending}`,
    `payments,revenue_paid,${report.revenuePaid}`,
    `payments,revenue_failed,${report.revenueFailed}`,
    `payments,count,${report.paymentCount}`,
    `downloads,in_period,${report.downloadsInPeriod}`,
    ...report.mostDownloaded.map(
      (r, i) => `most_downloaded,${i}_${r.name.replace(/,/g, " ")},${r.count}`,
    ),
    ...report.mostRequestedBoards.map(
      (r, i) => `most_requested,${i}_${r.board.replace(/,/g, " ")},${r.count}`,
    ),
    ...report.popularBrands.map(
      (r, i) => `popular_brands,${i}_${r.brand.replace(/,/g, " ")},${r.count}`,
    ),
    ...report.popularCategories.map(
      (r, i) => `popular_categories,${i}_${r.category.replace(/,/g, " ")},${r.count}`,
    ),
    ...Object.entries(report.ticketsByStatus).map(
      ([k, v]) => `tickets_by_status,${k},${v}`,
    ),
    ...Object.entries(report.requestsByStatus).map(
      ([k, v]) => `requests_by_status,${k},${v}`,
    ),
    ...report.downloadsSeries.map((d) => `downloads_series,${d.label},${d.value}`),
  ];
  return lines.join("\n");
}
