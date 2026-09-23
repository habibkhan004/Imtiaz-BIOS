import { Suspense } from "react";
import { RequestsClient } from "../../components/portal/RequestForm";
import { PortalPageHeader } from "../../components/portal/ui";

export const metadata = { title: "File Requests" };

export default function RequestsPage() {
  return (
    <>
      <PortalPageHeader
        eyebrow="FILE REQUESTS"
        title="Request missing files"
        description="Ask for BIOS, boardview, schematic, or EC images by board number."
      />
      <Suspense fallback={<p style={{ color: "var(--text-muted)" }}>Loading…</p>}>
        <RequestsClient />
      </Suspense>
    </>
  );
}
