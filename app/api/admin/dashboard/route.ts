import { NextResponse } from "next/server";
import { loadDb } from "@/app/lib/server/db";
import { requireSession } from "@/app/lib/server/http";

export async function GET() {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;
  const db = await loadDb();
  const nowMs = Date.now();
  const dayAgo = nowMs - 86400000;
  const weekAgo = nowMs - 7 * 86400000;

  const users = db.users;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const newRegistrations = users.filter((u) => new Date(u.createdAt).getTime() > weekAgo).length;
  const files = db.files;
  const verifiedFiles = files.filter((f) => f.verificationStatus === "verified").length;
  const pendingUploads = db.uploads.filter((u) => u.status === "pending").length;
  const freeFiles = files.filter((f) => f.accessType === "free" || f.price <= 0).length;
  const paidFiles = files.filter((f) => f.accessType === "paid" && f.price > 0).length;
  const downloadsToday = db.downloads.filter((d) => new Date(d.at).getTime() > dayAgo).length;
  const openRequests = db.requests.filter((r) => !["completed", "closed", "rejected"].includes(r.status)).length;
  const openTickets = db.tickets.filter((t) => !["resolved", "closed"].includes(t.status)).length;
  const activeSubs = db.subscriptions.filter(
    (s) => s.status === "active" && new Date(s.endsAt).getTime() > nowMs,
  ).length;
  const expiredSubs = db.subscriptions.filter(
    (s) => s.status === "expired" || new Date(s.endsAt).getTime() <= nowMs,
  ).length;
  const paid = db.payments.filter((p) => p.status === "paid");
  const failedPayments = db.payments.filter((p) => p.status === "failed").length;
  const revenue = paid.reduce((sum, p) => sum + p.amount, 0);

  return NextResponse.json({
    stats: {
      totalUsers: users.length,
      activeUsers,
      newRegistrations,
      totalFiles: files.length,
      verifiedFiles,
      pendingUploads,
      freeFiles,
      paidFiles,
      downloadsToday,
      totalDownloads: db.downloads.length,
      openRequests,
      openTickets,
      activeSubscriptions: activeSubs,
      expiredSubscriptions: expiredSubs,
      paymentCount: paid.length,
      failedPayments,
      revenue,
    },
    recentUploads: db.uploads.slice(0, 8),
    recentAudit: db.auditLogs.slice(0, 12),
    queues: {
      uploads: "/admin/uploads",
      requests: "/admin/requests",
      support: "/admin/support",
      files: "/admin/files",
    },
  });
}
