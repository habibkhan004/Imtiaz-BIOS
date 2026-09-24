"use client";

import { useState } from "react";
import { EmptyState, PortalPageHeader, StatusBadge } from "../../components/portal/ui";
import { PAYMENTS } from "../../lib/portal-data";

export default function PaymentsPage() {
  const [toast, setToast] = useState("");

  return (
    <>
      <PortalPageHeader
        eyebrow="PAYMENTS"
        title="Payment history"
        description="Invoices and unlock fees for your account (demo data)."
      />
      <div className="portal-panel">
        {PAYMENTS.length === 0 ? (
          <EmptyState
            title="No payments yet"
            body="When you subscribe or pay unlock fees, receipts appear here."
            actionHref="/portal/subscription"
            actionLabel="View plans"
          />
        ) : (
          <div className="lib-table portal-payments-table">
            <div className="lib-row head">
              <span>Invoice</span>
              <span>Date</span>
              <span>Description</span>
              <span>Amount</span>
              <span>Status</span>
              <span></span>
            </div>
            {PAYMENTS.map((p) => (
              <div className="lib-row" key={p.id}>
                <span className="lib-model">{p.id}</span>
                <span>{p.date}</span>
                <span>{p.description}</span>
                <span>{p.amount}</span>
                <span>
                  <StatusBadge status={p.status} />
                </span>
                <div className="action-btns">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setToast(`Receipt ${p.id} (demo)`);
                      setTimeout(() => setToast(""), 2000);
                    }}
                  >
                    Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {toast ? <div className="toast show">{toast}</div> : null}
      </div>
    </>
  );
}
