"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  homeForRole,
  isAdminEmail,
  isTechnicianEmail,
  writeAuth,
  type AuthSession,
} from "../../lib/auth";
import {
  ADMIN_PROFILE,
  ADMIN_USERS,
  USERS_KEY,
  loadJson,
  type AdminRole,
  type AdminUser,
} from "../../lib/admin-data";
import { TECH_PROFILE } from "../../lib/tech-data";

function resolveSession(emailRaw: string): AuthSession {
  const email = emailRaw.trim().toLowerCase();
  const users = loadJson<AdminUser[]>(USERS_KEY, ADMIN_USERS);
  const match = users.find((u) => u.email.toLowerCase() === email);

  if (match) {
    if (match.status === "Suspended") {
      throw new Error("This account is suspended. Contact an administrator.");
    }
    const role = match.role as AdminRole;
    return { role, email: match.email, name: match.name };
  }

  if (isAdminEmail(email)) {
    return { role: "admin", email, name: ADMIN_PROFILE.name };
  }
  if (isTechnicianEmail(email)) {
    return { role: "technician", email, name: TECH_PROFILE.name };
  }
  const name = email.split("@")[0].replace(/[._]/g, " ") || "Customer";
  return {
    role: "customer",
    email,
    name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
  };
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);

  const go = (session: AuthSession) => {
    writeAuth(session);
    setToast(true);
    const nextParam = searchParams.get("next");
    let dest =
      nextParam && nextParam.startsWith("/")
        ? nextParam
        : homeForRole(session.role);

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

  const onSubmit = (e: FormEvent) => {
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
    try {
      go(resolveSession(email));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
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
      <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>
        Continue
      </button>
      <div className={`toast${toast ? " show" : ""}`}>
        ✅ Signed in — opening your console…
      </div>
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
