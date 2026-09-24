import { SupportClient } from "../../components/portal/SupportForm";
import { PortalPageHeader } from "../../components/portal/ui";

export const metadata = { title: "Tech Support" };

export default function SupportPage() {
  return (
    <>
      <PortalPageHeader
        eyebrow="TECH SUPPORT"
        title="Technical support requests"
        description="Open tickets for flashing issues, unlocks, and library problems."
      />
      <SupportClient />
    </>
  );
}
