"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setPending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setMessage(
        data.message ||
          "If an account exists for that email, password reset instructions have been sent.",
      );
    } catch {
      setMessage(
        "If an account exists for that email, password reset instructions have been sent.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <form noValidate onSubmit={onSubmit} className="reveal">
      <div className="field">
        <label htmlFor="fpEmail">Email</label>
        <input
          id="fpEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>
      <button
        className="btn btn-primary"
        type="submit"
        style={{ width: "100%" }}
        disabled={pending}
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
      {message ? (
        <div className="toast show" style={{ marginTop: 14 }}>
          {message}
        </div>
      ) : null}
      <p className="form-note">
        <Link href="/login" style={{ color: "var(--accent-cyan)" }}>
          Back to login
        </Link>
      </p>
    </form>
  );
}
