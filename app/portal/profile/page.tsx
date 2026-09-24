import { ProfileForm } from "../../components/portal/ProfileForm";
import { PortalPageHeader } from "../../components/portal/ui";

export const metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <>
      <PortalPageHeader
        eyebrow="PROFILE"
        title="Your account"
        description="Update shop details, Telegram, and password for this demo session."
      />
      <ProfileForm />
    </>
  );
}
