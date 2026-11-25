/**
 * Builds a phpMyAdmin-ready SQL dump from Prisma migrations + .data/imtiaz-db.json
 * Usage: node scripts/export-sql-from-json.cjs
 * Output: prisma/imtiaz-bios.sql
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dbName = "imtiaz-bios";
const jsonPath = path.join(root, ".data", "imtiaz-db.json");
const outPath = path.join(root, "prisma", "imtiaz-bios.sql");

const migrationFiles = [
  path.join(root, "prisma", "migrations", "20260927133000_init", "migration.sql"),
  path.join(
    root,
    "prisma",
    "migrations",
    "20260930112000_audit_actor_optional",
    "migration.sql",
  ),
];

function esc(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "1" : "0";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "0";
  if (typeof v === "object") {
    return `'${JSON.stringify(v).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
  }
  return `'${String(v).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
}

function insert(table, rows, columns) {
  if (!rows?.length) return `-- (no rows for ${table})\n`;
  const lines = rows.map((row) => {
    const vals = columns.map((c) => esc(row[c]));
    return `(${vals.join(", ")})`;
  });
  return (
    `INSERT INTO \`${table}\` (${columns.map((c) => `\`${c}\``).join(", ")}) VALUES\n` +
    lines.join(",\n") +
    ";\n\n"
  );
}

if (!fs.existsSync(jsonPath)) {
  console.error("Missing", jsonPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
let schemaSql = "";
for (const f of migrationFiles) {
  if (fs.existsSync(f)) {
    schemaSql += `\n-- From ${path.relative(root, f)}\n`;
    schemaSql += fs.readFileSync(f, "utf8") + "\n";
  }
}

// Strip Prisma migration markers that confuse phpMyAdmin sometimes
schemaSql = schemaSql.replace(/^-- CreateIndex$/gm, "");

const parts = [];
parts.push(`-- IMTIAZ BIOS - full restore for XAMPP / phpMyAdmin
-- Generated ${new Date().toISOString()}
-- Import: phpMyAdmin > Import > choose this file
-- Or CLI: mysql -u root < prisma/imtiaz-bios.sql

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS \`${dbName}\`;
CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`${dbName}\`;

`);
parts.push(schemaSql);
parts.push("\n-- ===================== DATA =====================\n\n");

const settings = data.settings || {};
parts.push(
  insert(
    "PlatformSettings",
    [
      {
        id: "platform",
        introEnabled: settings.introEnabled ?? true,
        introDurationDays: settings.introDurationDays ?? 183,
        introCoversAccessTypes: settings.introCoversAccessTypes ?? ["free", "paid"],
        introCategoryIds: settings.introCategoryIds ?? [],
        maxUploadBytes: settings.maxUploadBytes ?? 52428800,
        allowedExtensions: settings.allowedExtensions ?? [".bin", ".pdf", ".bv"],
        allowedMimeTypes: settings.allowedMimeTypes ?? [
          "application/octet-stream",
          "application/pdf",
        ],
      },
    ],
    [
      "id",
      "introEnabled",
      "introDurationDays",
      "introCoversAccessTypes",
      "introCategoryIds",
      "maxUploadBytes",
      "allowedExtensions",
      "allowedMimeTypes",
    ],
  ),
);

parts.push(
  insert("User", data.users || [], [
    "id",
    "name",
    "email",
    "passwordHash",
    "phone",
    "country",
    "role",
    "status",
    "trialStartDate",
    "trialEndDate",
    "subscriptionId",
    "createdAt",
    "updatedAt",
  ]),
);

parts.push(
  insert("Category", data.categories || [], [
    "id",
    "name",
    "slug",
    "description",
    "parentCategory",
    "active",
    "sortOrder",
    "createdAt",
  ]),
);

parts.push(
  insert("Brand", data.brands || [], [
    "id",
    "name",
    "slug",
    "description",
    "logo",
    "active",
    "createdAt",
  ]),
);

parts.push(
  insert("SubscriptionPlan", data.plans || [], [
    "id",
    "name",
    "durationDays",
    "price",
    "features",
    "active",
    "createdAt",
  ]),
);

parts.push(
  insert("ServiceItem", data.services || [], [
    "id",
    "name",
    "description",
    "price",
    "icon",
    "active",
    "featured",
    "createdAt",
    "updatedAt",
  ]),
);

parts.push(
  insert("FileAsset", data.files || [], [
    "id",
    "name",
    "originalName",
    "storageKey",
    "categoryId",
    "brandId",
    "boardNumber",
    "modelNumber",
    "fileType",
    "version",
    "sizeBytes",
    "description",
    "compatibility",
    "tags",
    "verificationStatus",
    "verificationNote",
    "verifiedBy",
    "verifiedAt",
    "status",
    "accessType",
    "price",
    "uploaderId",
    "downloadCount",
    "publishedAt",
    "createdAt",
    "updatedAt",
  ]),
);

parts.push(
  insert("FileVersion", data.fileVersions || [], [
    "id",
    "fileAssetId",
    "version",
    "changelog",
    "sizeBytes",
    "storageKey",
    "createdAt",
    "createdBy",
  ]),
);

parts.push(
  insert("UserSubscription", data.subscriptions || [], [
    "id",
    "userId",
    "planId",
    "status",
    "startsAt",
    "endsAt",
    "paymentId",
    "createdAt",
  ]),
);

parts.push(
  insert("UploadSubmission", data.uploads || [], [
    "id",
    "userId",
    "originalName",
    "storageKey",
    "mimeType",
    "sizeBytes",
    "categoryId",
    "brandId",
    "boardNumber",
    "modelNumber",
    "fileType",
    "version",
    "description",
    "notes",
    "status",
    "reviewerId",
    "reviewNote",
    "publishedFileId",
    "createdAt",
    "updatedAt",
  ]),
);

parts.push(
  insert("FileRequest", data.requests || [], [
    "id",
    "requestNumber",
    "userId",
    "boardModel",
    "brand",
    "typeNeeded",
    "description",
    "attachments",
    "status",
    "assigneeId",
    "createdAt",
    "updatedAt",
  ]),
);

parts.push(
  insert("SupportTicket", data.tickets || [], [
    "id",
    "ticketNumber",
    "type",
    "userId",
    "subject",
    "brand",
    "model",
    "boardNumber",
    "serviceIdentifier",
    "symptoms",
    "description",
    "priority",
    "status",
    "assigneeId",
    "ownershipAck",
    "attachments",
    "createdAt",
    "updatedAt",
  ]),
);

parts.push(
  insert("TicketMessage", data.messages || [], [
    "id",
    "ticketId",
    "senderId",
    "message",
    "attachment",
    "createdAt",
  ]),
);

parts.push(
  insert("Notification", data.notifications || [], [
    "id",
    "userId",
    "type",
    "title",
    "body",
    "href",
    "read",
    "createdAt",
  ]),
);

parts.push(
  insert("DownloadEvent", data.downloads || [], [
    "id",
    "userId",
    "fileId",
    "versionId",
    "at",
    "ip",
    "ua",
    "result",
  ]),
);

parts.push(
  insert("Payment", data.payments || [], [
    "id",
    "userId",
    "amount",
    "currency",
    "paymentMethod",
    "transactionId",
    "status",
    "purpose",
    "createdAt",
  ]),
);

parts.push(
  insert("PasswordResetToken", data.resetTokens || [], [
    "id",
    "userId",
    "tokenHash",
    "expiresAt",
    "usedAt",
    "createdAt",
  ]),
);

parts.push(
  insert("AuditLog", data.auditLogs || [], [
    "id",
    "actorId",
    "action",
    "targetType",
    "targetId",
    "summary",
    "before",
    "after",
    "createdAt",
  ]),
);

parts.push(`
-- Prisma migration history (so prisma migrate doesn't re-apply)
CREATE TABLE IF NOT EXISTS \`_prisma_migrations\` (
  \`id\` VARCHAR(36) NOT NULL,
  \`checksum\` VARCHAR(64) NOT NULL,
  \`finished_at\` DATETIME(3) NULL,
  \`migration_name\` VARCHAR(255) NOT NULL,
  \`logs\` TEXT NULL,
  \`rolled_back_at\` DATETIME(3) NULL,
  \`started_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`applied_steps_count\` INTEGER UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO \`_prisma_migrations\` (\`id\`, \`checksum\`, \`finished_at\`, \`migration_name\`, \`logs\`, \`rolled_back_at\`, \`started_at\`, \`applied_steps_count\`) VALUES
('00000000-0000-4000-8000-000000000001', 'imported-manually', NOW(3), '20260927133000_init', NULL, NULL, NOW(3), 1),
('00000000-0000-4000-8000-000000000002', 'imported-manually', NOW(3), '20260930112000_audit_actor_optional', NULL, NULL, NOW(3), 1);

SET FOREIGN_KEY_CHECKS = 1;

-- Demo logins (from seed / backup):
-- admin@imtiazbios.local / Admin123!
-- tech@imtiazbios.local / Tech123!
-- user@imtiazbios.local / User123!
`);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, parts.join(""), "utf8");
console.log("Wrote", outPath, `(${fs.statSync(outPath).size} bytes)`);
console.log("Import in phpMyAdmin, or:");
console.log(`  mysql -u root < "${outPath}"`);
