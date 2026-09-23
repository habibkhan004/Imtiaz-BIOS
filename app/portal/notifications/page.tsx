import { NotificationList } from "../../components/portal/NotificationList";
import { PortalPageHeader } from "../../components/portal/ui";

export const metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <>
      <PortalPageHeader
        eyebrow="NOTIFICATIONS"
        title="Alerts & updates"
        description="Request status, support replies, verification results, and billing notices."
      />
      <NotificationList />
    </>
  );
}
