"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";

export function ContactForm() {
  const searchParams = useSearchParams();
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cModel, setCModel] = useState("");
  const [cMsg, setCMsg] = useState("");
  const cMsgRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const model = searchParams.get("model") ?? sessionStorage.getItem("imtiaz-contact-model");
    const msg = sessionStorage.getItem("imtiaz-contact-msg");
    if (model) {
      setCModel(model);
      sessionStorage.removeItem("imtiaz-contact-model");
      setTimeout(() => cMsgRef.current?.focus(), 200);
    }
    if (msg) {
      setCMsg(msg);
      sessionStorage.removeItem("imtiaz-contact-msg");
      setTimeout(() => cMsgRef.current?.focus(), 200);
    }
  }, [searchParams]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setToast("");
    if (!cName.trim() || !cEmail.trim() || !cMsg.trim()) {
      setError("Name, email, and message are required.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: cName.trim(),
          email: cEmail.trim(),
          subject: cModel.trim() ? `Board ${cModel.trim()}` : "Contact",
          message: cModel.trim()
            ? `Board/model: ${cModel.trim()}\n\n${cMsg.trim()}`
            : cMsg.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to send.");
        return;
      }
      setToast(data.message || `Saved. Reference ${data.ticketNumber}`);
      setCName("");
      setCEmail("");
      setCModel("");
      setCMsg("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="contact-box reveal">
      <div className="contact-info">
        <span className="eyebrow">GET IN TOUCH</span>
        <h2>Open a request</h2>
        <p>
          Send the board number, brand and what&apos;s happening with the unit. Your
          message is stored as a support ticket with a reference number.
        </p>
        <div className="telegram-block">
          <span style={{ color: "var(--text-secondary)" }}>
            📲 Connect with us on Telegram
          </span>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a
              href="https://t.me/IMTIAZBIOS1"
              target="_blank"
              rel="noopener noreferrer"
            >
              @IMTIAZBIOS1
            </a>
            <a
              href="https://t.me/Alix0808"
              target="_blank"
              rel="noopener noreferrer"
            >
              @Alix0808 (direct)
            </a>
          </div>
        </div>
      </div>
      <form noValidate onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="cName">Name</label>
          <input
            type="text"
            id="cName"
            placeholder="Your name"
            value={cName}
            onChange={(e) => setCName(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="cEmail">Email</label>
          <input
            type="email"
            id="cEmail"
            placeholder="you@example.com"
            value={cEmail}
            onChange={(e) => setCEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="cModel">Board / model number</label>
          <input
            type="text"
            id="cModel"
            placeholder="e.g. LA-H994P"
            value={cModel}
            onChange={(e) => setCModel(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="cMsg">What do you need?</label>
          <textarea
            ref={cMsgRef}
            id="cMsg"
            rows={3}
            placeholder="BIOS bin for LA-H994P, no display after GPU reflow."
            value={cMsg}
            onChange={(e) => setCMsg(e.target.value)}
          />
        </div>
        {error ? (
          <div className="toast show error" style={{ marginBottom: 12 }}>
            {error}
          </div>
        ) : null}
        <button
          className="btn btn-primary"
          type="submit"
          style={{ width: "100%" }}
          disabled={pending}
        >
          {pending ? "Sending…" : "📤 Send request"}
        </button>
        {toast ? <div className="toast show">{toast}</div> : null}
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
          Or reach us on Telegram:{" "}
          <a
            href="https://t.me/IMTIAZBIOS1"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent-cyan)" }}
          >
            t.me/IMTIAZBIOS1
          </a>
        </p>
      </form>
    </div>
  );
}
