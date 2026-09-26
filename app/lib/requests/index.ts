/** Requests / tickets module barrel — separate from files & services (§24). */
export type {
  FileRequest,
  SupportTicket,
  TicketMessage,
  TicketType,
  RequestStatus,
  TicketStatus,
} from "../domain/types";
export { nextTicketNumber } from "../server/db";
export { pushNotification } from "../server/notifications";
export { writeAudit } from "../server/audit";
