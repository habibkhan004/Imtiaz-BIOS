"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  loadNotes,
  saveNotes,
  TECH_PROFILE,
  type TechNote,
} from "../../lib/tech-data";
import { StatusBadge } from "./ui";

export function NotesEditor({ requestId }: { requestId: string }) {
  const [notes, setNotes] = useState<TechNote[]>([]);
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<"Internal" | "Customer-visible">(
    "Internal",
  );
  const [toast, setToast] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setNotes(loadNotes(requestId));
  }, [requestId]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim()) {
      setError("Note body is required.");
      return;
    }
    setError("");
    const note: TechNote = {
      id: `TN-${Date.now()}`,
      requestId,
      body: body.trim(),
      visibility,
      author: TECH_PROFILE.name,
      at: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    const next = [...notes, note];
    setNotes(next);
    saveNotes(requestId, next);
    setBody("");
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  return (
    <div>
      <p className="form-note" style={{ marginBottom: 16 }}>
        Internal notes are for technicians; customer-visible notes may appear in
        messages.
      </p>
      <div className="portal-panel">
        <h2>Existing notes</h2>
        {notes.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No notes yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {notes.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: 12,
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-card)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 8,
                    alignItems: "center",
                  }}
                >
                  <strong style={{ fontSize: 13 }}>{n.author}</strong>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {n.at}
                  </span>
                  <StatusBadge status={n.visibility} />
                </div>
                <p style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{n.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <form className="portal-panel" onSubmit={onSubmit} noValidate>
        <h2>Add note</h2>
        <div className="field">
          <label htmlFor="noteBody">Body *</label>
          <textarea
            id="noteBody"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Technical observation…"
          />
        </div>
        <div className="field">
          <label htmlFor="vis">Visibility</label>
          <select
            id="vis"
            value={visibility}
            onChange={(e) =>
              setVisibility(e.target.value as "Internal" | "Customer-visible")
            }
          >
            <option value="Internal">Internal</option>
            <option value="Customer-visible">Customer-visible</option>
          </select>
        </div>
        {error ? (
          <div className="toast show error" style={{ marginBottom: 12 }}>
            {error}
          </div>
        ) : null}
        <button type="submit" className="btn btn-success btn-sm">
          Save note
        </button>
        <div className={`toast${toast ? " show" : ""}`}>✅ Note saved</div>
      </form>
    </div>
  );
}
