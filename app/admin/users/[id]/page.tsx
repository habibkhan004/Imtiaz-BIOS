"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AdminPageHeader,
  AdminPanel,
  StatusBadge,
  Toast,
} from "../../../components/admin/ui";

type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  clientRole?: string;
  status: string;
  phone?: string;
  country?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  createdAt: string;
};

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [notFound, setNotFound] = useState(false);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?limit=200`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        flash(data.error || "Failed to load");
        return;
      }
      const found = (data.items || []).find((u: ApiUser) => u.id === params.id);
      if (!found) {
        setNotFound(true);
        setUser(null);
        return;
      }
      setNotFound(false);
      setUser(found);
    } catch {
      flash("Network error");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStatus = async () => {
    if (!user) return;
    const nextStatus = user.status === "Active" ? "Suspended" : "Active";
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, status: nextStatus }),
    });
    const data = await res.json();
    if (!res.ok) {
      flash(data.error || "Update failed");
      return;
    }
    flash(`User ${nextStatus.toLowerCase()}`);
    load();
  };

  const onDelete = async () => {
    if (!user) return;
    if (!confirm(`Delete ${user.email}?`)) return;
    const res = await fetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      flash(data.error || "Delete failed");
      return;
    }
    router.push("/admin/users");
  };

  if (loading) {
    return <p style={{ color: "var(--text-muted)" }}>Loading…</p>;
  }

  if (notFound || !user) {
    return (
      <p style={{ color: "var(--text-muted)" }}>
        User not found. <Link href="/admin/users">Back</Link>
      </p>
    );
  }

  return (
    <>
      <AdminPageHeader
        title={user.name}
        description={`${user.email} · ${user.clientRole || user.role}`}
        actions={
          <div className="action-btns">
            <button
              type="button"
              className={`btn btn-sm ${user.status === "Active" ? "btn-danger" : "btn-success"}`}
              onClick={toggleStatus}
            >
              {user.status === "Active" ? "Suspend" : "Activate"}
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={onDelete}>
              Delete
            </button>
            <Link href="/admin/users" className="btn btn-outline btn-sm">
              Back
            </Link>
          </div>
        }
      />

      <AdminPanel title="Account">
        <p>
          Status: <StatusBadge status={user.status} />
        </p>
        <p style={{ marginTop: 8 }}>
          Role: <StatusBadge status={user.clientRole || user.role} />
        </p>
        <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14 }}>
          Phone: {user.phone || "—"} · Country: {user.country || "—"}
        </p>
        <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14 }}>
          Trial:{" "}
          {user.trialStartDate
            ? `${new Date(user.trialStartDate).toLocaleDateString()} → ${new Date(user.trialEndDate || "").toLocaleDateString()}`
            : "—"}
        </p>
        <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14 }}>
          Created: {new Date(user.createdAt).toLocaleString()}
        </p>
      </AdminPanel>
      <Toast message={toast} />
    </>
  );
}
