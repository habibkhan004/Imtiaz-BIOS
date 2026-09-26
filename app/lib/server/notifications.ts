import type { Database, Notification } from "../domain/types";
import { now, randomUUID } from "./db";

export function pushNotification(
  db: Database,
  input: Omit<Notification, "id" | "read" | "createdAt"> & { read?: boolean },
): Notification {
  const n: Notification = {
    id: randomUUID(),
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    href: input.href,
    read: input.read ?? false,
    createdAt: now(),
  };
  db.notifications.unshift(n);
  return n;
}
