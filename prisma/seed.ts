/**
 * Prisma seed — same demo data as first-boot seed in app/lib/server/db.ts
 * Run: npx prisma db seed
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function now(): string {
  return new Date().toISOString();
}

async function main() {
  const existing = await prisma.platformSettings.findUnique({
    where: { id: "platform" },
  });
  if (existing) {
    console.log("[seed] Platform settings already exist — skipping seed.");
    return;
  }

  const ts = now();
  const introDays = Number(process.env.INTRO_DURATION_DAYS || 183);
  const adminHash = await hash("Admin123!", 10);
  const techHash = await hash("Tech123!", 10);
  const userHash = await hash("User123!", 10);

  const categoryNames = [
    "BIOS/Firmware",
    "Boardview",
    "Schematics",
    "Service Manuals",
    "Recovery Software",
    "Diagnostic Tools",
    "Other",
  ];
  const categories = categoryNames.map((name, i) => ({
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
  const brands = brandNames.map((name) => ({
    id: randomUUID(),
    name,
    slug: slugify(name),
    description: name,
    active: true,
    createdAt: ts,
  }));

  const end = new Date(Date.now() + introDays * 86400000).toISOString();
  const users = [
    {
      id: randomUUID(),
      name: "Platform Admin",
      email: "admin@imtiazbios.local",
      passwordHash: adminHash,
      phone: "",
      country: "",
      role: "ADMIN",
      status: "Active",
      trialStartDate: ts,
      trialEndDate: end,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: randomUUID(),
      name: "Lead Technician",
      email: "tech@imtiazbios.local",
      passwordHash: techHash,
      phone: "",
      country: "",
      role: "TECHNICIAN",
      status: "Active",
      trialStartDate: ts,
      trialEndDate: end,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: randomUUID(),
      name: "Demo Customer",
      email: "user@imtiazbios.local",
      passwordHash: userHash,
      phone: "",
      country: "",
      role: "USER",
      status: "Active",
      trialStartDate: ts,
      trialEndDate: end,
      createdAt: ts,
      updatedAt: ts,
    },
  ];

  await prisma.user.createMany({ data: users });
  await prisma.category.createMany({ data: categories });
  await prisma.brand.createMany({ data: brands });

  await prisma.subscriptionPlan.createMany({
    data: [
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
    ],
  });

  await prisma.serviceItem.createMany({
    data: [
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
    ],
  });

  await prisma.fileAsset.createMany({
    data: [
      {
        id: randomUUID(),
        name: "Latitude 5490 BIOS A18",
        originalName: "latitude-5490-a18.bin",
        storageKey: "seed-demo-no-binary",
        categoryId: categories[0].id,
        brandId: brands[0].id,
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
    ],
  });

  await prisma.platformSettings.create({
    data: {
      id: "platform",
      introEnabled: process.env.INTRO_ENABLED !== "false",
      introDurationDays: introDays,
      introCoversAccessTypes: ["free", "paid"],
      introCategoryIds: categories.map((c) => c.id),
      maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES || 50 * 1024 * 1024),
      allowedExtensions: [".bin", ".rom", ".bdv", ".pdf", ".zip", ".rar", ".7z"],
      allowedMimeTypes: [
        "application/octet-stream",
        "application/pdf",
        "application/zip",
        "application/x-zip-compressed",
      ],
    },
  });

  console.log("[seed] Seeded demo users, categories, brands, plans, services, files.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
