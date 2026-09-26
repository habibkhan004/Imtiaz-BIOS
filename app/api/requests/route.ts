import { NextRequest, NextResponse } from "next/server";
import type { FileRequest, SupportTicket, TicketType } from "@/app/lib/domain/types";
import { loadDb, nextTicketNumber, now, randomUUID, updateDb } from "@/app/lib/server/db";
import { jsonError, requireSession } from "@/app/lib/server/http";
import { pushNotification } from "@/app/lib/server/notifications";

export async function POST(req: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  let body: {
    requestType?: "file" | TicketType;
    boardModel?: string;
    brand?: string;
    typeNeeded?: string;
    subject?: string;
    description?: string;
    model?: string;
    boardNumber?: string;
    symptoms?: string;
    serviceIdentifier?: string;
    priority?: string;
    attachments?: string[];
    ownershipAck?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const type = body.requestType || "file";

  if (type === "password" && !body.ownershipAck) {
    return jsonError(
      "You must acknowledge authorization/ownership before submitting password support.",
      400,
      "OWNERSHIP_REQUIRED",
    );
  }

  if (type === "file") {
    if (!body.boardModel || !body.brand || !body.typeNeeded) {
      return jsonError("boardModel, brand, and typeNeeded are required.");
    }
    const request = await updateDb((db) => {
      const ts = now();
      const row: FileRequest = {
        id: randomUUID(),
        requestNumber: nextTicketNumber(db, "REQ"),
        userId: auth.user.id,
        boardModel: body.boardModel!,
        brand: body.brand!,
        typeNeeded: body.typeNeeded!,
        description: body.description || "",
        attachments: body.attachments || [],
        status: "pending",
        createdAt: ts,
        updatedAt: ts,
      };
      db.requests.unshift(row);
      pushNotification(db, {
        userId: auth.user.id,
        type: "request",
        title: "File request submitted",
        body: `${row.requestNumber} is pending review.`,
        href: "/portal/requests",
      });
      return row;
    });
    return NextResponse.json({ request }, { status: 201 });
  }

  // Support / contact / password / technical
  const ticket = await updateDb((db) => {
    const ts = now();
    const ticketType = type as TicketType;
    const row: SupportTicket = {
      id: randomUUID(),
      ticketNumber: nextTicketNumber(db, "TCK"),
      type: ticketType,
      userId: auth.user.id,
      subject: body.subject || `${ticketType} request`,
      brand: body.brand,
      model: body.model || body.boardModel,
      boardNumber: body.boardNumber,
      serviceIdentifier: body.serviceIdentifier,
      symptoms: body.symptoms,
      description: body.description || "",
      priority: (body.priority as SupportTicket["priority"]) || "normal",
      status: "pending",
      ownershipAck: body.ownershipAck,
      attachments: body.attachments || [],
      createdAt: ts,
      updatedAt: ts,
    };
    db.tickets.unshift(row);
    pushNotification(db, {
      userId: auth.user.id,
      type: "ticket",
      title: "Support ticket created",
      body: `${row.ticketNumber}: ${row.subject}`,
      href: "/portal/support",
    });
    return row;
  });

  return NextResponse.json({ ticket }, { status: 201 });
}

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  const db = await loadDb();
  const isStaff = auth.user.role === "ADMIN" || auth.user.role === "TECHNICIAN";
  const requests = isStaff
    ? db.requests
    : db.requests.filter((r) => r.userId === auth.user.id);
  const tickets = isStaff
    ? db.tickets
    : db.tickets.filter((t) => t.userId === auth.user.id);
  return NextResponse.json({ requests, tickets });
}
