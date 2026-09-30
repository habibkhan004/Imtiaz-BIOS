import { randomUUID } from "crypto";
import type {
  Brand,
  Category,
  Database,
  FileAsset,
  PlatformSettings,
  Role,
  ServiceItem,
  SubscriptionPlan,
  User,
} from "../domain/types";
import { hashPassword } from "./password";
import { ALLOWED_EXTENSIONS_DEFAULT, ALLOWED_MIME_DEFAULT } from "./file-storage";
import { prisma } from "./prisma";
import { loadDatabaseFromMysql, persistDatabaseToMysql } from "./prisma-store";

let memory: Database | null = null;
let writeChain: Promise<void> = Promise.resolve();
let backend: "mysql" | null = null;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function now(): string {
  return new Date().toISOString();
}

async function seed(): Promise<Database> {
  const ts = now();
  const introDays = Number(process.env.INTRO_DURATION_DAYS || 183);

  const categories: Category[] = [
    "BIOS/Firmware",
    "Boardview",
    "Schematics",
    "Service Manuals",
    "Recovery Software",
    "Diagnostic Tools",
    "Other",
  ].map((name, i) => ({
    id: randomUUID(),
    name,
    slug: slugify(name),
    description: `${name} resources`,
    active: true,
    sortOrder: i + 1,
    createdAt: ts,
  }));

  const brandNames = [
    "Dell",
    "HP",
    "Lenovo",
    "Toshiba",
    "Microsoft Surface",
    "Apple",
    "Asus",
    "Acer",
    "Chromebook",
    "Other",
  ];
  const brands: Brand[] = brandNames.map((name) => ({
    id: randomUUID(),
    name,
    slug: slugify(name),
    description: name,
    active: true,
    createdAt: ts,
  }));

  const adminHash = await hashPassword("Admin123!");
  const techHash = await hashPassword("Tech123!");
  const userHash = await hashPassword("User123!");

  const mkUser = (
    name: string,
    email: string,
    role: Role,
    hash: string,
  ): User => {
    const start = ts;
    const end = new Date(Date.now() + introDays * 86400000).toISOString();
    return {
      id: randomUUID(),
      name,
      email,
      passwordHash: hash,
      phone: "",
      country: "",
      role,
      status: "Active",
      trialStartDate: start,
      trialEndDate: end,
      createdAt: ts,
      updatedAt: ts,
    };
  };

  const users: User[] = [
    mkUser("Platform Admin", "admin@imtiazbios.local", "ADMIN", adminHash),
    mkUser("Lead Technician", "tech@imtiazbios.local", "TECHNICIAN", techHash),
    mkUser("Demo Customer", "user@imtiazbios.local", "USER", userHash),
  ];

  const biosCat = categories[0];
  const dell = brands[0];
  const files: FileAsset[] = [
    {
      id: randomUUID(),
      name: "Latitude 5490 BIOS A18",
      originalName: "latitude-5490-a18.bin",
      storageKey: "seed-demo-no-binary",
      categoryId: biosCat.id,
      brandId: dell.id,
      boardNumber: "LA-F401P",
      modelNumber: "Latitude 5490",
      fileType: "BIOS",
      version: "A18",
      sizeBytes: 16_777_216,
      description: "Official Dell Latitude 5490 BIOS dump A18.",
      compatibility: "Latitude 5490 / Precision 3530",
      tags: ["dell", "latitude", "bios"],
      verificationStatus: "verified",
      status: "published",
      accessType: "free",
      price: 0,
      uploaderId: users[0].id,
      downloadCount: 42,
      publishedAt: ts,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: randomUUID(),
      name: "EliteBook 840 G5 Boardview",
      originalName: "840g5-boardview.bdv",
      storageKey: "seed-demo-no-binary",
      categoryId: categories[1].id,
      brandId: brands[1].id,
      boardNumber: "6050A2858301",
      modelNumber: "EliteBook 840 G5",
      fileType: "Boardview",
      version: "1.0",
      sizeBytes: 4_200_000,
      description: "HP EliteBook 840 G5 boardview.",
      compatibility: "840 G5 / 840 G6 (partial)",
      tags: ["hp", "boardview"],
      verificationStatus: "verified",
      status: "published",
      accessType: "paid",
      price: 12,
      uploaderId: users[0].id,
      downloadCount: 18,
      publishedAt: ts,
      createdAt: ts,
      updatedAt: ts,
    },
  ];

  const plans: SubscriptionPlan[] = [
    {
      id: randomUUID(),
      name: "Monthly Pro",
      durationDays: 30,
      price: 29,
      features: ["All paid library files", "Priority support", "Unlimited downloads"],
      active: true,
      createdAt: ts,
    },
    {
      id: randomUUID(),
      name: "Yearly Pro",
      durationDays: 365,
      price: 249,
      features: ["All paid library files", "Priority support", "2 months free"],
      active: true,
      createdAt: ts,
    },
  ];

  const services: ServiceItem[] = [
    {
      id: randomUUID(),
      name: "BIOS Repair",
      description: "Corrupt BIOS recovery and flashing assistance.",
      price: 49,
      icon: "🔧",
      active: true,
      featured: true,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: randomUUID(),
      name: "Password Removal",
      description: "Authorized firmware password recovery service.",
      price: 79,
      icon: "🔑",
      active: true,
      featured: true,
      createdAt: ts,
      updatedAt: ts,
    },
  ];

  const settings: PlatformSettings = {
    introEnabled: process.env.INTRO_ENABLED !== "false",
    introDurationDays: introDays,
    introCoversAccessTypes: ["free", "paid"],
    introCategoryIds: categories.map((c) => c.id),
    maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES || 50 * 1024 * 1024),
    allowedExtensions: ALLOWED_EXTENSIONS_DEFAULT,
    allowedMimeTypes: ALLOWED_MIME_DEFAULT,
  };

  return {
    users,
    categories,
    brands,
    files,
    fileVersions: [],
    plans,
    subscriptions: [],
    uploads: [],
    requests: [],
    tickets: [],
    messages: [],
    notifications: [],
    downloads: [],
    payments: [],
    services,
    resetTokens: [],
    auditLogs: [],
    settings,
  };
}

export async function loadDb(): Promise<Database> {
  if (memory) return memory;

  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error(
      "DATABASE_URL is not set. Add mysql://root@127.0.0.1:3306/Imtiaz-bios to .env.local (XAMPP MySQL).",
    );
  }

  backend = "mysql";
  const existing = await loadDatabaseFromMysql();
  if (existing) {
    memory = existing;
    console.info("[db] Connected to MySQL via Prisma — loaded existing data");
    return memory;
  }

  memory = await seed();
  await persistDatabaseToMysql(memory);
  console.info("[db] Connected to MySQL via Prisma — seeded initial data");
  return memory;
}

export async function updateDb<T>(fn: (db: Database) => T | Promise<T>): Promise<T> {
  const run = writeChain.then(async () => {
    const db = await loadDb();
    const result = await fn(db);
    memory = db;
    await persistDatabaseToMysql(db);
    return result;
  });
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

/** Force reload from MySQL (e.g. after external edits). */
export async function reloadDb(): Promise<Database> {
  memory = null;
  backend = null;
  return loadDb();
}

export function getDbBackend(): "mysql" | "uninitialized" {
  return backend ?? "uninitialized";
}

export function getDbStatus() {
  return {
    backend: getDbBackend(),
    mysqlConfigured: Boolean(process.env.DATABASE_URL?.trim()),
  };
}

export function publicUser(u: User) {
  const { passwordHash: _, ...rest } = u;
  return rest;
}

export function findCategory(db: Database, idOrSlug: string) {
  return db.categories.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
}

export function findBrand(db: Database, idOrName: string) {
  return db.brands.find(
    (b) =>
      b.id === idOrName ||
      b.slug === idOrName ||
      b.name.toLowerCase() === idOrName.toLowerCase(),
  );
}

export function nextTicketNumber(db: Database, prefix: string): string {
  const n = db.tickets.length + db.requests.length + 1;
  return `${prefix}-${String(n).padStart(6, "0")}`;
}

export { now, randomUUID, prisma };
