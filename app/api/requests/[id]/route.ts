import { NextRequest, NextResponse } from "next/server";
import type { RequestStatus, TicketStatus } from "@/app/lib/domain/types";
import { loadDb, now, randomUUID, updateDb } from "@/app/lib/server/db";
import { writeAudit } from "@/app/lib/server/audit";
import { jsonError, requireSession } from "@/app/lib/server/http";
import { pushNotification } from "@/app/lib/server/notifications";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const db = await loadDb();
  const request = db.requests.find((r) => r.id === id);
  const ticket = db.tickets.find((t) => t.id === id);
  const item = request || ticket;
  if (!item) return jsonError("Not found", 404);
  const isStaff = auth.user.role === "ADMIN" || auth.user.role === "TECHNICIAN";
  const ownerId = "userId" in item ? item.userId : undefined;
  if (!isStaff && ownerId !== auth.user.id) return jsonError("Forbidden", 403);
  const messages = ticket
    ? db.messages.filter((m) => m.ticketId === ticket.id)
    : [];
  return NextResponse.json({ request, ticket, messages });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const auth = await requireSession(["ADMIN", "TECHNICIAN", "USER"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;

  let body: {
    status?: string;
    assigneeId?: string;
    message?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const result = await updateDb((db) => {
    const request = db.requests.find((r) => r.id === id);
    const ticket = db.tickets.find((t) => t.id === id);
    const isStaff = auth.user.role === "ADMIN" || auth.user.role === "TECHNICIAN";

    if (request) {
      if (!isStaff && request.userId !== auth.user.id) return { error: "FORBIDDEN" as const };
      if (isStaff) {
        if (body.status) request.status = body.status as RequestStatus;
        if (body.assigneeId !== undefined) request.assigneeId = body.assigneeId;
        request.updatedAt = now();
        pushNotification(db, {
          userId: request.userId,
          type: "request_update",
          title: `Request ${request.requestNumber} updated`,
          body: `Status: ${request.status}`,
          href: "/portal/requests",
        });
        writeAudit(db, {
          actorId: auth.user.id,
          action: "request.update",
          targetType: "request",
          targetId: request.id,
          summary: `Updated ${request.requestNumber}`,
        });
      }
      return { request, ticket: null };
    }

    if (ticket) {
      if (!isStaff && ticket.userId !== auth.user.id) return { error: "FORBIDDEN" as const };
      if (isStaff) {
        if (body.status) ticket.status = body.status as TicketStatus;
        if (body.assigneeId !== undefined) ticket.assigneeId = body.assigneeId;
      }
      if (body.message) {
        db.messages.push({
          id: randomUUID(),
          ticketId: ticket.id,
          senderId: auth.user.id,
          message: body.message,
          createdAt: now(),
        });
      }
      ticket.updatedAt = now();
      if (ticket.userId) {
        pushNotification(db, {
          userId: ticket.userId,
          type: "ticket_update",
          title: `Ticket ${ticket.ticketNumber} updated`,
          body: body.message || `Status: ${ticket.status}`,
          href: "/portal/support",
        });
      }
      return { request: null, ticket };
    }

    return { error: "NOT_FOUND" as const };
  });

  if ("error" in result) {
    if (result.error === "FORBIDDEN") return jsonError("Forbidden", 403);
    return jsonError("Not found", 404);
  }
  return NextResponse.json(result);
}
