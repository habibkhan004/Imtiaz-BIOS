"use client";

import { useEffect, useState, type FormEvent } from "react";
import { readAuth, writeAuth } from "../../lib/auth";
import {
  CUSTOMER_PROFILE,
  PORTAL_PROFILE_KEY,
  loadPortalJson,
  savePortalJson,
} from "../../lib/portal-data";

export function ProfileForm() {
  const [name, setName] = useState(CUSTOMER_PROFILE.name);
  const [email, setEmail] = useState(CUSTOMER_PROFILE.email);
  const [phone, setPhone] = useState(CUSTOMER_PROFILE.phone);
  const [company, setCompany] = useState(CUSTOMER_PROFILE.company);
  const [telegram, setTelegram] = useState(CUSTOMER_PROFILE.telegram);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = readAuth();
    const saved = loadPortalJson(PORTAL_PROFILE_KEY, CUSTOMER_PROFILE);
    setName(saved.name || auth?.name || CUSTOMER_PROFILE.name);
    setEmail(saved.email || auth?.email || CUSTOMER_PROFILE.email);
    setPhone(saved.phone ?? CUSTOMER_PROFILE.phone);
    setCompany(saved.company ?? CUSTOMER_PROFILE.company);
    setTelegram(saved.telegram ?? CUSTOMER_PROFILE.telegram);
  }, []);

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email address.");
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
    const nextEmail = email.trim().toLowerCase();
    savePortalJson(PORTAL_PROFILE_KEY, {
      name: name.trim(),
      email: nextEmail,
      phone,
      company,
      telegram,
    });
    const auth = readAuth();
    if (auth && auth.role === "customer") {
      writeAuth({ ...auth, name: name.trim(), email: nextEmail });
    }
    setToast("✅ Profile saved");
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <form onSubmit={onSave} className="portal-panel" style={{ maxWidth: 640 }}>
      <h2>Account details</h2>
      <div className="field">
        <label htmlFor="pName">Full name</label>
        <input id="pName" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="pEmail">Email</label>
        <input
          id="pEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="pPhone">Phone</label>
          <input id="pPhone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="pCompany">Shop / company</label>
          <input
            id="pCompany"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="pTg">Telegram</label>
        <input
          id="pTg"
          value={telegram}
          onChange={(e) => setTelegram(e.target.value)}
          placeholder="@username"
        />
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
      <button className="btn btn-success btn-sm" type="submit" style={{ marginTop: 8 }}>
        Save profile
      </button>
    </form>
  );
}
