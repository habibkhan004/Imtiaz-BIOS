import {
  CATEGORIES,
  FILTER_BRANDS,
  LIBRARY_FILES,
  SERVICES,
  type FileType,
} from "./site-data";
import {
  CURRENT_SUBSCRIPTION,
  FILE_REQUESTS,
  PAYMENTS,
  PLANS,
  SUPPORT_TICKETS,
  UPLOADS,
} from "./portal-data";

export type AdminRole = "customer" | "technician" | "admin";
export type UserStatus = "Active" | "Suspended";
export type UploadReviewStatus = "Queued" | "Verified" | "Needs changes" | "Rejected";
export type RequestStatus = "Pending" | "In review" | "Fulfilled" | "Rejected";
export type SupportStatus =
  | "Open"
  | "Waiting on customer"
  | "In progress"
  | "Resolved";
export type SubStatus = "Active" | "Expiring" | "Cancelled" | "None";
export type PaymentStatus = "Paid" | "Failed" | "Refunded";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  company?: string;
  status: UserStatus;
  createdAt: string;
};

export type AdminFile = {
  id: string;
  model: string;
  brand: string;
  type: FileType | string;
  category: string;
  size: string;
  verified: boolean;
  description: string;
  updatedAt: string;
  archived?: boolean;
};

export type AdminUpload = {
  id: string;
  filename: string;
  model: string;
  brand: string;
  type: string;
  uploadedBy: string;
  submittedAt: string;
  status: UploadReviewStatus;
  assignedTech?: string;
  notes: string;
  hexStub: string;
  size: string;
};

export type AdminCategory = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  visible: boolean;
};

export type AdminBrand = {
  name: string;
};

export type AdminService = {
  id: string;
  icon: string;
  title: string;
  desc: string;
  price: string;
  active: boolean;
  sortOrder: number;
};

export type AdminRequest = {
  id: string;
  customerName: string;
  customerEmail: string;
  model: string;
  brand: string;
  typeNeeded: string;
  status: RequestStatus;
  assignedTo: string;
  updatedAt: string;
  notes: string;
  timeline: { at: string; text: string }[];
  adminNote?: string;
};

export type AdminSupportTicket = {
  id: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  model: string;
  priority: "Low" | "Normal" | "High";
  status: SupportStatus;
  assignedTo: string;
  updatedAt: string;
  description: string;
  messages: { at: string; from: "customer" | "support" | "admin"; text: string }[];
  adminNote?: string;
};

export type AdminPlan = {
  id: string;
  name: string;
  price: string;
  features: string[];
  highlight?: boolean;
  active: boolean;
  downloadsLimit: number;
  requestsLimit: number;
};

export type AdminSubscription = {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  planName: string;
  status: SubStatus;
  renewDate: string;
  downloadsUsed: number;
  downloadsLimit: number;
  requestsUsed: number;
  requestsLimit: number;
};

export type AdminPayment = {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  description: string;
  amount: string;
  status: PaymentStatus;
};

export type AdminAuditEvent = {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  detail: string;
};

export type AdminSettings = {
  siteName: string;
  telegramUrl: string;
  contactEmail: string;
  supportHours: string;
  publicRegistration: boolean;
  downloadsRequireLogin: boolean;
  showTestimonials: boolean;
  maxUploadMb: number;
  defaultPlanId: string;
};

export const ADMIN_PROFILE = {
  name: "Imtiaz Admin",
  email: "admin@imtiaz.demo",
};

export const TECHNICIAN_OPTIONS = [
  "Sam Technician",
  "Jordan Flash",
  "Unassigned",
] as const;

export const ADMIN_USERS: AdminUser[] = [
  {
    id: "u-admin",
    name: "Imtiaz Admin",
    email: "admin@imtiaz.demo",
    role: "admin",
    company: "IMTIAZ BIOS",
    status: "Active",
    createdAt: "2025-01-10",
  },
  {
    id: "u-tech",
    name: "Sam Technician",
    email: "tech@imtiaz.demo",
    role: "technician",
    company: "IMTIAZ BIOS",
    status: "Active",
    createdAt: "2025-03-02",
  },
  {
    id: "u-tech2",
    name: "Jordan Flash",
    email: "jordan@imtiaz.tech",
    role: "technician",
    status: "Active",
    createdAt: "2025-06-18",
  },
  {
    id: "u-alex",
    name: "Alex Customer",
    email: "alex@repairshop.demo",
    role: "customer",
    company: "BenchWorks Repair",
    status: "Active",
    createdAt: "2026-01-12",
  },
  {
    id: "u-maya",
    name: "Maya Bench",
    email: "maya@lab.demo",
    role: "customer",
    company: "Lab Bench Co",
    status: "Active",
    createdAt: "2026-02-04",
  },
  {
    id: "u-omar",
    name: "Omar Parts",
    email: "omar@parts.demo",
    role: "customer",
    company: "Parts Desk",
    status: "Active",
    createdAt: "2026-03-21",
  },
  {
    id: "u-chris",
    name: "Chris MacLab",
    email: "chris@maclab.demo",
    role: "customer",
    company: "MacLab",
    status: "Active",
    createdAt: "2026-04-09",
  },
  {
    id: "u-rina",
    name: "Rina Shop",
    email: "rina@shop.demo",
    role: "customer",
    company: "Rina Repair",
    status: "Suspended",
    createdAt: "2026-05-01",
  },
  {
    id: "u-dev",
    name: "Dev Bench",
    email: "dev@bench.demo",
    role: "customer",
    status: "Active",
    createdAt: "2026-06-14",
  },
  {
    id: "u-school",
    name: "School IT",
    email: "it@school.demo",
    role: "customer",
    company: "District IT",
    status: "Active",
    createdAt: "2026-07-02",
  },
  {
    id: "u-guest",
    name: "Guest Tech",
    email: "guest@demo.local",
    role: "customer",
    status: "Active",
    createdAt: "2026-08-19",
  },
  {
    id: "u-nova",
    name: "Nova Board",
    email: "nova@boards.demo",
    role: "customer",
    company: "Nova Boards",
    status: "Active",
    createdAt: "2026-09-01",
  },
];

export const ADMIN_FILES: AdminFile[] = LIBRARY_FILES.map((f, i) => ({
  ...f,
  updatedAt: `2026-09-${String(10 + (i % 12)).padStart(2, "0")}`,
  archived: false,
}));

export const ADMIN_UPLOADS: AdminUpload[] = UPLOADS.map((u, i) => ({
  id: u.id,
  filename: u.filename,
  model: u.model,
  brand: u.brand,
  type: u.type,
  uploadedBy:
    i % 3 === 0 ? "Maya Bench" : i % 3 === 1 ? "Rina Shop" : "Alex Customer",
  submittedAt: u.submittedAt,
  status: u.status,
  assignedTech: u.status === "Queued" ? "Unassigned" : "Sam Technician",
  notes: u.notes,
  size: i % 2 === 0 ? "16 MB" : "8 MB",
  hexStub: `0000: 5A A5 FF FF 00 00 ${u.model.slice(0, 8).padEnd(8, " ")}\n0010: DE AD BE EF ${u.id} CA FE`,
}));

export const ADMIN_CATEGORIES: AdminCategory[] = CATEGORIES.map((c) => ({
  ...c,
  visible: true,
}));

export const ADMIN_BRANDS: AdminBrand[] = FILTER_BRANDS.map((name) => ({ name }));

export const ADMIN_SERVICES: AdminService[] = SERVICES.map((s, i) => ({
  id: `svc-${i + 1}`,
  icon: s.icon,
  title: s.title,
  desc: s.desc,
  price: s.price,
  active: true,
  sortOrder: i + 1,
}));

export const ADMIN_REQUESTS: AdminRequest[] = FILE_REQUESTS.map((r, i) => ({
  id: r.id,
  customerName: ["Alex Customer", "Maya Bench", "Omar Parts", "Guest Tech", "Chris MacLab"][
    i % 5
  ],
  customerEmail: [
    "alex@repairshop.demo",
    "maya@lab.demo",
    "omar@parts.demo",
    "guest@demo.local",
    "chris@maclab.demo",
  ][i % 5],
  model: r.model,
  brand: r.brand,
  typeNeeded: r.typeNeeded,
  status: r.status,
  assignedTo:
    r.status === "Pending"
      ? "Unassigned"
      : i % 2 === 0
        ? "Sam Technician"
        : "Jordan Flash",
  updatedAt: r.updatedAt,
  notes: r.notes,
  timeline: r.timeline,
}));

export const ADMIN_SUPPORT: AdminSupportTicket[] = SUPPORT_TICKETS.map((t, i) => ({
  id: t.id,
  subject: t.subject,
  customerName: ["Alex Customer", "Maya Bench", "Chris MacLab", "Omar Parts"][i % 4],
  customerEmail: [
    "alex@repairshop.demo",
    "maya@lab.demo",
    "chris@maclab.demo",
    "omar@parts.demo",
  ][i % 4],
  model: t.model,
  priority: t.priority,
  status: t.status,
  assignedTo: t.status === "Open" ? "Unassigned" : "Sam Technician",
  updatedAt: t.updatedAt,
  description: t.description,
  messages: t.messages.map((m) => ({
    at: m.at,
    from: m.from === "support" ? ("support" as const) : ("customer" as const),
    text: m.text,
  })),
}));

export const ADMIN_PLANS: AdminPlan[] = PLANS.map((p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  features: p.features,
  highlight: p.highlight,
  active: true,
  downloadsLimit: p.id === "free" ? 3 : p.id === "pro" ? 50 : 9999,
  requestsLimit: p.id === "free" ? 1 : p.id === "pro" ? 10 : 9999,
}));

export const ADMIN_SUBSCRIPTIONS: AdminSubscription[] = [
  {
    id: "sub-alex",
    userId: "u-alex",
    customerName: "Alex Customer",
    customerEmail: "alex@repairshop.demo",
    planId: CURRENT_SUBSCRIPTION.planId,
    planName: CURRENT_SUBSCRIPTION.planName,
    status: "Active",
    renewDate: CURRENT_SUBSCRIPTION.renewDate,
    downloadsUsed: CURRENT_SUBSCRIPTION.downloadsUsed,
    downloadsLimit: CURRENT_SUBSCRIPTION.downloadsLimit,
    requestsUsed: CURRENT_SUBSCRIPTION.requestsUsed,
    requestsLimit: CURRENT_SUBSCRIPTION.requestsLimit,
  },
  {
    id: "sub-maya",
    userId: "u-maya",
    customerName: "Maya Bench",
    customerEmail: "maya@lab.demo",
    planId: "shop",
    planName: "Shop",
    status: "Active",
    renewDate: "2026-10-01",
    downloadsUsed: 120,
    downloadsLimit: 9999,
    requestsUsed: 22,
    requestsLimit: 9999,
  },
  {
    id: "sub-omar",
    userId: "u-omar",
    customerName: "Omar Parts",
    customerEmail: "omar@parts.demo",
    planId: "pro",
    planName: "Pro",
    status: "Expiring",
    renewDate: "2026-09-28",
    downloadsUsed: 41,
    downloadsLimit: 50,
    requestsUsed: 9,
    requestsLimit: 10,
  },
  {
    id: "sub-chris",
    userId: "u-chris",
    customerName: "Chris MacLab",
    customerEmail: "chris@maclab.demo",
    planId: "free",
    planName: "Free",
    status: "Active",
    renewDate: "—",
    downloadsUsed: 2,
    downloadsLimit: 3,
    requestsUsed: 1,
    requestsLimit: 1,
  },
  {
    id: "sub-rina",
    userId: "u-rina",
    customerName: "Rina Shop",
    customerEmail: "rina@shop.demo",
    planId: "pro",
    planName: "Pro",
    status: "Cancelled",
    renewDate: "2026-08-01",
    downloadsUsed: 0,
    downloadsLimit: 50,
    requestsUsed: 0,
    requestsLimit: 10,
  },
  {
    id: "sub-school",
    userId: "u-school",
    customerName: "School IT",
    customerEmail: "it@school.demo",
    planId: "shop",
    planName: "Shop",
    status: "Active",
    renewDate: "2026-11-12",
    downloadsUsed: 340,
    downloadsLimit: 9999,
    requestsUsed: 18,
    requestsLimit: 9999,
  },
  {
    id: "sub-nova",
    userId: "u-nova",
    customerName: "Nova Board",
    customerEmail: "nova@boards.demo",
    planId: "free",
    planName: "Free",
    status: "None",
    renewDate: "—",
    downloadsUsed: 0,
    downloadsLimit: 3,
    requestsUsed: 0,
    requestsLimit: 1,
  },
];

export const ADMIN_PAYMENTS: AdminPayment[] = [
  ...PAYMENTS.map((p, i) => ({
    id: p.id,
    date: p.date,
    customerName: i % 2 === 0 ? "Alex Customer" : "Maya Bench",
    customerEmail: i % 2 === 0 ? "alex@repairshop.demo" : "maya@lab.demo",
    description: p.description,
    amount: p.amount,
    status: p.status,
  })),
  {
    id: "INV-910",
    date: "2026-09-20",
    customerName: "School IT",
    customerEmail: "it@school.demo",
    description: "Shop plan renewal",
    amount: "$79.00",
    status: "Paid",
  },
  {
    id: "INV-912",
    date: "2026-09-21",
    customerName: "Omar Parts",
    customerEmail: "omar@parts.demo",
    description: "Pro plan renewal",
    amount: "$29.00",
    status: "Failed",
  },
];

export const ADMIN_AUDIT_SEED: AdminAuditEvent[] = [
  {
    id: "AUD-1",
    at: "2026-09-22 16:10",
    actor: "Imtiaz Admin",
    action: "settings.save",
    target: "settings",
    detail: "Updated Telegram URL and support hours",
  },
  {
    id: "AUD-2",
    at: "2026-09-22 14:02",
    actor: "Imtiaz Admin",
    action: "upload.approve",
    target: "UP-88",
    detail: "Approved LA-H994P-clean.bin for library",
  },
  {
    id: "AUD-3",
    at: "2026-09-21 19:40",
    actor: "Sam Technician",
    action: "request.status",
    target: "FR-1042",
    detail: "Moved to In review",
  },
  {
    id: "AUD-4",
    at: "2026-09-21 11:05",
    actor: "Imtiaz Admin",
    action: "user.suspend",
    target: "u-rina",
    detail: "Suspended Rina Shop for payment issues",
  },
  {
    id: "AUD-5",
    at: "2026-09-20 09:22",
    actor: "Imtiaz Admin",
    action: "plan.edit",
    target: "pro",
    detail: "Updated Pro download limit to 50",
  },
  {
    id: "AUD-6",
    at: "2026-09-19 17:18",
    actor: "Jordan Flash",
    action: "upload.needs_changes",
    target: "UP-84",
    detail: "Requested full chip re-dump",
  },
  {
    id: "AUD-7",
    at: "2026-09-19 12:00",
    actor: "Imtiaz Admin",
    action: "file.verify",
    target: "la-h994p",
    detail: "Marked LA-H994P verified",
  },
  {
    id: "AUD-8",
    at: "2026-09-18 15:33",
    actor: "Imtiaz Admin",
    action: "subscription.change",
    target: "sub-maya",
    detail: "Upgraded Maya Bench to Shop",
  },
  {
    id: "AUD-9",
    at: "2026-09-18 10:11",
    actor: "Imtiaz Admin",
    action: "payment.refund",
    target: "INV-830",
    detail: "Marked invoice refunded",
  },
  {
    id: "AUD-10",
    at: "2026-09-17 08:45",
    actor: "Imtiaz Admin",
    action: "user.create",
    target: "u-nova",
    detail: "Created customer Nova Board",
  },
  {
    id: "AUD-11",
    at: "2026-09-16 21:02",
    actor: "Sam Technician",
    action: "support.status",
    target: "TS-220",
    detail: "Set In progress",
  },
  {
    id: "AUD-12",
    at: "2026-09-15 13:20",
    actor: "Imtiaz Admin",
    action: "category.edit",
    target: "bios-dumps",
    detail: "Updated BIOS dumps description",
  },
  {
    id: "AUD-13",
    at: "2026-09-14 16:55",
    actor: "Imtiaz Admin",
    action: "brand.add",
    target: "Acer",
    detail: "Added brand Acer",
  },
  {
    id: "AUD-14",
    at: "2026-09-13 09:30",
    actor: "Imtiaz Admin",
    action: "service.edit",
    target: "svc-2",
    detail: "Updated Password Unlocking price copy",
  },
  {
    id: "AUD-15",
    at: "2026-09-12 18:40",
    actor: "Imtiaz Admin",
    action: "request.assign",
    target: "FR-1038",
    detail: "Assigned to Sam Technician",
  },
];

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  siteName: "IMTIAZ BIOS",
  telegramUrl: "https://t.me/IMTIAZBIOS1",
  contactEmail: "support@imtiazbios.demo",
  supportHours: "Sat–Thu 10:00–20:00 GST",
  publicRegistration: true,
  downloadsRequireLogin: false,
  showTestimonials: true,
  maxUploadMb: 32,
  defaultPlanId: "free",
};

export const AUDIT_KEY = "imtiaz-admin-audit";
export const SETTINGS_KEY = "imtiaz-admin-settings";
export const USERS_KEY = "imtiaz-admin-users";
export const FILES_KEY = "imtiaz-admin-files";
export const UPLOADS_KEY = "imtiaz-admin-uploads";
export const CATEGORIES_KEY = "imtiaz-admin-categories";
export const BRANDS_KEY = "imtiaz-admin-brands";
export const SERVICES_KEY = "imtiaz-admin-services";
export const REQUESTS_KEY = "imtiaz-admin-requests";
export const SUPPORT_KEY = "imtiaz-admin-support";
export const PLANS_KEY = "imtiaz-admin-plans";
export const SUBS_KEY = "imtiaz-admin-subs";
export const PAYMENTS_KEY = "imtiaz-admin-payments";

export function getUser(id: string) {
  return ADMIN_USERS.find((u) => u.id === id);
}

export function getFile(id: string) {
  return ADMIN_FILES.find((f) => f.id === id);
}

export function getUpload(id: string) {
  return ADMIN_UPLOADS.find((u) => u.id === id);
}

export function getRequest(id: string) {
  return ADMIN_REQUESTS.find((r) => r.id === id);
}

export function getSupport(id: string) {
  return ADMIN_SUPPORT.find((t) => t.id === id);
}

export function getSubscription(id: string) {
  return ADMIN_SUBSCRIPTIONS.find((s) => s.id === id);
}

export function getDashboardStats() {
  return {
    totalUsers: ADMIN_USERS.length,
    activeSubscriptions: ADMIN_SUBSCRIPTIONS.filter((s) => s.status === "Active")
      .length,
    openFileRequests: ADMIN_REQUESTS.filter(
      (r) => r.status === "Pending" || r.status === "In review",
    ).length,
    openSupportTickets: ADMIN_SUPPORT.filter(
      (t) => t.status !== "Resolved",
    ).length,
    uploadsPending: ADMIN_UPLOADS.filter(
      (u) => u.status === "Queued" || u.status === "Needs changes",
    ).length,
    libraryFiles: ADMIN_FILES.filter((f) => !f.archived).length,
    paidRevenueMtd: "$152.00",
    failedPayments: ADMIN_PAYMENTS.filter((p) => p.status === "Failed").length,
  };
}

export function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function appendAudit(
  partial: Omit<AdminAuditEvent, "id" | "at"> & { at?: string },
) {
  const event: AdminAuditEvent = {
    id: `AUD-${Date.now()}`,
    at: partial.at ?? new Date().toISOString().slice(0, 16).replace("T", " "),
    actor: partial.actor,
    action: partial.action,
    target: partial.target,
    detail: partial.detail,
  };
  const existing = loadJson<AdminAuditEvent[]>(AUDIT_KEY, ADMIN_AUDIT_SEED);
  const next = [event, ...existing];
  saveJson(AUDIT_KEY, next);
  return event;
}

export function getAuditEvents(): AdminAuditEvent[] {
  return loadJson(AUDIT_KEY, ADMIN_AUDIT_SEED);
}

export function reportMetrics(period: "7" | "30" | "90") {
  const mult = period === "7" ? 1 : period === "30" ? 3.2 : 7.5;
  return {
    downloads: [
      { label: "Mon", value: Math.round(12 * mult) },
      { label: "Tue", value: Math.round(18 * mult) },
      { label: "Wed", value: Math.round(9 * mult) },
      { label: "Thu", value: Math.round(22 * mult) },
      { label: "Fri", value: Math.round(15 * mult) },
      { label: "Sat", value: Math.round(7 * mult) },
      { label: "Sun", value: Math.round(5 * mult) },
    ],
    newUsers: Math.round(4 * mult),
    fulfilled: Math.round(11 * mult),
    rejected: Math.round(3 * mult),
    uploadVerified: Math.round(6 * mult),
    uploadNeedsChanges: Math.round(2 * mult),
    uploadRejected: Math.round(1 * mult),
    revenuePaid: `$${(29 * mult).toFixed(0)}.00`,
    revenueFailed: `$${(8 * mult).toFixed(0)}.00`,
  };
}
