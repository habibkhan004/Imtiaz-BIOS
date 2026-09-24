import type { AuditLog, Database } from "../domain/types";
import { now, randomUUID } from "./db";

export function writeAudit(
  db: Database,
  input: Omit<AuditLog, "id" | "createdAt">,
): AuditLog {
  const row: AuditLog = {
    id: randomUUID(),
    ...input,
    createdAt: now(),
  };
  db.auditLogs.unshift(row);
  if (db.auditLogs.length > 2000) db.auditLogs.length = 2000;
  return row;
}
