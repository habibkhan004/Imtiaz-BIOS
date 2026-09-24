"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type LiveUpload = {
  id: string;
  originalName: string;
  status: string;
};

export function VerificationForm({
  upload,
  onDone,
}: {
  upload: LiveUpload;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [chipGuess, setChipGuess] = useState("");
  const [sizeOk, setSizeOk] = useState<"yes" | "no" | "">("");
  const [revMatched, setRevMatched] = useState<"yes" | "no" | "">("");
  const [publish, setPublish] = useState(true);
  const [note, setNote] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const save = async (status: "approved" | "needs_info" | "rejected") => {
    if ((status === "needs_info" || status === "rejected") && !note.trim()) {
      setError("Add a note/reason for the customer.");
      return;
    }
    setError("");
    setPending(true);
    try {
      const reviewNote = [
        note.trim(),
        chipGuess ? `chip=${chipGuess}` : "",
        sizeOk ? `sizeOk=${sizeOk}` : "",
        revMatched ? `revMatched=${revMatched}` : "",
      ]
        .filter(Boolean)
        .join(" · ");

      const res = await fetch(`/api/uploads/${upload.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewNote,
          publish: status === "approved" ? publish : false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Review failed");
        return;
      }
      setToast(
        status === "approved"
          ? "✅ Approved"
          : status === "needs_info"
            ? "⚠️ Needs info"
            : "❌ Rejected",
      );
      onDone?.();
      setTimeout(() => router.push("/tech?type=upload"), 900);
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <form className="portal-panel" onSubmit={onSubmit} noValidate>
      <h2>Verification actions</h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
        Current status: <strong>{upload.status}</strong>
      </p>
      <div className="field">
        <label htmlFor="chipGuess">Chip part guess</label>
        <input
          id="chipGuess"
          value={chipGuess}
          onChange={(e) => setChipGuess(e.target.value)}
          placeholder="e.g. W25Q128JV"
        />
      </div>
      <div className="field">
        <label htmlFor="sizeOk">Dump size OK?</label>
        <select
          id="sizeOk"
          value={sizeOk}
          onChange={(e) => setSizeOk(e.target.value as "yes" | "no" | "")}
        >
          <option value="">—</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="revMatched">Board rev matched?</label>
        <select
          id="revMatched"
          value={revMatched}
          onChange={(e) => setRevMatched(e.target.value as "yes" | "no" | "")}
        >
          <option value="">—</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      <label style={{ display: "flex", gap: 8, marginBottom: 14, fontSize: 14 }}>
        <input
          type="checkbox"
          checked={publish}
          onChange={(e) => setPublish(e.target.checked)}
        />
        Publish to library on approve
      </label>
      <div className="field">
        <label htmlFor="note">Customer-facing note</label>
        <textarea
          id="note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Required for needs info / reject"
        />
      </div>
      {error ? (
        <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>
      ) : null}
      {toast ? (
        <p style={{ color: "var(--accent-cyan)", fontSize: 13, marginBottom: 12 }}>
          {toast}
        </p>
      ) : null}
      <div className="action-btns" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button
          type="button"
          className="btn btn-success btn-sm"
          disabled={pending}
          onClick={() => save("approved")}
        >
          Approve
        </button>
        <button
          type="button"
          className="btn btn-gold btn-sm"
          disabled={pending}
          onClick={() => save("needs_info")}
        >
          Needs info
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          disabled={pending}
          onClick={() => save("rejected")}
        >
          Reject
        </button>
        <Link href="/tech?type=upload" className="btn btn-outline btn-sm">
          Back
        </Link>
      </div>
    </form>
  );
}
