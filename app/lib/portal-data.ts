export type RequestStatus = "Pending" | "In review" | "Fulfilled" | "Rejected";
export type SupportStatus =
  | "Open"
  | "Waiting on customer"
  | "In progress"
  | "Resolved";
export type UploadStatus = "Queued" | "Verified" | "Needs changes" | "Rejected";
export type PaymentStatus = "Paid" | "Failed" | "Refunded";
export type SubStatus = "Active" | "Expiring" | "None";

export type CustomerProfile = {
  name: string;
  email: string;
  phone: string;
  company: string;
  telegram: string;
};

export type DownloadRow = {
  id: string;
  fileId: string;
  model: string;
  brand: string;
  type: string;
  downloadedAt: string;
};

export type FileRequest = {
  id: string;
  model: string;
  brand: string;
  typeNeeded: string;
  notes: string;
  status: RequestStatus;
  updatedAt: string;
  timeline: { at: string; text: string }[];
};

export type SupportTicket = {
  id: string;
  subject: string;
  model: string;
  priority: "Low" | "Normal" | "High";
  description: string;
  status: SupportStatus;
  updatedAt: string;
  messages: { at: string; from: "customer" | "support"; text: string }[];
};

export type UploadRow = {
  id: string;
  filename: string;
  model: string;
  brand: string;
  type: string;
  notes: string;
  submittedAt: string;
  status: UploadStatus;
  techNote?: string;
};

export type Plan = {
  id: string;
  name: string;
  price: string;
  features: string[];
  highlight?: boolean;
};

export type Subscription = {
  planId: string;
  planName: string;
  price: string;
  status: SubStatus;
  renewDate: string;
  downloadsUsed: number;
  downloadsLimit: number;
  requestsUsed: number;
  requestsLimit: number;
};

export type PaymentRow = {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: PaymentStatus;
};

export type NotificationItem = {
  id: string;
  type: "request" | "support" | "upload" | "billing" | "system";
  title: string;
  body: string;
  time: string;
  href: string;
  read: boolean;
};

export const CUSTOMER_PROFILE: CustomerProfile = {
  name: "Alex Customer",
  email: "alex@repairshop.demo",
  phone: "+1 555 0142",
  company: "BenchWorks Repair",
  telegram: "@alexbench",
};

export const DOWNLOADS: DownloadRow[] = [
  {
    id: "dl-1",
    fileId: "la-h994p",
    model: "LA-H994P",
    brand: "Dell",
    type: "BIOS bin",
    downloadedAt: "2026-09-20 14:22",
  },
  {
    id: "dl-2",
    fileId: "da0x6tmbaf0",
    model: "DA0X6TMBAF0",
    brand: "HP",
    type: "Boardview",
    downloadedAt: "2026-09-18 09:10",
  },
  {
    id: "dl-3",
    fileId: "nm-b441",
    model: "NM-B441",
    brand: "Lenovo",
    type: "BIOS bin",
    downloadedAt: "2026-09-15 16:44",
  },
  {
    id: "dl-4",
    fileId: "820-01700",
    model: "820-01700",
    brand: "Apple",
    type: "Boardview",
    downloadedAt: "2026-09-12 11:05",
  },
  {
    id: "dl-5",
    fileId: "x910-a1943",
    model: "X910-A1943",
    brand: "Surface",
    type: "BIOS bin",
    downloadedAt: "2026-09-08 19:31",
  },
  {
    id: "dl-6",
    fileId: "edu-c13b",
    model: "EDU-C13B",
    brand: "Chromebook",
    type: "BIOS bin",
    downloadedAt: "2026-09-02 08:17",
  },
];

export const FILE_REQUESTS: FileRequest[] = [
  {
    id: "FR-1042",
    model: "LA-H801P",
    brand: "Dell",
    typeNeeded: "BIOS bin",
    notes: "No power after liquid damage — need clean dump.",
    status: "In review",
    updatedAt: "2026-09-21",
    timeline: [
      { at: "2026-09-19", text: "Request submitted" },
      { at: "2026-09-20", text: "Assigned to technician" },
      { at: "2026-09-21", text: "Searching matching dump" },
    ],
  },
  {
    id: "FR-1038",
    model: "DA0Z8TMB8F0",
    brand: "HP",
    typeNeeded: "Boardview",
    notes: "Need silkscreen labels for U4100 area.",
    status: "Pending",
    updatedAt: "2026-09-20",
    timeline: [{ at: "2026-09-20", text: "Request submitted" }],
  },
  {
    id: "FR-1029",
    model: "NM-C391",
    brand: "Lenovo",
    typeNeeded: "EC firmware",
    notes: "Keyboard backlight stuck on.",
    status: "Fulfilled",
    updatedAt: "2026-09-14",
    timeline: [
      { at: "2026-09-10", text: "Request submitted" },
      { at: "2026-09-12", text: "EC image verified" },
      { at: "2026-09-14", text: "File added to your downloads" },
    ],
  },
  {
    id: "FR-1011",
    model: "UNKNOWN-PCB",
    brand: "Asus",
    typeNeeded: "Schematic",
    notes: "Unreadable stamp — only partial photo.",
    status: "Rejected",
    updatedAt: "2026-09-05",
    timeline: [
      { at: "2026-09-03", text: "Request submitted" },
      { at: "2026-09-05", text: "Rejected — clearer board photo required" },
    ],
  },
  {
    id: "FR-1004",
    model: "LA-F841P",
    brand: "Toshiba",
    typeNeeded: "Schematic",
    notes: "Prefer PDF set if available.",
    status: "Fulfilled",
    updatedAt: "2026-08-28",
    timeline: [
      { at: "2026-08-25", text: "Request submitted" },
      { at: "2026-08-28", text: "Fulfilled from library" },
    ],
  },
];

export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "TS-220",
    subject: "Flash failed — chip ID mismatch",
    model: "LA-H994P",
    priority: "High",
    description: "Programmer reads different ID than dump header.",
    status: "In progress",
    updatedAt: "2026-09-21",
    messages: [
      {
        at: "2026-09-20 10:00",
        from: "customer",
        text: "Tried 25Q64 dump, chip reports 25Q128.",
      },
      {
        at: "2026-09-20 15:20",
        from: "support",
        text: "Please confirm board revision silk and send programmer log.",
      },
      {
        at: "2026-09-21 09:05",
        from: "customer",
        text: "Revision B1. Log attached in Telegram.",
      },
    ],
  },
  {
    id: "TS-214",
    subject: "Password unlock ETA",
    model: "HP EliteBook",
    priority: "Normal",
    description: "Need supervisor password removal timeline.",
    status: "Waiting on customer",
    updatedAt: "2026-09-18",
    messages: [
      {
        at: "2026-09-17",
        from: "customer",
        text: "Opened unlock request yesterday.",
      },
      {
        at: "2026-09-18",
        from: "support",
        text: "Send service tag / serial to proceed.",
      },
    ],
  },
  {
    id: "TS-201",
    subject: "Boardview zoom issue",
    model: "820-01700",
    priority: "Low",
    description: "Viewer freezes on large layers.",
    status: "Resolved",
    updatedAt: "2026-09-10",
    messages: [
      { at: "2026-09-08", from: "customer", text: "Boardview app hangs." },
      {
        at: "2026-09-09",
        from: "support",
        text: "Use desktop viewer build 2.4 — issue fixed.",
      },
      { at: "2026-09-10", from: "customer", text: "Works now. Thanks!" },
    ],
  },
  {
    id: "TS-198",
    subject: "Download link expired",
    model: "NM-B441",
    priority: "Normal",
    description: "Need re-issue of download.",
    status: "Open",
    updatedAt: "2026-09-22",
    messages: [
      {
        at: "2026-09-22",
        from: "customer",
        text: "Link from last week expired.",
      },
    ],
  },
];

export const UPLOADS: UploadRow[] = [
  {
    id: "UP-88",
    filename: "LA-H994P-clean.bin",
    model: "LA-H994P",
    brand: "Dell",
    type: "BIOS bin",
    notes: "Flashed and verified on bench.",
    submittedAt: "2026-09-19",
    status: "Verified",
    techNote: "Accepted into library.",
  },
  {
    id: "UP-84",
    filename: "unknown-dump.bin",
    model: "PARTIAL-READ",
    brand: "Asus",
    type: "BIOS bin",
    notes: "Partial read only.",
    submittedAt: "2026-09-16",
    status: "Needs changes",
    techNote: "Please re-dump full chip size.",
  },
  {
    id: "UP-79",
    filename: "DA0X6-boardview.brd",
    model: "DA0X6TMBAF0",
    brand: "HP",
    type: "Boardview",
    notes: "Community share.",
    submittedAt: "2026-09-11",
    status: "Queued",
  },
  {
    id: "UP-71",
    filename: "bad-header.zip",
    model: "TEST",
    brand: "Other",
    type: "BIOS bin",
    notes: "Test upload",
    submittedAt: "2026-09-01",
    status: "Rejected",
    techNote: "Not a valid SPI image.",
  },
];

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0 / mo",
    features: ["Browse library", "3 downloads / month", "1 file request"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29 / mo",
    highlight: true,
    features: [
      "50 downloads / month",
      "10 file requests",
      "Priority unlock queue",
      "Upload for verification",
    ],
  },
  {
    id: "shop",
    name: "Shop",
    price: "$79 / mo",
    features: [
      "Unlimited downloads",
      "Unlimited requests",
      "3 technician seats",
      "Telegram priority",
    ],
  },
];

export const CURRENT_SUBSCRIPTION: Subscription = {
  planId: "pro",
  planName: "Pro",
  price: "$29 / mo",
  status: "Active",
  renewDate: "2026-10-15",
  downloadsUsed: 18,
  downloadsLimit: 50,
  requestsUsed: 4,
  requestsLimit: 10,
};

export const PAYMENTS: PaymentRow[] = [
  {
    id: "INV-904",
    date: "2026-09-15",
    description: "Pro plan renewal",
    amount: "$29.00",
    status: "Paid",
  },
  {
    id: "INV-881",
    date: "2026-08-15",
    description: "Pro plan renewal",
    amount: "$29.00",
    status: "Paid",
  },
  {
    id: "INV-860",
    date: "2026-07-22",
    description: "Password unlock fee",
    amount: "$15.00",
    status: "Paid",
  },
  {
    id: "INV-842",
    date: "2026-07-15",
    description: "Pro plan renewal",
    amount: "$29.00",
    status: "Failed",
  },
  {
    id: "INV-810",
    date: "2026-06-02",
    description: "Unlock fee refund",
    amount: "-$15.00",
    status: "Refunded",
  },
];

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    type: "request",
    title: "File request In review",
    body: "FR-1042 (LA-H801P) is being checked by a technician.",
    time: "2h ago",
    href: "/portal/requests/FR-1042",
    read: false,
  },
  {
    id: "n2",
    type: "support",
    title: "Support reply on TS-220",
    body: "Please confirm board revision silk and send programmer log.",
    time: "Yesterday",
    href: "/portal/support/TS-220",
    read: false,
  },
  {
    id: "n3",
    type: "upload",
    title: "Upload verified",
    body: "LA-H994P-clean.bin was accepted into the library.",
    time: "2 days ago",
    href: "/portal/uploads/mine",
    read: false,
  },
  {
    id: "n4",
    type: "billing",
    title: "Payment received",
    body: "INV-904 Pro plan renewal — $29.00",
    time: "1 week ago",
    href: "/portal/payments",
    read: true,
  },
  {
    id: "n5",
    type: "request",
    title: "Request fulfilled",
    body: "FR-1029 EC firmware is ready in Downloads.",
    time: "1 week ago",
    href: "/portal/requests/FR-1029",
    read: true,
  },
  {
    id: "n6",
    type: "system",
    title: "Welcome to the portal",
    body: "Browse the library and open file requests anytime.",
    time: "2 weeks ago",
    href: "/portal",
    read: true,
  },
];

export function getDashboardStats() {
  return {
    downloadsThisMonth: 18,
    openFileRequests: FILE_REQUESTS.filter(
      (r) => r.status === "Pending" || r.status === "In review",
    ).length,
    openSupportTickets: SUPPORT_TICKETS.filter(
      (t) => t.status !== "Resolved",
    ).length,
    unreadNotifications: NOTIFICATIONS.filter((n) => !n.read).length,
  };
}

export function getRequest(id: string) {
  return FILE_REQUESTS.find((r) => r.id.toLowerCase() === id.toLowerCase());
}

export function getSupportTicket(id: string) {
  return SUPPORT_TICKETS.find((t) => t.id.toLowerCase() === id.toLowerCase());
}

export function statusTone(status: string): "cyan" | "green" | "gold" | "danger" | "muted" {
  const s = status.toLowerCase();
  if (["fulfilled", "verified", "paid", "resolved", "active"].includes(s))
    return "green";
  if (["pending", "queued", "open", "in review", "in progress"].includes(s))
    return "cyan";
  if (["waiting on customer", "needs changes", "expiring"].includes(s))
    return "gold";
  if (["rejected", "failed", "refunded"].includes(s)) return "danger";
  return "muted";
}

/** Portal localStorage keys */
export const PORTAL_PROFILE_KEY = "imtiaz-portal-profile";
export const PORTAL_REQUESTS_KEY = "imtiaz-portal-requests";
export const PORTAL_SUPPORT_KEY = "imtiaz-portal-support";
export const PORTAL_UPLOADS_KEY = "imtiaz-portal-uploads";
export const PORTAL_SUB_KEY = "imtiaz-portal-subscription";
export const PORTAL_DOWNLOADS_KEY = "imtiaz-portal-downloads";

export function loadPortalJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function savePortalJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadPortalRequests(): FileRequest[] {
  const stored = loadPortalJson<FileRequest[]>(PORTAL_REQUESTS_KEY, []);
  const byId = new Map<string, FileRequest>();
  for (const r of FILE_REQUESTS) byId.set(r.id, r);
  for (const r of stored) byId.set(r.id, r);
  return Array.from(byId.values()).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function findPortalRequest(id: string): FileRequest | undefined {
  return loadPortalRequests().find(
    (r) => r.id.toLowerCase() === id.toLowerCase(),
  );
}

export function loadPortalSupport(): SupportTicket[] {
  const stored = loadPortalJson<SupportTicket[]>(PORTAL_SUPPORT_KEY, []);
  const byId = new Map<string, SupportTicket>();
  for (const t of SUPPORT_TICKETS) byId.set(t.id, t);
  for (const t of stored) byId.set(t.id, t);
  return Array.from(byId.values()).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function findPortalSupport(id: string): SupportTicket | undefined {
  return loadPortalSupport().find(
    (t) => t.id.toLowerCase() === id.toLowerCase(),
  );
}

export function savePortalSupportList(list: SupportTicket[]) {
  savePortalJson(PORTAL_SUPPORT_KEY, list);
}

export function loadPortalSubscription(): Subscription {
  return loadPortalJson(PORTAL_SUB_KEY, CURRENT_SUBSCRIPTION);
}

export function savePortalSubscription(sub: Subscription) {
  savePortalJson(PORTAL_SUB_KEY, sub);
}

/** Entitled download history (seed + local additions). */
export function loadPortalDownloads(): DownloadRow[] {
  const stored = loadPortalJson<DownloadRow[]>(PORTAL_DOWNLOADS_KEY, []);
  const byId = new Map<string, DownloadRow>();
  for (const d of DOWNLOADS) byId.set(d.id, d);
  for (const d of stored) byId.set(d.id, d);
  return Array.from(byId.values());
}

export function recordPortalDownload(row: Omit<DownloadRow, "id" | "downloadedAt">) {
  const list = loadPortalDownloads();
  const entry: DownloadRow = {
    id: `dl-${Date.now()}`,
    downloadedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    ...row,
  };
  savePortalJson(PORTAL_DOWNLOADS_KEY, [entry, ...list.filter((d) => d.fileId !== row.fileId)]);
  return entry;
}

export function isDownloadEntitled(fileId: string): boolean {
  return loadPortalDownloads().some((d) => d.fileId === fileId);
}
