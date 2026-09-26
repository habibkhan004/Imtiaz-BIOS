"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  homeForRole,
  roleFromApi,
  writeAuth,
  type AuthSession,
} from "../../lib/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);
  const [pending, setPending] = useState(false);

  const go = (session: AuthSession, redirectTo?: string) => {
    writeAuth(session);
    setToast(true);
    const nextParam = searchParams.get("next");
    let dest =
      nextParam && nextParam.startsWith("/")
        ? nextParam
        : redirectTo || homeForRole(session.role);

    if (session.role === "admin" && (dest.startsWith("/portal") || dest.startsWith("/tech"))) {
      dest = "/admin";
    }
    if (session.role === "technician" && (dest.startsWith("/portal") || dest.startsWith("/admin"))) {
      dest = "/tech";
    }
    if (session.role === "customer" && (dest.startsWith("/tech") || dest.startsWith("/admin"))) {
      dest = "/portal";
    }

    setTimeout(() => router.push(dest), 700);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to sign in.");
        return;
      }
      const session: AuthSession = {
        role: roleFromApi(data.user.role),
        email: data.user.email,
        name: data.user.name,
        userId: data.user.id,
      };
      go(session, data.redirectTo);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form noValidate onSubmit={onSubmit} className="reveal">
      <div className="field">
        <label htmlFor="loginEmail">Email</label>
        <input
          id="loginEmail"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div className="field">
        <label htmlFor="loginPassword">Password</label>
        <input
          id="loginPassword"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      {error ? (
        <div className="toast show error" style={{ marginBottom: 14 }}>
          {error}
        </div>
      ) : null}
      <button
        className="btn btn-primary"
        type="submit"
        style={{ width: "100%" }}
        disabled={pending}
      >
        {pending ? "Signing in…" : "Continue"}
      </button>
      <div className={`toast${toast ? " show" : ""}`}>
        ✅ Signed in — opening your console…
      </div>
      <p className="form-note">
        <Link href="/forgot-password" style={{ color: "var(--accent-cyan)" }}>
          Forgot password?
        </Link>
      </p>
      <p className="form-note">
        No account?{" "}
        <Link href="/register" style={{ color: "var(--accent-cyan)" }}>
          Sign up
        </Link>
        .
      </p>
    </form>
  );
}
