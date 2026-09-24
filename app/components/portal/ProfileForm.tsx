"use client";

import { useEffect, useState, type FormEvent } from "react";
import { readAuth, writeAuth } from "../../lib/auth";

type ProfilePayload = {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    country?: string;
    role: string;
    status: string;
    trialStartDate: string;
    trialEndDate: string;
  };
  trialDaysRemaining: number;
  subscription: null | {
    planName?: string;
    startsAt: string;
    endsAt: string;
    status: string;
  };
};

export function ProfileForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [trialEnd, setTrialEnd] = useState("");
  const [trialDays, setTrialDays] = useState(0);
  const [subSummary, setSubSummary] = useState("None");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const auth = readAuth();
    if (auth) {
      setName(auth.name);
      setEmail(auth.email);
    }
    fetch("/api/users/profile", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ProfilePayload | null) => {
        if (!data?.user) return;
        setName(data.user.name);
        setEmail(data.user.email);
        setPhone(data.user.phone || "");
        setCountry(data.user.country || "");
        setStatus(data.user.status);
        setRole(data.user.role);
        setTrialEnd(data.user.trialEndDate);
        setTrialDays(data.trialDaysRemaining);
        if (data.subscription) {
          setSubSummary(
            `${data.subscription.planName || "Plan"} · ${data.subscription.status} · ends ${new Date(data.subscription.endsAt).toLocaleDateString()}`,
          );
        }
      })
      .catch(() => undefined);
  }, []);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (newPw || confirmPw || currentPw) {
      if (!currentPw) {
        setError("Enter current password to change it.");
        return;
      }
      if (newPw.length < 6) {
        setError("New password must be at least 6 characters.");
        return;
      }
      if (newPw !== confirmPw) {
        setError("New passwords do not match.");
        return;
      }
    }
    setPending(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          phone,
          country,
          currentPassword: currentPw || undefined,
          newPassword: newPw || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed.");
        return;
      }
      const auth = readAuth();
      if (auth) {
        writeAuth({ ...auth, name: data.user.name, email: data.user.email });
      }
      setToast("✅ Profile saved");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(() => setToast(""), 3000);
    } catch {
      setError("Network error.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSave} className="portal-panel" style={{ maxWidth: 640 }}>
      <h2>Account details</h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
        Status: <strong>{status || "—"}</strong> · Role: <strong>{role || "USER"}</strong>
        <br />
        Intro access ends:{" "}
        {trialEnd ? new Date(trialEnd).toLocaleDateString() : "—"} ({trialDays} days left)
        <br />
        Subscription: {subSummary}
      </p>
      <div className="field">
        <label htmlFor="pName">Full name</label>
        <input id="pName" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="pEmail">Email</label>
        <input id="pEmail" type="email" value={email} readOnly />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="pPhone">Phone</label>
          <input id="pPhone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="pCountry">Country</label>
          <input
            id="pCountry"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>
      </div>

      <h2 style={{ marginTop: 8 }}>Change password</h2>
      <div className="field">
        <label htmlFor="pCur">Current password</label>
        <input
          id="pCur"
          type="password"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
        />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="pNew">New password</label>
          <input
            id="pNew"
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="pConf">Confirm</label>
          <input
            id="pConf"
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
          />
        </div>
      </div>

      {error ? <div className="toast show error">{error}</div> : null}
      {toast ? <div className="toast show">{toast}</div> : null}
      <button
        className="btn btn-success btn-sm"
        type="submit"
        style={{ marginTop: 8 }}
        disabled={pending}
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
