import { UploadForm } from "../../components/portal/UploadForm";
import { PortalPageHeader } from "../../components/portal/ui";

export const metadata = { title: "Upload File" };

export default function UploadsPage() {
  return (
    <>
      <PortalPageHeader
        eyebrow="UPLOADS"
        title="Submit a dump for review"
        description="Share BIOS/boardview files with technicians. Demo stores filename metadata only."
      />
      <UploadForm />
    </>
  );
}
