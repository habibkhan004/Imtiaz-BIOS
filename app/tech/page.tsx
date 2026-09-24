import { Suspense } from "react";
import { TechQueueClient } from "./TechQueueClient";

export const metadata = { title: "Assigned Requests" };

export default function TechHomePage() {
  return (
    <Suspense
      fallback={
        <p style={{ color: "var(--text-muted)" }}>Loading queue…</p>
      }
    >
      <TechQueueClient />
    </Suspense>
  );
}
