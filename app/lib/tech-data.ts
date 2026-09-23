export type TechRequestType = "file_request" | "support" | "upload";
export type TechPriority = "Low" | "Normal" | "High";

export type TechStatus =
  | "Pending"
  | "In review"
  | "Fulfilled"
  | "Rejected"
  | "Open"
  | "Waiting on customer"
  | "In progress"
  | "Resolved"
  | "Queued"
  | "Verified"
  | "Needs changes";

export type TechAssignedRequest = {
  id: string;
  type: TechRequestType;
  model: string;
  brand: string;
  customerName: string;
  customerEmail: string;
  priority: TechPriority;
  status: TechStatus;
  updatedAt: string;
  snippet: string;
  customerNotes: string;
  attachments: { name: string; size: string }[];
  timeline: { at: string; text: string }[];
  typeNeeded?: string;
  subject?: string;
};

export type VerificationItem = {
  id: string;
  requestId: string;
  filename: string;
  size: string;
  model: string;
  brand: string;
  type: string;
  uploadedBy: string;
  submittedAt: string;
  hexStub: string;
  status: "Queued" | "Verified" | "Needs changes" | "Rejected";
};

export type TechNote = {
  id: string;
  requestId: string;
  body: string;
  visibility: "Internal" | "Customer-visible";
  author: string;
  at: string;
};

export type TechMessage = {
  id: string;
  requestId: string;
  from: "customer" | "technician" | "system";
  text: string;
  at: string;
};

export const TECH_PROFILE = {
  name: "Sam Technician",
  email: "tech@imtiaz.demo",
};

export const ASSIGNED_REQUESTS: TechAssignedRequest[] = [
  {
    id: "TR-2401",
    type: "file_request",
    model: "LA-H994P",
    brand: "Dell",
    customerName: "Alex Customer",
    customerEmail: "alex@repairshop.demo",
    priority: "High",
    status: "In review",
    updatedAt: "2026-09-22 16:40",
    snippet: "Need clean BIOS for no-POST board",
    customerNotes:
      "Board powers, no display. Looking for a known-good BIOS bin for LA-H994P rev 1.0.",
    typeNeeded: "BIOS bin",
    attachments: [{ name: "board_photo.jpg", size: "1.2 MB" }],
    timeline: [
      { at: "2026-09-20 09:12", text: "Request submitted by customer" },
      { at: "2026-09-21 11:05", text: "Assigned to technician" },
      { at: "2026-09-22 16:40", text: "Moved to In review" },
    ],
  },
  {
    id: "TR-2402",
    type: "upload",
    model: "DA0X6TMBAF0",
    brand: "HP",
    customerName: "Maya Bench",
    customerEmail: "maya@lab.demo",
    priority: "Normal",
    status: "Queued",
    updatedAt: "2026-09-22 14:10",
    snippet: "Customer dump awaiting verification",
    customerNotes: "Dumped with CH341A. Chip marked 25Q128.",
    attachments: [{ name: "DA0X6TMBAF0.bin", size: "16 MB" }],
    timeline: [
      { at: "2026-09-22 10:02", text: "Upload received" },
      { at: "2026-09-22 14:10", text: "Queued for verification" },
    ],
  },
  {
    id: "TR-2403",
    type: "support",
    model: "NM-B441",
    brand: "Lenovo",
    customerName: "Omar Parts",
    customerEmail: "omar@parts.demo",
    priority: "High",
    status: "Waiting on customer",
    updatedAt: "2026-09-21 18:22",
    snippet: "Short on 3V rail after BIOS write",
    subject: "3V short after flash",
    customerNotes:
      "After writing BIOS, 3V coil heats. Need guidance before another attempt.",
    attachments: [{ name: "multimeter_notes.txt", size: "4 KB" }],
    timeline: [
      { at: "2026-09-19 08:40", text: "Ticket opened" },
      { at: "2026-09-20 13:15", text: "In progress — asked for photos" },
      { at: "2026-09-21 18:22", text: "Waiting on customer" },
    ],
  },
  {
    id: "TR-2404",
    type: "file_request",
    model: "820-01700",
    brand: "Apple",
    customerName: "Chris MacLab",
    customerEmail: "chris@maclab.demo",
    priority: "Normal",
    status: "Pending",
    updatedAt: "2026-09-21 12:00",
    snippet: "Schematic request for T2 board",
    typeNeeded: "Schematic",
    customerNotes: "Need schematic PDF/WRL for water damage map.",
    attachments: [],
    timeline: [{ at: "2026-09-21 12:00", text: "Request submitted" }],
  },
  {
    id: "TR-2405",
    type: "upload",
    model: "NM-C391",
    brand: "Lenovo",
    customerName: "Rina Shop",
    customerEmail: "rina@shop.demo",
    priority: "Low",
    status: "Needs changes",
    updatedAt: "2026-09-20 17:45",
    snippet: "Dump size looks short",
    customerNotes: "Second attempt after previous reject.",
    attachments: [{ name: "NM-C391_partial.bin", size: "4 MB" }],
    timeline: [
      { at: "2026-09-18 09:00", text: "Upload received" },
      { at: "2026-09-19 11:30", text: "Needs changes — size short" },
      { at: "2026-09-20 17:45", text: "Customer re-uploaded" },
    ],
  },
  {
    id: "TR-2406",
    type: "support",
    model: "LA-F841P",
    brand: "Dell",
    customerName: "Alex Customer",
    customerEmail: "alex@repairshop.demo",
    priority: "Normal",
    status: "In progress",
    updatedAt: "2026-09-22 09:30",
    subject: "EC programming steps",
    snippet: "How to program EC after ME clean",
    customerNotes: "Have SOIC clip. Need wire map and erase sequence.",
    attachments: [],
    timeline: [
      { at: "2026-09-21 15:00", text: "Ticket opened" },
      { at: "2026-09-22 09:30", text: "In progress" },
    ],
  },
  {
    id: "TR-2407",
    type: "file_request",
    model: "X910-A1943",
    brand: "ASUS",
    customerName: "Dev Bench",
    customerEmail: "dev@bench.demo",
    priority: "Low",
    status: "Fulfilled",
    updatedAt: "2026-09-18 20:05",
    snippet: "Boardview delivered to library",
    typeNeeded: "Boardview",
    customerNotes: "Any boardview for X910 series.",
    attachments: [],
    timeline: [
      { at: "2026-09-15 10:00", text: "Request submitted" },
      { at: "2026-09-17 14:20", text: "In review" },
      { at: "2026-09-18 20:05", text: "Fulfilled — published to library" },
    ],
  },
  {
    id: "TR-2408",
    type: "upload",
    model: "EDU-C13B",
    brand: "Acer",
    customerName: "School IT",
    customerEmail: "it@school.demo",
    priority: "Normal",
    status: "Queued",
    updatedAt: "2026-09-22 11:18",
    snippet: "Education fleet dump",
    customerNotes: "Bulk fleet board — please check ME region.",
    attachments: [
      { name: "EDU-C13B.bin", size: "8 MB" },
      { name: "label.jpg", size: "820 KB" },
    ],
    timeline: [{ at: "2026-09-22 11:18", text: "Upload queued" }],
  },
  {
    id: "TR-2409",
    type: "file_request",
    model: "UNKNOWN-PCB",
    brand: "Other",
    customerName: "Guest Tech",
    customerEmail: "guest@demo.local",
    priority: "High",
    status: "Rejected",
    updatedAt: "2026-09-17 08:50",
    snippet: "No identifiable board number",
    typeNeeded: "BIOS bin",
    customerNotes: "Cannot read silkscreen. Need ID help.",
    attachments: [{ name: "blurry.jpg", size: "600 KB" }],
    timeline: [
      { at: "2026-09-16 19:00", text: "Request submitted" },
      { at: "2026-09-17 08:50", text: "Rejected — insufficient board ID" },
    ],
  },
  {
    id: "TR-2410",
    type: "support",
    model: "DA0ZAUMB6F0",
    brand: "HP",
    customerName: "Maya Bench",
    customerEmail: "maya@lab.demo",
    priority: "Low",
    status: "Open",
    updatedAt: "2026-09-22 08:05",
    subject: "SPI voltage question",
    snippet: "1.8V vs 3.3V clip safety",
    customerNotes: "Confirm clip voltage before dump.",
    attachments: [],
    timeline: [{ at: "2026-09-22 08:05", text: "Ticket opened" }],
  },
  {
    id: "TR-2411",
    type: "file_request",
    model: "LA-H801P",
    brand: "Dell",
    customerName: "Omar Parts",
    customerEmail: "omar@parts.demo",
    priority: "Normal",
    status: "In review",
    updatedAt: "2026-09-21 16:00",
    snippet: "EC firmware request",
    typeNeeded: "EC firmware",
    customerNotes: "Need EC only, BIOS already good.",
    attachments: [],
    timeline: [
      { at: "2026-09-20 12:30", text: "Request submitted" },
      { at: "2026-09-21 16:00", text: "In review" },
    ],
  },
  {
    id: "TR-2412",
    type: "upload",
    model: "PARTIAL-READ",
    brand: "Other",
    customerName: "Rina Shop",
    customerEmail: "rina@shop.demo",
    priority: "High",
    status: "Queued",
    updatedAt: "2026-09-22 15:55",
    snippet: "Interrupted dump — verify integrity",
    customerNotes: "Programmer disconnected mid-read.",
    attachments: [{ name: "interrupted.bin", size: "2.1 MB" }],
    timeline: [{ at: "2026-09-22 15:55", text: "Queued for verification" }],
  },
];

export const VERIFICATION_QUEUE: VerificationItem[] = [
  {
    id: "VF-2402",
    requestId: "TR-2402",
    filename: "DA0X6TMBAF0.bin",
    size: "16 MB",
    model: "DA0X6TMBAF0",
    brand: "HP",
    type: "BIOS bin",
    uploadedBy: "Maya Bench",
    submittedAt: "2026-09-22 10:02",
    hexStub:
      "0000: 5A A5 5A A5 FF FF FF FF  00 00 00 00 46 57 48 50\n0010: 44 41 30 58 36 54 4D 42  41 46 30 00 00 00 00 00",
    status: "Queued",
  },
  {
    id: "VF-2405",
    requestId: "TR-2405",
    filename: "NM-C391_partial.bin",
    size: "4 MB",
    model: "NM-C391",
    brand: "Lenovo",
    type: "BIOS bin",
    uploadedBy: "Rina Shop",
    submittedAt: "2026-09-20 17:40",
    hexStub:
      "0000: FF FF FF FF FF FF FF FF  FF FF FF FF FF FF FF FF\n0010: 00 00 DE AD BE EF 00 00  4E 4D 2D 43 33 39 31 00",
    status: "Needs changes",
  },
  {
    id: "VF-2408",
    requestId: "TR-2408",
    filename: "EDU-C13B.bin",
    size: "8 MB",
    model: "EDU-C13B",
    brand: "Acer",
    type: "BIOS bin",
    uploadedBy: "School IT",
    submittedAt: "2026-09-22 11:18",
    hexStub:
      "0000: 24 46 49 46 00 00 00 00  45 44 55 2D 43 31 33 42\n0010: 4D 45 20 72 65 67 69 6F  6E 20 70 6C 61 63 65 68",
    status: "Queued",
  },
  {
    id: "VF-2412",
    requestId: "TR-2412",
    filename: "interrupted.bin",
    size: "2.1 MB",
    model: "PARTIAL-READ",
    brand: "Other",
    type: "BIOS bin",
    uploadedBy: "Rina Shop",
    submittedAt: "2026-09-22 15:55",
    hexStub:
      "0000: FF FF FF FF 00 00 00 00  FF FF 00 FF DE AD C0 DE\n0010: ?? ?? ?? ?? ?? ?? ?? ??  (truncated / incomplete read)",
    status: "Queued",
  },
];

export const TECH_NOTES: TechNote[] = [
  {
    id: "TN-1",
    requestId: "TR-2401",
    body: "Library has LA-H994P rev1 verified dump. Confirm customer board revision from photo.",
    visibility: "Internal",
    author: "Sam Technician",
    at: "2026-09-22 16:42",
  },
  {
    id: "TN-2",
    requestId: "TR-2403",
    body: "Asked customer for clear coil photo and resistance to GND on 3V rail.",
    visibility: "Customer-visible",
    author: "Sam Technician",
    at: "2026-09-21 18:20",
  },
  {
    id: "TN-3",
    requestId: "TR-2405",
    body: "Expected 16MB; received 4MB. Likely incomplete SPI read.",
    visibility: "Internal",
    author: "Sam Technician",
    at: "2026-09-19 11:28",
  },
];

export const TECH_MESSAGES: TechMessage[] = [
  {
    id: "TM-1",
    requestId: "TR-2401",
    from: "customer",
    text: "Hi — board is LA-H994P, no POST after CMOS clear. Can you fulfill BIOS?",
    at: "2026-09-20 09:15",
  },
  {
    id: "TM-2",
    requestId: "TR-2401",
    from: "technician",
    text: "Thanks. Please confirm silk revision (1.0 vs 1.1) from the corner of the board.",
    at: "2026-09-21 11:10",
  },
  {
    id: "TM-3",
    requestId: "TR-2401",
    from: "customer",
    text: "Looks like rev 1.0 — photo attached in the request.",
    at: "2026-09-22 08:00",
  },
  {
    id: "TM-4",
    requestId: "TR-2403",
    from: "technician",
    text: "Please measure resistance on the 3V coil to ground with power off and share the reading.",
    at: "2026-09-21 18:22",
  },
  {
    id: "TM-5",
    requestId: "TR-2403",
    from: "customer",
    text: "Will check tonight and reply.",
    at: "2026-09-21 19:01",
  },
  {
    id: "TM-6",
    requestId: "TR-2406",
    from: "customer",
    text: "Need the EC pinout for SOIC clip programming after ME clean.",
    at: "2026-09-21 15:05",
  },
];

export function getAssignedRequest(id: string) {
  return ASSIGNED_REQUESTS.find((r) => r.id === id);
}

export function getVerificationItem(id: string) {
  return (
    VERIFICATION_QUEUE.find((v) => v.id === id || v.requestId === id) ??
    undefined
  );
}

export function getNotes(requestId: string) {
  return TECH_NOTES.filter((n) => n.requestId === requestId).sort((a, b) =>
    a.at.localeCompare(b.at),
  );
}

export function getMessages(requestId: string) {
  return TECH_MESSAGES.filter((m) => m.requestId === requestId).sort((a, b) =>
    a.at.localeCompare(b.at),
  );
}

/** localStorage keys for technician demo mutations */
export const TECH_REQUESTS_KEY = "imtiaz-tech-requests";
export const TECH_VERIFICATIONS_KEY = "imtiaz-tech-verifications";
export const TECH_REVIEWS_KEY = "imtiaz-tech-reviews";
export const TECH_CHANGE_EVENT = "imtiaz-tech-change";

function notesKey(id: string) {
  return `imtiaz-tech-notes-${id}`;
}

function messagesKey(id: string) {
  return `imtiaz-tech-messages-${id}`;
}

function emitTechChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(TECH_CHANGE_EVENT));
}

function nowStamp() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

function readRequestPatches(): Record<string, Partial<TechAssignedRequest>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TECH_REQUESTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, Partial<TechAssignedRequest>>;
  } catch {
    return {};
  }
}

/** Seed requests merged with localStorage status/timeline patches (client). */
export function loadAssignedRequests(): TechAssignedRequest[] {
  const patches = readRequestPatches();
  return ASSIGNED_REQUESTS.map((r) => {
    const p = patches[r.id];
    if (!p) return r;
    return {
      ...r,
      ...p,
      attachments: p.attachments ?? r.attachments,
      timeline: p.timeline ?? r.timeline,
    };
  });
}

export function loadAssignedRequest(id: string): TechAssignedRequest | undefined {
  return loadAssignedRequests().find((r) => r.id === id);
}

export function patchAssignedRequest(
  id: string,
  patch: Partial<TechAssignedRequest>,
) {
  if (typeof window === "undefined") return;
  const map = readRequestPatches();
  const prev = map[id] ?? {};
  map[id] = {
    ...prev,
    ...patch,
    timeline: patch.timeline ?? prev.timeline,
  };
  localStorage.setItem(TECH_REQUESTS_KEY, JSON.stringify(map));
  emitTechChange();
}

export function appendRequestTimeline(id: string, text: string) {
  const current = loadAssignedRequest(id);
  if (!current) return;
  const at = nowStamp();
  patchAssignedRequest(id, {
    updatedAt: at,
    timeline: [...current.timeline, { at, text }],
  });
}

export function loadVerificationItem(id: string): VerificationItem | undefined {
  const seed = getVerificationItem(id);
  if (!seed) return undefined;
  if (typeof window === "undefined") {
    const req = loadAssignedRequest(seed.requestId);
    if (req && ["Verified", "Needs changes", "Rejected", "Queued"].includes(req.status)) {
      return { ...seed, status: req.status as VerificationItem["status"] };
    }
    return seed;
  }
  try {
    const raw = localStorage.getItem(TECH_VERIFICATIONS_KEY);
    if (raw) {
      const map = JSON.parse(raw) as Record<
        string,
        { result?: VerificationItem["status"] }
      >;
      const saved = map[seed.requestId] ?? map[seed.id];
      if (saved?.result) return { ...seed, status: saved.result };
    }
  } catch {
    /* ignore */
  }
  const req = loadAssignedRequest(seed.requestId);
  if (req && ["Verified", "Needs changes", "Rejected", "Queued"].includes(req.status)) {
    return { ...seed, status: req.status as VerificationItem["status"] };
  }
  return seed;
}

export function saveVerificationResult(
  requestId: string,
  result: VerificationItem["status"],
  extra: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(TECH_VERIFICATIONS_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    map[requestId] = { ...extra, result, at: new Date().toISOString() };
    localStorage.setItem(TECH_VERIFICATIONS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
  const at = nowStamp();
  const current = loadAssignedRequest(requestId);
  const timeline = [
    ...(current?.timeline ?? []),
    { at, text: `Verification → ${result}` },
  ];
  patchAssignedRequest(requestId, {
    status: result,
    updatedAt: at,
    timeline,
  });
}

export function saveReview(
  requestId: string,
  payload: Record<string, unknown>,
  recommendedStatus?: TechStatus,
) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(TECH_REVIEWS_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    map[requestId] = { ...payload, recommendedStatus, at: new Date().toISOString() };
    localStorage.setItem(TECH_REVIEWS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
  const at = nowStamp();
  const current = loadAssignedRequest(requestId);
  const assessment = String(payload.assessment ?? "Review");
  const timeline = [
    ...(current?.timeline ?? []),
    {
      at,
      text: recommendedStatus
        ? `Review saved (${assessment}). Recommended: ${recommendedStatus}`
        : `Review saved (${assessment})`,
    },
  ];
  const nextStatus =
    current &&
    (current.status === "Pending" || current.status === "Open" || current.status === "Queued")
      ? ("In review" as TechStatus)
      : current?.status;
  patchAssignedRequest(requestId, {
    ...(nextStatus && nextStatus !== current?.status ? { status: nextStatus } : {}),
    updatedAt: at,
    timeline,
  });
}

/** Merge seed + localStorage notes (client). */
export function loadNotes(requestId: string): TechNote[] {
  const seed = getNotes(requestId);
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(notesKey(requestId));
    if (!raw) return seed;
    const stored = JSON.parse(raw) as TechNote[];
    const byId = new Map<string, TechNote>();
    for (const n of seed) byId.set(n.id, n);
    for (const n of stored) byId.set(n.id, n);
    return Array.from(byId.values()).sort((a, b) => a.at.localeCompare(b.at));
  } catch {
    return seed;
  }
}

export function saveNotes(requestId: string, notes: TechNote[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(notesKey(requestId), JSON.stringify(notes));
    emitTechChange();
  } catch {
    /* ignore */
  }
}

/** Merge seed + localStorage messages (client). */
export function loadMessages(requestId: string): TechMessage[] {
  const seed = getMessages(requestId);
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(messagesKey(requestId));
    if (!raw) return seed;
    const stored = JSON.parse(raw) as TechMessage[];
    const byId = new Map<string, TechMessage>();
    for (const m of seed) byId.set(m.id, m);
    for (const m of stored) byId.set(m.id, m);
    return Array.from(byId.values()).sort((a, b) => a.at.localeCompare(b.at));
  } catch {
    return seed;
  }
}

export function saveMessages(requestId: string, messages: TechMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(messagesKey(requestId), JSON.stringify(messages));
    emitTechChange();
  } catch {
    /* ignore */
  }
}

export function appendSystemMessage(requestId: string, text: string) {
  const at = nowStamp();
  const next = [
    ...loadMessages(requestId),
    {
      id: `TM-${Date.now()}`,
      requestId,
      from: "system" as const,
      text,
      at,
    },
  ];
  saveMessages(requestId, next);
}

export function getTechQueueStats(rows?: TechAssignedRequest[]) {
  const list =
    rows ??
    (typeof window !== "undefined" ? loadAssignedRequests() : ASSIGNED_REQUESTS);
  const openStatuses: TechStatus[] = [
    "Pending",
    "Open",
    "Queued",
    "In review",
    "In progress",
    "Waiting on customer",
    "Needs changes",
  ];
  return {
    assignedOpen: list.filter((r) => openStatuses.includes(r.status)).length,
    inReview: list.filter(
      (r) => r.status === "In review" || r.status === "In progress",
    ).length,
    awaitingCustomer: list.filter((r) => r.status === "Waiting on customer")
      .length,
    verificationsPending: list.filter(
      (r) =>
        r.type === "upload" &&
        (r.status === "Queued" || r.status === "Needs changes"),
    ).length,
  };
}

export function typeLabel(type: TechRequestType) {
  if (type === "file_request") return "File request";
  if (type === "support") return "Support";
  return "Upload verification";
}

export function allowedStatuses(type: TechRequestType): TechStatus[] {
  if (type === "file_request") {
    return ["Pending", "In review", "Fulfilled", "Rejected"];
  }
  if (type === "support") {
    return ["Open", "In progress", "Waiting on customer", "Resolved"];
  }
  return ["Queued", "Verified", "Needs changes", "Rejected"];
}

export function unreadMessageCount(techName = TECH_PROFILE.name) {
  const openIds = new Set(
    (typeof window !== "undefined" ? loadAssignedRequests() : ASSIGNED_REQUESTS)
      .filter(
        (r) =>
          !["Fulfilled", "Resolved", "Rejected", "Verified"].includes(r.status),
      )
      .map((r) => r.id),
  );
  let count = 0;
  for (const id of openIds) {
    const msgs =
      typeof window !== "undefined" ? loadMessages(id) : getMessages(id);
    const last = msgs[msgs.length - 1];
    if (last?.from === "customer") count += 1;
  }
  void techName;
  return count;
}
