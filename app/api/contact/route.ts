import { NextRequest, NextResponse } from "next/server";
import type { SupportTicket } from "@/app/lib/domain/types";
import { nextTicketNumber, now, randomUUID, updateDb } from "@/app/lib/server/db";
import { jsonError, rateLimit } from "@/app/lib/server/http";
import { getSession } from "@/app/lib/server/session";
import { pushNotification } from "@/app/lib/server/notifications";

/** Public contact form — persists a ticket and returns ticket number (FR-24). */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`contact:${req.headers.get("x-forwarded-for") || "local"}`, 10, 60_000);
  if (!rl.ok) return rl.response;

  let body: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const subject = (body.subject || "").trim() || "Contact form";
  const message = (body.message || "").trim();
  if (!name || !email || !message) {
    return jsonError("name, email, and message are required.");
  }

  const session = await getSession();

  const ticket = await updateDb((db) => {
    const ts = now();
    const row: SupportTicket = {
      id: randomUUID(),
      ticketNumber: nextTicketNumber(db, "TCK"),
      type: "contact",
      userId: session?.userId,
      subject: `${subject} — ${name}`,
      description: `From: ${name} <${email}>\n\n${message}`,
      priority: "normal",
      status: "pending",
      attachments: [],
      createdAt: ts,
      updatedAt: ts,
    };
    db.tickets.unshift(row);
    if (session?.userId) {
      pushNotification(db, {
        userId: session.userId,
        type: "contact",
        title: "Contact received",
        body: `Reference ${row.ticketNumber}`,
        href: "/portal/support",
      });
    }
    return row;
  });

  return NextResponse.json({
    ticketNumber: ticket.ticketNumber,
    message: `Thank you. Your reference number is ${ticket.ticketNumber}.`,
  });
}
