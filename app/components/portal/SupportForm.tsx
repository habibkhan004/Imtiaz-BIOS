"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { SUPPORT_TICKETS, type SupportTicket } from "../../lib/portal-data";
import { StatusBadge } from "./ui";

const KEY = "imtiaz-portal-support";

export function SupportClient() {
  const router = useRouter();
  const [rows, setRows] = useState<SupportTicket[]>(SUPPORT_TICKETS);
  const [subject, setSubject] = useState("");
  const [model, setModel] = useState("");
  const [priority, setPriority] = useState<"Low" | "Normal" | "High">("Normal");
  const [description, setDescription] = useState("");
  const [toast, setToast] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setRows(JSON.parse(raw) as SupportTicket[]);
    } catch {
      /* ignore */
    }
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    const id = `TS-${200 + rows.length + Math.floor(Math.random() * 40)}`;
    const next: SupportTicket = {
      id,
      subject: subject.trim(),
      model: model.trim() || "—",
      priority,
      description: description.trim(),
      status: "Open",
      updatedAt: new Date().toISOString().slice(0, 10),
      messages: [
        {
          at: new Date().toISOString().slice(0, 16).replace("T", " "),
          from: "customer",
          text: description.trim(),
        },
      ],
    };
    const updated = [next, ...rows];
    setRows(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
    setSubject("");
    setModel("");
    setDescription("");
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <>
      <div className="portal-panel">
        <h2>Open support ticket</h2>
        <form onSubmit={onSubmit}>
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
              <label htmlFor="sModel">Board / model</label>
              <input id="sModel" value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="sPri">Priority</label>
              <select
                id="sPri"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "Low" | "Normal" | "High")
                }
              >
                <option>Low</option>
                <option>Normal</option>
                <option>High</option>
              </select>
            </div>
          </div>
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
          <button className="btn btn-success btn-sm" type="submit">
            Submit ticket
          </button>
          {toast ? <div className="toast show">✅ Support ticket created.</div> : null}
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
              <span>Priority</span>
              <span>Status</span>
              <span>Updated</span>
              <span></span>
            </div>
            {rows.map((t) => (
              <div className="lib-row" key={t.id}>
                <span className="lib-model">
                  <Link href={`/portal/support/${t.id}`}>{t.id}</Link>
                </span>
                <span>{t.subject}</span>
                <span>{t.priority}</span>
                <span>
                  <StatusBadge status={t.status} />
                </span>
                <span>{t.updatedAt}</span>
                <div className="action-btns">
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={() => router.push(`/portal/support/${t.id}`)}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
