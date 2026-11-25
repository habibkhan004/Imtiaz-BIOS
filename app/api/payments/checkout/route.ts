import { NextRequest, NextResponse } from "next/server";
import type { Payment } from "@/app/lib/domain/types";
import { loadDb, now, randomUUID, updateDb } from "@/app/lib/server/db";
import { writeAudit } from "@/app/lib/server/audit";
import { assertCanDownload, hasPaidPurchase } from "@/app/lib/server/entitlement";
import { featureFlags } from "@/app/lib/server/feature-flags";
import { jsonError, requireSession } from "@/app/lib/server/http";
import { pushNotification } from "@/app/lib/server/notifications";

function purchaseOneFile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  userId: string,
  file: { id: string; name: string; price: number },
) {
  const paymentId = randomUUID();
  const p: Payment = {
    id: paymentId,
    userId,
    amount: file.price,
    currency: "USD",
    paymentMethod: "demo",
    transactionId: `demo_file_${paymentId.slice(0, 8)}`,
    status: "paid",
    purpose: `file:${file.id}`,
    createdAt: now(),
  };
  db.payments.unshift(p);
  writeAudit(db, {
    actorId: userId,
    action: "payment.file_purchase",
    targetType: "file",
    targetId: file.id,
    summary: `Purchased file ${file.name} for $${file.price} (demo)`,
  });
  pushNotification(db, {
    userId,
    type: "payment",
    title: "File unlocked",
    body: `Payment successful for ${file.name}. You can download it now.`,
    href: `/library/${file.id}`,
  });
  return p;
}

/** Demo checkout: create paid Payment(s) with purpose `file:{id}`. */
export async function POST(req: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  if (auth.user.status === "Suspended") {
    return jsonError("Account suspended.", 403, "SUSPENDED");
  }

  let body: { fileId?: string; fileIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const ids = Array.from(
    new Set(
      [
        ...(Array.isArray(body.fileIds) ? body.fileIds : []),
        body.fileId ? String(body.fileId) : "",
      ]
        .map((id) => String(id || "").trim())
        .filter(Boolean),
    ),
  );

  if (!ids.length) return jsonError("fileId or fileIds required");

  const db0 = await loadDb();
  const user = db0.users.find((u) => u.id === auth.user.id);
  if (!user) return jsonError("Unauthorized", 401);

  const files = ids.map((id) => db0.files.find((f) => f.id === id));
  if (files.some((f) => !f || f.status !== "published")) {
    return jsonError("One or more files were not found", 404, "NOT_FOUND");
  }
  if (files.some((f) => !(f!.price > 0))) {
    return jsonError("Only paid files can be purchased.", 400, "NOT_PAID_FILE");
  }

  if (featureFlags.livePayments) {
    // Placeholder for live gateway session creation.
  }

  const result = await updateDb((db) => {
    const payments: Payment[] = [];
    const paidFileIds: string[] = [];
    const already: string[] = [];

    for (const id of ids) {
      const file = db.files.find((f) => f.id === id)!;
      if (hasPaidPurchase(db, user.id, file.id) || assertCanDownload(db, user, file).ok) {
        already.push(file.id);
        paidFileIds.push(file.id);
        continue;
      }
      payments.push(purchaseOneFile(db, auth.user.id, file));
      paidFileIds.push(file.id);
    }

    return { payments, paidFileIds, already };
  });

  const redirectTo =
    result.paidFileIds.length === 1
      ? `/library/${result.paidFileIds[0]}`
      : "/library";

  return NextResponse.json({
    ok: true,
    demo: true,
    payments: result.payments,
    paidFileIds: result.paidFileIds,
    alreadyEntitled: result.already,
    redirectTo,
  });
}

export async function GET(req: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const fileId = req.nextUrl.searchParams.get("fileId") || "";
  if (!fileId) return jsonError("fileId required");

  const db = await loadDb();
  const file = db.files.find((f) => f.id === fileId);
  if (!file || file.status !== "published") {
    return jsonError("File not found", 404, "NOT_FOUND");
  }

  const user = db.users.find((u) => u.id === auth.user.id);
  const entitlement = assertCanDownload(db, user, file);
  const brand = db.brands.find((b) => b.id === file.brandId);

  return NextResponse.json({
    file: {
      id: file.id,
      name: file.name,
      modelNumber: file.modelNumber,
      accessType: file.accessType,
      price: file.price,
      brandName: brand?.name,
      fileType: file.fileType,
      description: file.description,
    },
    entitlement,
    livePayments: featureFlags.livePayments,
  });
}
