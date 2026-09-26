/** Shared domain models for IMTIAZ BIOS SRS (FR-01…27 + §6–15). */

export type Role = "USER" | "TECHNICIAN" | "ADMIN";
/** Client-facing role aliases used by existing shells. */
export type ClientRole = "customer" | "technician" | "admin";

export type UserStatus = "Active" | "Suspended";
export type FilePublishStatus =
  | "draft"
  | "pending"
  | "published"
  | "unpublished"
  | "archived";
export type VerificationStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "needs_testing";
export type AccessType = "free" | "paid";
export type UploadStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "needs_info";
export type RequestStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "needs_info"
  | "completed"
  | "closed"
  | "rejected";
export type TicketType = "technical" | "password" | "contact" | "general" | "file_request";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketStatus =
  | "pending"
  | "open"
  | "assigned"
  | "in_progress"
  | "waiting_customer"
  | "resolved"
  | "closed";
export type SubStatus = "active" | "expired" | "cancelled" | "pending";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  country?: string;
  role: Role;
  status: UserStatus;
  trialStartDate: string;
  trialEndDate: string;
  subscriptionId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentCategory?: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  active: boolean;
  createdAt: string;
};

export type FileAsset = {
  id: string;
  name: string;
  originalName: string;
  storageKey: string;
  categoryId: string;
  brandId: string;
  boardNumber: string;
  modelNumber: string;
  fileType: string;
  version: string;
  sizeBytes: number;
  description: string;
  compatibility: string;
  tags: string[];
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  status: FilePublishStatus;
  accessType: AccessType;
  price: number;
  uploaderId: string;
  downloadCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type FileVersion = {
  id: string;
  fileAssetId: string;
  version: string;
  changelog?: string;
  sizeBytes: number;
  storageKey: string;
  createdAt: string;
  createdBy: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  features: string[];
  active: boolean;
  createdAt: string;
};

export type UserSubscription = {
  id: string;
  userId: string;
  planId: string;
  status: SubStatus;
  startsAt: string;
  endsAt: string;
  paymentId?: string;
  createdAt: string;
};

export type UploadSubmission = {
  id: string;
  userId: string;
  originalName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  categoryId: string;
  brandId: string;
  boardNumber: string;
  modelNumber: string;
  fileType: string;
  version: string;
  description: string;
  notes: string;
  status: UploadStatus;
  reviewerId?: string;
  reviewNote?: string;
  publishedFileId?: string;
  createdAt: string;
  updatedAt: string;
};

export type FileRequest = {
  id: string;
  requestNumber: string;
  userId: string;
  boardModel: string;
  brand: string;
  typeNeeded: string;
  description: string;
  attachments: string[];
  status: RequestStatus;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
};

export type SupportTicket = {
  id: string;
  ticketNumber: string;
  type: TicketType;
  userId?: string;
  subject: string;
  brand?: string;
  model?: string;
  boardNumber?: string;
  serviceIdentifier?: string;
  symptoms?: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assigneeId?: string;
  ownershipAck?: boolean;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
};

export type TicketMessage = {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  attachment?: string;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: string;
};

export type DownloadEvent = {
  id: string;
  userId: string;
  fileId: string;
  versionId?: string;
  at: string;
  ip?: string;
  ua?: string;
  result: "success" | "denied" | "error";
};

export type Payment = {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  status: PaymentStatus;
  purpose: string;
  createdAt: string;
};

export type ServiceItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  active: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PasswordResetToken = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  before?: string;
  after?: string;
  createdAt: string;
};

export type PlatformSettings = {
  introEnabled: boolean;
  introDurationDays: number;
  introCoversAccessTypes: AccessType[];
  introCategoryIds: string[];
  maxUploadBytes: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
};

export type Database = {
  users: User[];
  categories: Category[];
  brands: Brand[];
  files: FileAsset[];
  fileVersions: FileVersion[];
  plans: SubscriptionPlan[];
  subscriptions: UserSubscription[];
  uploads: UploadSubmission[];
  requests: FileRequest[];
  tickets: SupportTicket[];
  messages: TicketMessage[];
  notifications: Notification[];
  downloads: DownloadEvent[];
  payments: Payment[];
  services: ServiceItem[];
  resetTokens: PasswordResetToken[];
  auditLogs: AuditLog[];
  settings: PlatformSettings;
};

export function toClientRole(role: Role): ClientRole {
  if (role === "ADMIN") return "admin";
  if (role === "TECHNICIAN") return "technician";
  return "customer";
}

export function fromClientRole(role: ClientRole | Role): Role {
  if (role === "admin" || role === "ADMIN") return "ADMIN";
  if (role === "technician" || role === "TECHNICIAN") return "TECHNICIAN";
  return "USER";
}

export function homeForRole(role: Role | ClientRole): string {
  const r = fromClientRole(role as ClientRole);
  if (r === "ADMIN") return "/admin";
  if (r === "TECHNICIAN") return "/tech";
  return "/portal";
}
