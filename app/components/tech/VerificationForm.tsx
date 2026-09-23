"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  loadVerificationItem,
  saveVerificationResult,
  TECH_CHANGE_EVENT,
  type VerificationItem,
} from "../../lib/tech-data";

export function VerificationForm({ item: seed }: { item: VerificationItem }) {
  const router = useRouter();
  const [item, setItem] = useState(seed);
  const [chipGuess, setChipGuess] = useState("");
  const [sizeOk, setSizeOk] = useState<"yes" | "no" | "">("");
  const [revMatched, setRevMatched] = useState<"yes" | "no" | "">("");
  const [publish, setPublish] = useState<"yes" | "no">("no");
  const [note, setNote] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const sync = () => {
      const live = loadVerificationItem(seed.id) ?? loadVerificationItem(seed.requestId);
      if (live) setItem(live);
    };
    sync();
    window.addEventListener(TECH_CHANGE_EVENT, sync);
    return () => window.removeEventListener(TECH_CHANGE_EVENT, sync);
  }, [seed.id, seed.requestId]);

  const save = (result: "Verified" | "Needs changes" | "Rejected") => {
    if ((result === "Needs changes" || result === "Rejected") && !note.trim()) {
      setError("Add a note/reason for the customer.");
      return;
    }
    setError("");
    saveVerificationResult(item.requestId, result, {
      chipGuess,
      sizeOk,
      revMatched,
      publish,
      note,
    });
    setToast(
      result === "Verified"
        ? "✅ Marked verified"
        : result === "Needs changes"
          ? "⚠️ Marked needs changes"
          : "❌ Rejected",
    );
    setTimeout(() => router.push("/tech?type=upload"), 900);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <form className="portal-panel" onSubmit={onSubmit} noValidate>
      <h2>Verification actions</h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
        Current status: <strong>{item.status}</strong>
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
          onChange={(e) => setSizeOk(e.target.value as typeof sizeOk)}
        >
          <option value="">Select…</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="revMatched">Board revision matched?</label>
        <select
          id="revMatched"
          value={revMatched}
          onChange={(e) => setRevMatched(e.target.value as typeof revMatched)}
        >
          <option value="">Select…</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="publish">Publish to public library?</label>
        <select
          id="publish"
          value={publish}
          onChange={(e) => setPublish(e.target.value as "yes" | "no")}
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="vnote">Tech note / customer reason</label>
        <textarea
          id="vnote"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Required for Needs changes / Reject"
        />
      </div>
      {error ? (
        <div className="toast show error" style={{ marginBottom: 12 }}>
          {error}
        </div>
      ) : null}
      <div className="action-btns">
        <button
          type="button"
          className="btn btn-success btn-sm"
          onClick={() => save("Verified")}
        >
          Verify (pass)
        </button>
        <button
          type="button"
          className="btn btn-gold btn-sm"
          onClick={() => save("Needs changes")}
        >
          Needs changes
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => save("Rejected")}
        >
          Reject
        </button>
        <Link href={`/tech/notes/${item.requestId}`} className="btn btn-purple btn-sm">
          Technical notes
        </Link>
        <Link href="/tech?type=upload" className="btn btn-outline btn-sm">
          Queue
        </Link>
      </div>
      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </form>
  );
}
