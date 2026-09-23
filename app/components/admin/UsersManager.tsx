"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ADMIN_PROFILE,
  ADMIN_USERS,
  USERS_KEY,
  appendAudit,
  loadJson,
  saveJson,
  type AdminRole,
  type AdminUser,
  type UserStatus,
} from "../../lib/admin-data";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  AdminToolbar,
  EmptyState,
  StatusBadge,
  Toast,
} from "./ui";

export function UsersManager() {
  const [rows, setRows] = useState<AdminUser[]>(ADMIN_USERS);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("customer");

  useEffect(() => {
    setRows(loadJson(USERS_KEY, ADMIN_USERS));
  }, []);

  const persist = (next: AdminUser[]) => {
    setRows(next);
    saveJson(USERS_KEY, next);
  };

  const filtered = useMemo(() => {
    return rows.filter((u) => {
      const query = q.trim().toLowerCase();
      const matchQ =
        !query ||
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        (u.company ?? "").toLowerCase().includes(query);
      return matchQ && (!role || u.role === role) && (!status || u.status === status);
    });
  }, [rows, q, role, status]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const toggleStatus = (id: string) => {
    const next = rows.map((u) => {
      if (u.id !== id) return u;
      const status: UserStatus = u.status === "Active" ? "Suspended" : "Active";
      return { ...u, status };
    });
    const user = next.find((u) => u.id === id)!;
    persist(next);
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action: user.status === "Suspended" ? "user.suspend" : "user.activate",
      target: id,
      detail: `${user.status} ${user.name}`,
    });
    flash(`Updated ${user.name}`);
  };

  const onCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !email.includes("@")) return;
    const id = `u-${Date.now()}`;
    const user: AdminUser = {
      id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: newRole,
      status: "Active",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    persist([user, ...rows]);
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action: "user.create",
      target: id,
      detail: `Created ${user.role} ${user.name}`,
    });
    setName("");
    setEmail("");
    flash("User created (demo)");
  };

  return (
    <>
      <AdminPageHeader
        title="User Management"
        description="Create and manage customers, technicians, and admins."
        accent="cyan"
      />

      <AdminToolbar>
        <input
          placeholder="Search name, email, company…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search users"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
          <option value="">All roles</option>
          <option value="customer">customer</option>
          <option value="technician">technician</option>
          <option value="admin">admin</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Status"
        >
          <option value="">All statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </select>
      </AdminToolbar>

      <AdminPanel title={`Users (${filtered.length})`}>
        {filtered.length === 0 ? (
          <EmptyState title="No users" body="Try clearing filters." />
        ) : (
          <AdminTable>
            <div className="lib-row head admin-row-users">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Company</span>
              <span>Status</span>
              <span>Created</span>
              <span>Actions</span>
            </div>
            {filtered.map((u) => (
              <div className="lib-row admin-row-users" key={u.id}>
                <span className="lib-model">{u.name}</span>
                <span className="admin-cell-muted">{u.email}</span>
                <span>
                  <StatusBadge status={u.role} />
                </span>
                <span className="admin-cell-muted">{u.company ?? "—"}</span>
                <span>
                  <StatusBadge status={u.status} />
                </span>
                <span className="admin-cell-date">{u.createdAt}</span>
                <div className="action-btns">
                  <Link href={`/admin/users/${u.id}`} className="btn btn-success btn-sm">
                    View
                  </Link>
                  <button
                    type="button"
                    className={`btn btn-sm ${u.status === "Active" ? "btn-danger" : "btn-success"}`}
                    onClick={() => toggleStatus(u.id)}
                  >
                    {u.status === "Active" ? "Suspend" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </AdminTable>
        )}
      </AdminPanel>

      <AdminPanel title="Create user">
        <form onSubmit={onCreate} noValidate>
          <div className="portal-grid-2">
            <div className="field">
              <label htmlFor="cuName">Name</label>
              <input
                id="cuName"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="cuEmail">Email</label>
              <input
                id="cuEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="cuRole">Role</label>
              <select
                id="cuRole"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as AdminRole)}
              >
                <option value="customer">customer</option>
                <option value="technician">technician</option>
                <option value="admin">admin</option>
              </select>
            </div>
          </div>
          <p className="form-note">Demo only — any login password works after create.</p>
          <div className="action-btns">
            <button type="submit" className="btn btn-success btn-sm">
              Create user
            </button>
          </div>
        </form>
      </AdminPanel>
      <Toast message={toast} />
    </>
  );
}
