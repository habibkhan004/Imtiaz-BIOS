import { NextRequest, NextResponse } from "next/server";
import type { Role, User, UserStatus } from "@/app/lib/domain/types";
import { writeAudit } from "@/app/lib/server/audit";
import {
  getDbStatus,
  loadDb,
  now,
  publicUser,
  randomUUID,
  updateDb,
} from "@/app/lib/server/db";
import { jsonError, requireSession } from "@/app/lib/server/http";
import { parsePageParams, paginate } from "@/app/lib/server/pagination";
import { hashPassword } from "@/app/lib/server/password";
import { fromClientRole, toClientRole } from "@/app/lib/domain/types";

function mapRoleParam(role: string): Role | "" {
  if (!role) return "";
  if (role === "USER" || role === "TECHNICIAN" || role === "ADMIN") return role;
  return fromClientRole(role as "customer" | "technician" | "admin");
}

export async function GET(req: NextRequest) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;
  const db = await loadDb();
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim().toLowerCase();
  const roleParam = sp.get("role") || "";
  const status = sp.get("status") || "";
  const role = mapRoleParam(roleParam);

  let users = db.users.map((u) => ({
    ...publicUser(u),
    clientRole: toClientRole(u.role),
  }));
  if (q) {
    users = users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q) ||
        (u.country || "").toLowerCase().includes(q),
    );
  }
  if (role) users = users.filter((u) => u.role === role);
  if (status) users = users.filter((u) => u.status === status);

  const page = paginate(users, parsePageParams(sp, 50));
  return NextResponse.json({
    ...page,
    db: getDbStatus(),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;

  let body: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    phone?: string;
    country?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  if (!name || !email || !password) {
    return jsonError("name, email, and password are required.");
  }
  if (!email.includes("@")) return jsonError("Enter a valid email.");
  if (password.length < 6) return jsonError("Password must be at least 6 characters.");

  const role = mapRoleParam(body.role || "customer") || "USER";
  const passwordHash = await hashPassword(password);
  const ts = now();

  try {
    const user = await updateDb((db) => {
      if (db.users.some((u) => u.email === email)) {
        throw new Error("EMAIL_EXISTS");
      }
      const days = db.settings.introDurationDays;
      const u: User = {
        id: randomUUID(),
        name,
        email,
        passwordHash,
        phone: (body.phone || "").trim(),
        country: (body.country || "").trim(),
        role,
        status: "Active",
        trialStartDate: ts,
        trialEndDate: new Date(Date.now() + days * 86400000).toISOString(),
        createdAt: ts,
        updatedAt: ts,
      };
      db.users.unshift(u);
      writeAudit(db, {
        actorId: auth.user.id,
        action: "user.create",
        targetType: "user",
        targetId: u.id,
        summary: `Created ${role} ${u.name} <${u.email}>`,
      });
      return u;
    });

    return NextResponse.json(
      { user: { ...publicUser(user), clientRole: toClientRole(user.role) }, db: getDbStatus() },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof Error && e.message === "EMAIL_EXISTS") {
      return jsonError("An account with this email already exists.", 409, "EMAIL_EXISTS");
    }
    throw e;
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;

  let body: {
    id?: string;
    status?: UserStatus;
    role?: string;
    name?: string;
    phone?: string;
    country?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }
  if (!body.id) return jsonError("id is required");

  const user = await updateDb((db) => {
    const u = db.users.find((x) => x.id === body.id);
    if (!u) return null;
    const before = JSON.stringify(publicUser(u));
    if (body.status) u.status = body.status;
    if (body.role) u.role = mapRoleParam(body.role) || u.role;
    if (body.name !== undefined) u.name = body.name.trim() || u.name;
    if (body.phone !== undefined) u.phone = body.phone.trim();
    if (body.country !== undefined) u.country = body.country.trim();
    u.updatedAt = now();
    writeAudit(db, {
      actorId: auth.user.id,
      action: "user.update",
      targetType: "user",
      targetId: u.id,
      summary: `Updated user ${u.email}`,
      before,
      after: JSON.stringify(publicUser(u)),
    });
    return u;
  });

  if (!user) return jsonError("User not found", 404);
  return NextResponse.json({
    user: { ...publicUser(user), clientRole: toClientRole(user.role) },
    db: getDbStatus(),
  });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const id = req.nextUrl.searchParams.get("id") || "";
  if (!id) return jsonError("id query param is required");
  if (id === auth.user.id) {
    return jsonError("You cannot delete your own admin account.", 400, "SELF_DELETE");
  }

  const ok = await updateDb((db) => {
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx < 0) return false;
    const [removed] = db.users.splice(idx, 1);
    writeAudit(db, {
      actorId: auth.user.id,
      action: "user.delete",
      targetType: "user",
      targetId: id,
      summary: `Deleted user ${removed.email}`,
      before: JSON.stringify(publicUser(removed)),
    });
    return true;
  });

  if (!ok) return jsonError("User not found", 404);
  return NextResponse.json({ ok: true, db: getDbStatus() });
}
