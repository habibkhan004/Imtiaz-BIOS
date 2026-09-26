"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { readAuth } from "../../lib/auth";

export function PasswordSupportForm() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [description, setDescription] = useState("");
  const [ownershipAck, setOwnershipAck] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setLoggedIn(Boolean(readAuth()));
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!loggedIn) {
      router.push(`/login?next=${encodeURIComponent("/password-support")}`);
      return;
    }
    if (!ownershipAck) {
      setError("You must acknowledge authorization/ownership before submitting.");
      return;
    }
    if (!brand.trim() || !model.trim() || !description.trim()) {
      setError("Brand, model, and issue details are required.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          requestType: "password",
          subject: `Password support — ${brand} ${model}`,
          brand: brand.trim(),
          model: model.trim(),
          serviceIdentifier: serviceId.trim(),
          description: description.trim(),
          priority: "high",
          ownershipAck: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to submit.");
        return;
      }
      setToast(`✅ Ticket ${data.ticket.ticketNumber} created`);
      setTimeout(() => router.push("/portal/support"), 1000);
    } catch {
      setError("Network error.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form noValidate onSubmit={onSubmit} className="reveal">
      {!loggedIn ? (
        <p className="form-note" style={{ marginBottom: 16 }}>
          You must{" "}
          <Link
            href={`/login?next=${encodeURIComponent("/password-support")}`}
            style={{ color: "var(--accent-cyan)" }}
          >
            sign in
          </Link>{" "}
          to submit a password support ticket.
        </p>
      ) : null}
      <div className="field">
        <label htmlFor="psBrand">Brand</label>
        <input
          id="psBrand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="psModel">Model</label>
        <input
          id="psModel"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="psSvc">Service identifier / serial</label>
        <input
          id="psSvc"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="psDesc">Issue details</label>
        <textarea
          id="psDesc"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
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
          checked={ownershipAck}
          onChange={(e) => setOwnershipAck(e.target.checked)}
          style={{ marginTop: 3 }}
        />
        I confirm I own this device or am authorized by the owner to request
        password/firmware support. Unauthorized requests are prohibited.
      </label>
      {error ? (
        <div className="toast show error" style={{ marginBottom: 12 }}>
          {error}
        </div>
      ) : null}
      {toast ? <div className="toast show">{toast}</div> : null}
      <button
        className="btn btn-primary"
        type="submit"
        style={{ width: "100%" }}
        disabled={pending}
      >
        {pending ? "Submitting…" : "Submit password support request"}
      </button>
      <p className="form-note">
        Prefer the portal?{" "}
        <Link href="/portal/support" style={{ color: "var(--accent-cyan)" }}>
          Open support
        </Link>
      </p>
    </form>
  );
}
