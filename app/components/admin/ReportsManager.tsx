"use client";

import { useCallback, useEffect, useState } from "react";
import type { PlatformReport } from "../../lib/reports";
import { AdminPageHeader, AdminPanel, AdminToolbar, StatCards } from "./ui";

export function ReportsManager() {
  const [period, setPeriod] = useState<"7" | "30" | "90">("30");
  const [report, setReport] = useState<PlatformReport | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/reports?days=${period}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load report");
        setReport(null);
        return;
      }
      setReport(data.report);
    } catch {
      setError("Network error loading report");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  const exportCsv = () => {
    window.open(`/api/admin/reports?days=${period}&format=csv`, "_blank");
  };

  const max = Math.max(...(report?.downloadsSeries.map((d) => d.value) || [1]), 1);

  return (
    <>
      <AdminPageHeader
        title="Reports"
        description="Live aggregates: downloads, requests, uploads, trial vs paid, revenue stubs."
      />
      <AdminToolbar>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as "7" | "30" | "90")}
          aria-label="Period"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
        <button type="button" className="btn btn-outline btn-sm" onClick={load}>
          Refresh
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={exportCsv}>
          Export CSV
        </button>
      </AdminToolbar>
      {error ? <div className="toast show error">{error}</div> : null}
      {loading && !report ? (
        <p style={{ color: "var(--text-muted)" }}>Loading report…</p>
      ) : report ? (
        <>
          <StatCards
            items={[
              { label: "New users", value: report.newUsers },
              { label: "Trial users", value: report.trialUsers },
              { label: "Paid subscribers", value: report.paidSubscribers },
              { label: "Downloads (period)", value: report.downloadsInPeriod },
              { label: "Revenue paid", value: `$${report.revenuePaid}` },
            ]}
          />
          <div className="portal-grid-2">
            <AdminPanel title="Downloads over time">
              <div style={{ display: "grid", gap: 10 }}>
                {report.downloadsSeries.map((d) => (
                  <div key={d.label}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        marginBottom: 4,
                      }}
                    >
                      <span>{d.label}</span>
                      <span>{d.value}</span>
                    </div>
                    <div className="portal-meter-track">
                      <div
                        className="portal-meter-fill"
                        style={{ width: `${(d.value / max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </AdminPanel>
            <AdminPanel title="Upload outcomes">
              <p style={{ fontSize: 14, marginBottom: 8 }}>
                Approved: <strong>{report.uploadsApproved}</strong>
              </p>
              <p style={{ fontSize: 14, marginBottom: 8 }}>
                Needs info: <strong>{report.uploadsNeedsInfo}</strong>
              </p>
              <p style={{ fontSize: 14, marginBottom: 8 }}>
                Rejected: <strong>{report.uploadsRejected}</strong>
              </p>
              <p style={{ fontSize: 14, marginBottom: 8 }}>
                Pending: <strong>{report.uploadsPending}</strong>
              </p>
              <h3 style={{ marginTop: 20, marginBottom: 8, fontSize: 16 }}>Payments</h3>
              <p style={{ fontSize: 14 }}>
                Paid ${report.revenuePaid} ({report.paymentCount}) · Failed $
                {report.revenueFailed}
              </p>
            </AdminPanel>
          </div>
          <div className="portal-grid-2">
            <AdminPanel title="Most downloaded files">
              {report.mostDownloaded.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No downloads in range.</p>
              ) : (
                report.mostDownloaded.map((r) => (
                  <div
                    key={r.fileId}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 14,
                      marginBottom: 8,
                    }}
                  >
                    <span>{r.name}</span>
                    <strong>{r.count}</strong>
                  </div>
                ))
              )}
            </AdminPanel>
            <AdminPanel title="Most requested boards">
              {report.mostRequestedBoards.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No requests in range.</p>
              ) : (
                report.mostRequestedBoards.map((r) => (
                  <div
                    key={r.board}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 14,
                      marginBottom: 8,
                    }}
                  >
                    <span>{r.board}</span>
                    <strong>{r.count}</strong>
                  </div>
                ))
              )}
            </AdminPanel>
          </div>
          <div className="portal-grid-2">
            <AdminPanel title="Popular brands (by download count)">
              {report.popularBrands.map((r) => (
                <div
                  key={r.brand}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  <span>{r.brand}</span>
                  <strong>{r.count}</strong>
                </div>
              ))}
            </AdminPanel>
            <AdminPanel title="Request / ticket status">
              <h3 style={{ fontSize: 14, marginBottom: 8 }}>File requests</h3>
              {Object.entries(report.requestsByStatus).map(([k, v]) => (
                <p key={k} style={{ fontSize: 13, marginBottom: 4 }}>
                  {k}: <strong>{v}</strong>
                </p>
              ))}
              <h3 style={{ fontSize: 14, margin: "12px 0 8px" }}>Support tickets</h3>
              {Object.entries(report.ticketsByStatus).map(([k, v]) => (
                <p key={k} style={{ fontSize: 13, marginBottom: 4 }}>
                  {k}: <strong>{v}</strong>
                </p>
              ))}
            </AdminPanel>
          </div>
        </>
      ) : null}
    </>
  );
}
