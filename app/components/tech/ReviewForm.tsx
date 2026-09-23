"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  allowedStatuses,
  loadAssignedRequest,
  saveReview,
  TECH_CHANGE_EVENT,
  type TechAssignedRequest,
  type TechStatus,
} from "../../lib/tech-data";

const ASSESSMENTS = [
  "Looks valid",
  "Needs more info",
  "Cannot fulfill",
  "Ready to fulfill",
] as const;

export function ReviewForm({ item: seed }: { item: TechAssignedRequest }) {
  const router = useRouter();
  const [item, setItem] = useState(seed);
  const [assessment, setAssessment] = useState<(typeof ASSESSMENTS)[number]>(
    "Looks valid",
  );
  const [nextStatus, setNextStatus] = useState<TechStatus>(
    allowedStatuses(seed.type)[1] ?? seed.status,
  );
  const [summary, setSummary] = useState("");
  const [chip, setChip] = useState(false);
  const [rev, setRev] = useState(false);
  const [sizeOk, setSizeOk] = useState(false);
  const [checksum, setChecksum] = useState("");
  const [toast, setToast] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const sync = () => {
      const live = loadAssignedRequest(seed.id);
      if (live) setItem(live);
    };
    sync();
    window.addEventListener(TECH_CHANGE_EVENT, sync);
    return () => window.removeEventListener(TECH_CHANGE_EVENT, sync);
  }, [seed.id]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      setError("Internal summary is required.");
      return;
    }
    setError("");
    saveReview(
      item.id,
      {
        assessment,
        summary,
        checklist: { chip, rev, sizeOk, checksum },
      },
      nextStatus,
    );
    setToast(true);
    setTimeout(() => router.push(`/tech/requests/${item.id}/status`), 800);
  };

  return (
    <form className="portal-panel" onSubmit={onSubmit} noValidate>
      <h2>Review form</h2>
      <div className="field">
        <label htmlFor="assessment">Assessment</label>
        <select
          id="assessment"
          value={assessment}
          onChange={(e) =>
            setAssessment(e.target.value as (typeof ASSESSMENTS)[number])
          }
        >
          {ASSESSMENTS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="nextStatus">Recommended next status</label>
        <select
          id="nextStatus"
          value={nextStatus}
          onChange={(e) => setNextStatus(e.target.value as TechStatus)}
        >
          {allowedStatuses(item.type).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="summary">Internal summary *</label>
        <textarea
          id="summary"
          rows={4}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="What did you find? What should happen next?"
        />
      </div>
      <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
        <span className="eyebrow">CHECKLIST</span>
        <label style={{ display: "flex", gap: 8, fontSize: 14 }}>
          <input type="checkbox" checked={chip} onChange={(e) => setChip(e.target.checked)} />
          Chip / part matches request
        </label>
        <label style={{ display: "flex", gap: 8, fontSize: 14 }}>
          <input type="checkbox" checked={rev} onChange={(e) => setRev(e.target.checked)} />
          Board revision confirmed
        </label>
        <label style={{ display: "flex", gap: 8, fontSize: 14 }}>
          <input
            type="checkbox"
            checked={sizeOk}
            onChange={(e) => setSizeOk(e.target.checked)}
          />
          Dump size looks correct
        </label>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="checksum">Checksum / integrity note</label>
          <input
            id="checksum"
            value={checksum}
            onChange={(e) => setChecksum(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>
      {error ? (
        <div className="toast show error" style={{ marginBottom: 12 }}>
          {error}
        </div>
      ) : null}
      <div className="action-btns">
        <button type="submit" className="btn btn-success btn-sm">
          Submit review
        </button>
        <Link href={`/tech/messages/${item.id}`} className="btn btn-primary btn-sm">
          Message customer
        </Link>
        <Link href={`/tech/notes/${item.id}`} className="btn btn-purple btn-sm">
          Notes
        </Link>
        <Link href="/tech" className="btn btn-outline btn-sm">
          Back to queue
        </Link>
      </div>
      <div className={`toast${toast ? " show" : ""}`}>
        ✅ Review saved — opening status update…
      </div>
    </form>
  );
}
