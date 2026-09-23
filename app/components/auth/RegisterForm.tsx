"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { writeAuth } from "../../lib/auth";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
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
    if (!terms) {
      setError("Please accept the terms to continue.");
      return;
    }
    writeAuth({ role: "customer", email: email.trim(), name: name.trim() });
    setToast(true);
    setTimeout(() => router.push("/portal"), 800);
  };

  return (
    <form noValidate onSubmit={onSubmit} className="reveal">
      <div className="field">
        <label htmlFor="regName">Full name</label>
        <input
          id="regName"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      </div>
      <div className="field">
        <label htmlFor="regEmail">Email</label>
        <input
          id="regEmail"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div className="field">
        <label htmlFor="regPassword">Password</label>
        <input
          id="regPassword"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <div className="field">
        <label htmlFor="regConfirm">Confirm password</label>
        <input
          id="regConfirm"
          type="password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <label
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 16,
        }}
      >
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          style={{ marginTop: 3 }}
        />
        I agree to use these files only on hardware I own or am authorized to service.
      </label>
      {error ? (
        <div className="toast show error" style={{ marginBottom: 14 }}>
          {error}
        </div>
      ) : null}
      <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>
        Create account
      </button>
      <div className={`toast${toast ? " show" : ""}`}>
        ✅ Account created — opening your portal…
      </div>
      <p className="form-note">
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--accent-cyan)" }}>
          Log in
        </Link>
        .
      </p>
    </form>
  );
}
