"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_PAYMENTS,
  ADMIN_PROFILE,
  PAYMENTS_KEY,
  appendAudit,
  loadJson,
  saveJson,
  type AdminPayment,
  type PaymentStatus,
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

export function PaymentsManager() {
  const [rows, setRows] = useState<AdminPayment[]>(ADMIN_PAYMENTS);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    setRows(loadJson(PAYMENTS_KEY, ADMIN_PAYMENTS));
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((p) => {
      const query = q.trim().toLowerCase();
      const matchQ =
        !query ||
        p.id.toLowerCase().includes(query) ||
        p.customerName.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query);
      const matchS = !status || p.status === status;
      const matchFrom = !from || p.date >= from;
      const matchTo = !to || p.date <= to;
      return matchQ && matchS && matchFrom && matchTo;
    });
  }, [rows, q, status, from, to]);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 1800);
  };

  const refund = (id: string) => {
    const next = rows.map((p) =>
      p.id === id ? { ...p, status: "Refunded" as PaymentStatus } : p,
    );
    setRows(next);
    saveJson(PAYMENTS_KEY, next);
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action: "payment.refund",
      target: id,
      detail: "Marked refunded",
    });
    flash("Marked refunded");
  };

  return (
    <>
      <AdminPageHeader
        title="Payment History"
        description="Invoice ledger with demo refund and receipt actions."
      />
      <AdminToolbar>
        <input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="Paid">Paid</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To" />
      </AdminToolbar>
      <AdminPanel title={`Payments (${filtered.length})`}>
        {filtered.length === 0 ? (
          <EmptyState title="No payments" body="Nothing matches these filters." />
        ) : (
          <AdminTable>
            <div className="lib-row head admin-row-payments">
              <span>Invoice</span>
              <span>Date</span>
              <span>Customer</span>
              <span>Description</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {filtered.map((p) => (
              <div className="lib-row admin-row-payments" key={p.id}>
                <span className="lib-model">{p.id}</span>
                <span className="admin-cell-date">{p.date}</span>
                <span className="admin-cell-muted">{p.customerName}</span>
                <span className="admin-cell-muted">{p.description}</span>
                <span>{p.amount}</span>
                <span>
                  <StatusBadge status={p.status} />
                </span>
                <div className="action-btns">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => flash(`Receipt ${p.id} (demo)`)}
                  >
                    Receipt
                  </button>
                  {p.status === "Paid" ? (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => refund(p.id)}
                    >
                      Refund
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </AdminTable>
        )}
      </AdminPanel>
      <Toast message={toast} />
    </>
  );
}
