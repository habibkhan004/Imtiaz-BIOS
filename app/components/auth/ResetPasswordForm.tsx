"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

function ResetInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Missing reset token.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Reset failed.");
        return;
      }
      setOk(true);
      setTimeout(() => router.push("/login"), 1200);
    } catch {
      setError("Network error.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form noValidate onSubmit={onSubmit} className="reveal">
      {!token ? (
        <div className="toast show error">Invalid or missing reset link.</div>
      ) : null}
      <div className="field">
        <label htmlFor="rpPw">New password</label>
        <input
          id="rpPw"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <div className="field">
        <label htmlFor="rpConf">Confirm password</label>
        <input
          id="rpConf"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      {error ? (
        <div className="toast show error" style={{ marginBottom: 12 }}>
          {error}
        </div>
      ) : null}
      {ok ? <div className="toast show">✅ Password updated — redirecting…</div> : null}
      <button
        className="btn btn-primary"
        type="submit"
        style={{ width: "100%" }}
        disabled={pending || !token}
      >
        {pending ? "Saving…" : "Reset password"}
      </button>
      <p className="form-note">
        <Link href="/login" style={{ color: "var(--accent-cyan)" }}>
          Back to login
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={<p style={{ color: "var(--text-muted)" }}>Loading…</p>}>
      <ResetInner />
    </Suspense>
  );
}
