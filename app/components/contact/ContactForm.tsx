"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";

export function ContactForm() {
  const searchParams = useSearchParams();
  const [toast, setToast] = useState(false);
  const [cName, setCName] = useState("");
  const [cModel, setCModel] = useState("");
  const [cMsg, setCMsg] = useState("");
  const cMsgRef = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setToast(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(false), 4000);
    setCName("");
    setCModel("");
    setCMsg("");
  };

  return (
    <div className="contact-box reveal">
      <div className="contact-info">
        <span className="eyebrow">GET IN TOUCH</span>
        <h2>Open a request</h2>
        <p>
          Send the board number, brand and what&apos;s happening with the unit. This
          form stores the request in-session for this demo — wire it to email or a
          ticketing backend later.
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
        <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>
          📤 Send request
        </button>
        <div className={`toast${toast ? " show" : ""}`}>
          ✅ Request captured for this session — connect this form to a real inbox to
          receive it.
        </div>
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
