"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  AdminToolbar,
  EmptyState,
  StatusBadge,
  Toast,
} from "./ui";

type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  clientRole?: string;
  status: string;
  phone?: string;
  country?: string;
  createdAt: string;
};

type DbStatus = {
  backend: string;
  mongoConfigured: boolean;
  mongoReadyState: string;
};

export function UsersManager() {
  const [rows, setRows] = useState<ApiUser[]>([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<DbStatus | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newRole, setNewRole] = useState("customer");
  const [pending, setPending] = useState(false);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ limit: "100" });
    if (q.trim()) params.set("q", q.trim());
    if (role) params.set("role", role);
    if (status) params.set("status", status);
    try {
      const res = await fetch(`/api/admin/users?${params}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load users");
        return;
      }
      setRows(data.items || []);
      if (data.db) setDb(data.db);
    } catch {
      setError("Network error loading users");
    } finally {
      setLoading(false);
    }
  }, [q, role, status]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  const toggleStatus = async (u: ApiUser) => {
    const nextStatus = u.status === "Active" ? "Suspended" : "Active";
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: u.id, status: nextStatus }),
    });
    const data = await res.json();
    if (!res.ok) {
      flash(data.error || "Update failed");
      return;
    }
    flash(`${u.name} → ${nextStatus}`);
    load();
  };

  const onDelete = async (u: ApiUser) => {
    if (!confirm(`Delete user ${u.email}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/users?id=${encodeURIComponent(u.id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      flash(data.error || "Delete failed");
      return;
    }
    flash(`Deleted ${u.email}`);
    load();
  };

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      flash("Name, email, and password are required.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        flash(data.error || "Create failed");
        return;
      }
      setName("");
      setEmail("");
      setPassword("");
      flash("User created");
      load();
    } catch {
      flash("Network error");
    } finally {
      setPending(false);
    }
  };

  const displayRole = (u: ApiUser) => u.clientRole || u.role.toLowerCase();

  return (
    <>
      <AdminPageHeader
        title="User Management"
        description="Create, suspend, and delete users in the live database."
        accent="cyan"
      />

      {db ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
          Storage: <strong>{db.backend}</strong>
          {db.mongoConfigured
            ? ` · Mongo ${db.mongoReadyState}`
            : " · Mongo not configured"}
          {db.backend !== "mongo" ? (
            <span style={{ color: "#f0a0a0" }}>
              {" "}
              — Atlas IP not allowlisted; data is in local JSON until Mongo connects.
              Allow your IP (or 0.0.0.0/0) in Atlas → Network Access, then restart{" "}
              <code>npm run dev</code>.
            </span>
          ) : (
            <span style={{ color: "var(--accent-cyan)" }}>
              {" "}
              — writes go to MongoDB Atlas.
            </span>
          )}
        </p>
      ) : null}

      <AdminToolbar>
        <input
          placeholder="Search name, email…"
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
        <button type="button" className="btn btn-outline btn-sm" onClick={load}>
          Refresh
        </button>
      </AdminToolbar>

      {error ? <div className="toast show error">{error}</div> : null}

      <AdminPanel title={`Users (${rows.length})`}>
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading…</p>
        ) : rows.length === 0 ? (
          <EmptyState title="No users" body="Try clearing filters or create a user." />
        ) : (
          <AdminTable>
            <div className="lib-row head admin-row-users">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Country</span>
              <span>Status</span>
              <span>Created</span>
              <span>Actions</span>
            </div>
            {rows.map((u) => (
              <div className="lib-row admin-row-users" key={u.id}>
                <span className="lib-model">{u.name}</span>
                <span className="admin-cell-muted">{u.email}</span>
                <span>
                  <StatusBadge status={displayRole(u)} />
                </span>
                <span className="admin-cell-muted">{u.country || "—"}</span>
                <span>
                  <StatusBadge status={u.status} />
                </span>
                <span className="admin-cell-date">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
                <div className="action-btns">
                  <Link href={`/admin/users/${u.id}`} className="btn btn-success btn-sm">
                    View
                  </Link>
                  <button
                    type="button"
                    className={`btn btn-sm ${u.status === "Active" ? "btn-danger" : "btn-success"}`}
                    onClick={() => toggleStatus(u)}
                  >
                    {u.status === "Active" ? "Suspend" : "Activate"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(u)}
                  >
                    Delete
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
              <label htmlFor="cuPass">Password</label>
              <input
                id="cuPass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="field">
              <label htmlFor="cuRole">Role</label>
              <select
                id="cuRole"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="customer">customer</option>
                <option value="technician">technician</option>
                <option value="admin">admin</option>
              </select>
            </div>
          </div>
          <div className="action-btns">
            <button
              type="submit"
              className="btn btn-success btn-sm"
              disabled={pending}
            >
              {pending ? "Creating…" : "Create user"}
            </button>
          </div>
        </form>
      </AdminPanel>
      <Toast message={toast} />
    </>
  );
}
