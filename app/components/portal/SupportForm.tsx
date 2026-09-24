"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { StatusBadge } from "./ui";

type ApiTicket = {
  id: string;
  ticketNumber: string;
  subject: string;
  type: string;
  priority: string;
  status: string;
  updatedAt: string;
};

export function SupportClient() {
  const router = useRouter();
  const [rows, setRows] = useState<ApiTicket[]>([]);
  const [ticketType, setTicketType] = useState<"technical" | "password" | "general">(
    "technical",
  );
  const [subject, setSubject] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [boardNumber, setBoardNumber] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [priority, setPriority] = useState("normal");
  const [description, setDescription] = useState("");
  const [ownershipAck, setOwnershipAck] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const load = () => {
    fetch("/api/requests/my", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.tickets) setRows(data.tickets);
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!subject.trim() || !description.trim()) return;
    if (ticketType === "password" && !ownershipAck) {
      setError("You must confirm authorization/ownership before submitting.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          requestType: ticketType,
          subject: subject.trim(),
          brand,
          model,
          boardNumber,
          serviceIdentifier: serviceId,
          symptoms,
          description: description.trim(),
          priority,
          ownershipAck,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit.");
        return;
      }
      setToast(`✅ ${data.ticket.ticketNumber} created`);
      setSubject("");
      setDescription("");
      setSymptoms("");
      setOwnershipAck(false);
      load();
      setTimeout(() => setToast(""), 2500);
    } catch {
      setError("Network error.");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <div className="portal-panel">
        <h2>Open support ticket</h2>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="sType">Type</label>
            <select
              id="sType"
              value={ticketType}
              onChange={(e) =>
                setTicketType(e.target.value as "technical" | "password" | "general")
              }
            >
              <option value="technical">Technical support</option>
              <option value="password">Password / firmware support</option>
              <option value="general">General</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="sSub">Subject</label>
            <input
              id="sSub"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="sBrand">Brand</label>
              <input id="sBrand" value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="sModel">Model</label>
              <input id="sModel" value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="sBoard">Board number</label>
              <input
                id="sBoard"
                value={boardNumber}
                onChange={(e) => setBoardNumber(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="sPri">Priority</label>
              <select
                id="sPri"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          {ticketType === "password" ? (
            <>
              <div className="field">
                <label htmlFor="sSvc">Service identifier</label>
                <input
                  id="sSvc"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  placeholder="Service tag / serial"
                />
              </div>
              <label
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  marginBottom: 14,
                }}
              >
                <input
                  type="checkbox"
                  checked={ownershipAck}
                  onChange={(e) => setOwnershipAck(e.target.checked)}
                  style={{ marginTop: 3 }}
                />
                I confirm I own this device or am authorized by the owner to request
                password/firmware support. Unauthorized requests are prohibited.
              </label>
            </>
          ) : (
            <div className="field">
              <label htmlFor="sSym">Symptoms</label>
              <input
                id="sSym"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="sDesc">Description</label>
            <textarea
              id="sDesc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          {error ? <div className="toast show error">{error}</div> : null}
          <button className="btn btn-success btn-sm" type="submit" disabled={pending}>
            {pending ? "Submitting…" : "Submit ticket"}
          </button>
          {toast ? <div className="toast show">{toast}</div> : null}
        </form>
      </div>

      <div className="portal-panel">
        <h2>Your tickets</h2>
        {rows.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No tickets yet.</p>
        ) : (
          <div className="lib-table portal-support-table">
            <div className="lib-row head">
              <span>ID</span>
              <span>Subject</span>
              <span>Type</span>
              <span>Status</span>
              <span />
            </div>
            {rows.map((r) => (
              <div className="lib-row" key={r.id}>
                <span className="lib-model">{r.ticketNumber}</span>
                <span>{r.subject}</span>
                <span>{r.type}</span>
                <span>
                  <StatusBadge status={r.status} />
                </span>
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={() => router.push(`/portal/support/${r.id}`)}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}
        <Link href="/portal/requests" className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>
          File requests
        </Link>
      </div>
    </>
  );
}
