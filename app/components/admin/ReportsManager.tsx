"use client";

import { useMemo, useState } from "react";
import { reportMetrics } from "../../lib/admin-data";
import { AdminPageHeader, AdminPanel, AdminToolbar, StatCards } from "./ui";

export function ReportsManager() {
  const [period, setPeriod] = useState<"7" | "30" | "90">("30");
  const data = useMemo(() => reportMetrics(period), [period]);
  const max = Math.max(...data.downloads.map((d) => d.value), 1);

  const exportCsv = () => {
    const lines = [
      "metric,value",
      `period_days,${period}`,
      `new_users,${data.newUsers}`,
      `fulfilled,${data.fulfilled}`,
      `rejected,${data.rejected}`,
      `upload_verified,${data.uploadVerified}`,
      `upload_needs_changes,${data.uploadNeedsChanges}`,
      `upload_rejected,${data.uploadRejected}`,
      `revenue_paid,${data.revenuePaid}`,
      `revenue_failed,${data.revenueFailed}`,
      ...data.downloads.map((d) => `downloads_${d.label},${d.value}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `imtiaz-admin-report-${period}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <AdminPageHeader
        title="Reports"
        description="Mock analytics for downloads, users, requests, uploads, and revenue."
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
        <button type="button" className="btn btn-primary btn-sm" onClick={exportCsv}>
          Export CSV
        </button>
      </AdminToolbar>
      <StatCards
        items={[
          { label: "New users", value: data.newUsers },
          { label: "Requests fulfilled", value: data.fulfilled },
          { label: "Requests rejected", value: data.rejected },
          { label: "Revenue paid", value: data.revenuePaid },
        ]}
      />
      <div className="portal-grid-2">
        <AdminPanel title="Downloads over time">
          <div style={{ display: "grid", gap: 10 }}>
            {data.downloads.map((d) => (
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
            Verified: <strong>{data.uploadVerified}</strong>
          </p>
          <p style={{ fontSize: 14, marginBottom: 8 }}>
            Needs changes: <strong>{data.uploadNeedsChanges}</strong>
          </p>
          <p style={{ fontSize: 14, marginBottom: 8 }}>
            Rejected: <strong>{data.uploadRejected}</strong>
          </p>
          <h3 style={{ marginTop: 20, marginBottom: 8, fontSize: 16 }}>Revenue</h3>
          <p style={{ fontSize: 14 }}>
            Paid {data.revenuePaid} · Failed {data.revenueFailed}
          </p>
        </AdminPanel>
      </div>
    </>
  );
}
