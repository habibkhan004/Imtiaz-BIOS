import type {
  AccessType,
  AuditLog,
  Brand,
  Category,
  Database,
  DownloadEvent,
  FileAsset,
  FileRequest,
  FileVersion,
  Notification,
  PasswordResetToken,
  Payment,
  PlatformSettings,
  ServiceItem,
  SubscriptionPlan,
  SupportTicket,
  TicketMessage,
  UploadSubmission,
  User,
  UserSubscription,
} from "../domain/types";
import { prisma } from "./prisma";

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      /* ignore */
    }
  }
  return [];
}

function asAccessTypes(value: unknown): AccessType[] {
  return asStringArray(value).filter(
    (v): v is AccessType => v === "free" || v === "paid",
  );
}

function mapUser(r: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string | null;
  country: string | null;
  role: string;
  status: string;
  trialStartDate: string;
  trialEndDate: string;
  subscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}): User {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    passwordHash: r.passwordHash,
    phone: r.phone || undefined,
    country: r.country || undefined,
    role: r.role as User["role"],
    status: r.status as User["status"],
    trialStartDate: r.trialStartDate,
    trialEndDate: r.trialEndDate,
    subscriptionId: r.subscriptionId || undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function mapCategory(r: {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentCategory: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}): Category {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    parentCategory: r.parentCategory || undefined,
    active: r.active,
    sortOrder: r.sortOrder,
    createdAt: r.createdAt,
  };
}

function mapBrand(r: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  active: boolean;
  createdAt: string;
}): Brand {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description || undefined,
    logo: r.logo || undefined,
    active: r.active,
    createdAt: r.createdAt,
  };
}

function mapFile(r: {
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
  tags: unknown;
  verificationStatus: string;
  verificationNote: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  status: string;
  accessType: string;
  price: number;
  uploaderId: string;
  downloadCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}): FileAsset {
  return {
    id: r.id,
    name: r.name,
    originalName: r.originalName,
    storageKey: r.storageKey,
    categoryId: r.categoryId,
    brandId: r.brandId,
    boardNumber: r.boardNumber,
    modelNumber: r.modelNumber,
    fileType: r.fileType,
    version: r.version,
    sizeBytes: r.sizeBytes,
    description: r.description,
    compatibility: r.compatibility,
    tags: asStringArray(r.tags),
    verificationStatus: r.verificationStatus as FileAsset["verificationStatus"],
    verificationNote: r.verificationNote || undefined,
    verifiedBy: r.verifiedBy || undefined,
    verifiedAt: r.verifiedAt || undefined,
    status: r.status as FileAsset["status"],
    accessType: r.accessType as FileAsset["accessType"],
    price: r.price,
    uploaderId: r.uploaderId,
    downloadCount: r.downloadCount,
    publishedAt: r.publishedAt || undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

/** Returns null when the database has never been seeded. */
export async function loadDatabaseFromMysql(): Promise<Database | null> {
  const settingsRow = await prisma.platformSettings.findUnique({
    where: { id: "platform" },
  });
  if (!settingsRow) return null;

  const [
    users,
    categories,
    brands,
    files,
    fileVersions,
    plans,
    subscriptions,
    uploads,
    requests,
    tickets,
    messages,
    notifications,
    downloads,
    payments,
    services,
    resetTokens,
    auditLogs,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.brand.findMany(),
    prisma.fileAsset.findMany(),
    prisma.fileVersion.findMany(),
    prisma.subscriptionPlan.findMany(),
    prisma.userSubscription.findMany(),
    prisma.uploadSubmission.findMany(),
    prisma.fileRequest.findMany(),
    prisma.supportTicket.findMany(),
    prisma.ticketMessage.findMany(),
    prisma.notification.findMany(),
    prisma.downloadEvent.findMany(),
    prisma.payment.findMany(),
    prisma.serviceItem.findMany(),
    prisma.passwordResetToken.findMany(),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 2000,
    }),
  ]);

  const settings: PlatformSettings = {
    introEnabled: settingsRow.introEnabled,
    introDurationDays: settingsRow.introDurationDays,
    introCoversAccessTypes: asAccessTypes(settingsRow.introCoversAccessTypes),
    introCategoryIds: asStringArray(settingsRow.introCategoryIds),
    maxUploadBytes: settingsRow.maxUploadBytes,
    allowedExtensions: asStringArray(settingsRow.allowedExtensions),
    allowedMimeTypes: asStringArray(settingsRow.allowedMimeTypes),
  };

  return {
    users: users.map(mapUser),
    categories: categories.map(mapCategory),
    brands: brands.map(mapBrand),
    files: files.map(mapFile),
    fileVersions: fileVersions.map(
      (r): FileVersion => ({
        id: r.id,
        fileAssetId: r.fileAssetId,
        version: r.version,
        changelog: r.changelog || undefined,
        sizeBytes: r.sizeBytes,
        storageKey: r.storageKey,
        createdAt: r.createdAt,
        createdBy: r.createdBy,
      }),
    ),
    plans: plans.map(
      (r): SubscriptionPlan => ({
        id: r.id,
        name: r.name,
        durationDays: r.durationDays,
        price: r.price,
        features: asStringArray(r.features),
        active: r.active,
        createdAt: r.createdAt,
      }),
    ),
    subscriptions: subscriptions.map(
      (r): UserSubscription => ({
        id: r.id,
        userId: r.userId,
        planId: r.planId,
        status: r.status as UserSubscription["status"],
        startsAt: r.startsAt,
        endsAt: r.endsAt,
        paymentId: r.paymentId || undefined,
        createdAt: r.createdAt,
      }),
    ),
    uploads: uploads.map(
      (r): UploadSubmission => ({
        id: r.id,
        userId: r.userId,
        originalName: r.originalName,
        storageKey: r.storageKey,
        mimeType: r.mimeType,
        sizeBytes: r.sizeBytes,
        categoryId: r.categoryId,
        brandId: r.brandId,
        boardNumber: r.boardNumber,
        modelNumber: r.modelNumber,
        fileType: r.fileType,
        version: r.version,
        description: r.description,
        notes: r.notes,
        status: r.status as UploadSubmission["status"],
        reviewerId: r.reviewerId || undefined,
        reviewNote: r.reviewNote || undefined,
        publishedFileId: r.publishedFileId || undefined,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }),
    ),
    requests: requests.map(
      (r): FileRequest => ({
        id: r.id,
        requestNumber: r.requestNumber,
        userId: r.userId,
        boardModel: r.boardModel,
        brand: r.brand,
        typeNeeded: r.typeNeeded,
        description: r.description,
        attachments: asStringArray(r.attachments),
        status: r.status as FileRequest["status"],
        assigneeId: r.assigneeId || undefined,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }),
    ),
    tickets: tickets.map(
      (r): SupportTicket => ({
        id: r.id,
        ticketNumber: r.ticketNumber,
        type: r.type as SupportTicket["type"],
        userId: r.userId || undefined,
        subject: r.subject,
        brand: r.brand || undefined,
        model: r.model || undefined,
        boardNumber: r.boardNumber || undefined,
        serviceIdentifier: r.serviceIdentifier || undefined,
        symptoms: r.symptoms || undefined,
        description: r.description,
        priority: r.priority as SupportTicket["priority"],
        status: r.status as SupportTicket["status"],
        assigneeId: r.assigneeId || undefined,
        ownershipAck: r.ownershipAck ?? undefined,
        attachments: asStringArray(r.attachments),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }),
    ),
    messages: messages.map(
      (r): TicketMessage => ({
        id: r.id,
        ticketId: r.ticketId,
        senderId: r.senderId,
        message: r.message,
        attachment: r.attachment || undefined,
        createdAt: r.createdAt,
      }),
    ),
    notifications: notifications.map(
      (r): Notification => ({
        id: r.id,
        userId: r.userId,
        type: r.type,
        title: r.title,
        body: r.body,
        href: r.href || undefined,
        read: r.read,
        createdAt: r.createdAt,
      }),
    ),
    downloads: downloads.map(
      (r): DownloadEvent => ({
        id: r.id,
        userId: r.userId,
        fileId: r.fileId,
        versionId: r.versionId || undefined,
        at: r.at,
        ip: r.ip || undefined,
        ua: r.ua || undefined,
        result: r.result as DownloadEvent["result"],
      }),
    ),
    payments: payments.map(
      (r): Payment => ({
        id: r.id,
        userId: r.userId,
        amount: r.amount,
        currency: r.currency,
        paymentMethod: r.paymentMethod,
        transactionId: r.transactionId,
        status: r.status as Payment["status"],
        purpose: r.purpose,
        createdAt: r.createdAt,
      }),
    ),
    services: services.map(
      (r): ServiceItem => ({
        id: r.id,
        name: r.name,
        description: r.description,
        price: r.price,
        icon: r.icon,
        active: r.active,
        featured: r.featured,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }),
    ),
    resetTokens: resetTokens.map(
      (r): PasswordResetToken => ({
        id: r.id,
        userId: r.userId,
        tokenHash: r.tokenHash,
        expiresAt: r.expiresAt,
        usedAt: r.usedAt || undefined,
        createdAt: r.createdAt,
      }),
    ),
    auditLogs: auditLogs.map(
      (r): AuditLog => ({
        id: r.id,
        actorId: r.actorId || "anonymous",
        action: r.action,
        targetType: r.targetType,
        targetId: r.targetId,
        summary: r.summary,
        before: r.before || undefined,
        after: r.after || undefined,
        createdAt: r.createdAt,
      }),
    ),
    settings,
  };
}

/**
 * Full-database sync preserving loadDb/updateDb semantics.
 * Writes in FK-safe order inside a transaction.
 */
export async function persistDatabaseToMysql(db: Database): Promise<void> {
  const auditSlice = db.auditLogs.slice(0, 2000);

  await prisma.$transaction(
    async (tx) => {
      // Clear dependent tables first (respect FKs)
      await tx.downloadEvent.deleteMany();
      await tx.ticketMessage.deleteMany();
      await tx.notification.deleteMany();
      await tx.passwordResetToken.deleteMany();
      await tx.auditLog.deleteMany();
      await tx.payment.deleteMany();
      await tx.userSubscription.deleteMany();
      await tx.uploadSubmission.deleteMany();
      await tx.fileRequest.deleteMany();
      await tx.supportTicket.deleteMany();
      await tx.fileVersion.deleteMany();
      await tx.fileAsset.deleteMany();
      await tx.subscriptionPlan.deleteMany();
      await tx.serviceItem.deleteMany();
      await tx.category.deleteMany();
      await tx.brand.deleteMany();
      await tx.user.deleteMany();

      if (db.users.length) {
        await tx.user.createMany({
          data: db.users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            passwordHash: u.passwordHash,
            phone: u.phone || null,
            country: u.country || null,
            role: u.role,
            status: u.status,
            trialStartDate: u.trialStartDate,
            trialEndDate: u.trialEndDate,
            subscriptionId: u.subscriptionId || null,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
          })),
        });
      }

      if (db.categories.length) {
        await tx.category.createMany({
          data: db.categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            parentCategory: c.parentCategory || null,
            active: c.active,
            sortOrder: c.sortOrder,
            createdAt: c.createdAt,
          })),
        });
      }

      if (db.brands.length) {
        await tx.brand.createMany({
          data: db.brands.map((b) => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            description: b.description || null,
            logo: b.logo || null,
            active: b.active,
            createdAt: b.createdAt,
          })),
        });
      }

      if (db.plans.length) {
        await tx.subscriptionPlan.createMany({
          data: db.plans.map((p) => ({
            id: p.id,
            name: p.name,
            durationDays: p.durationDays,
            price: p.price,
            features: p.features,
            active: p.active,
            createdAt: p.createdAt,
          })),
        });
      }

      if (db.services.length) {
        await tx.serviceItem.createMany({
          data: db.services.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            price: s.price,
            icon: s.icon,
            active: s.active,
            featured: s.featured,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
          })),
        });
      }

      if (db.files.length) {
        await tx.fileAsset.createMany({
          data: db.files.map((f) => ({
            id: f.id,
            name: f.name,
            originalName: f.originalName,
            storageKey: f.storageKey,
            categoryId: f.categoryId,
            brandId: f.brandId,
            boardNumber: f.boardNumber,
            modelNumber: f.modelNumber,
            fileType: f.fileType,
            version: f.version,
            sizeBytes: f.sizeBytes,
            description: f.description,
            compatibility: f.compatibility,
            tags: f.tags,
            verificationStatus: f.verificationStatus,
            verificationNote: f.verificationNote || null,
            verifiedBy: f.verifiedBy || null,
            verifiedAt: f.verifiedAt || null,
            status: f.status,
            accessType: f.accessType,
            price: f.price,
            uploaderId: f.uploaderId,
            downloadCount: f.downloadCount,
            publishedAt: f.publishedAt || null,
            createdAt: f.createdAt,
            updatedAt: f.updatedAt,
          })),
        });
      }

      if (db.fileVersions.length) {
        await tx.fileVersion.createMany({
          data: db.fileVersions.map((v) => ({
            id: v.id,
            fileAssetId: v.fileAssetId,
            version: v.version,
            changelog: v.changelog || null,
            sizeBytes: v.sizeBytes,
            storageKey: v.storageKey,
            createdAt: v.createdAt,
            createdBy: v.createdBy,
          })),
        });
      }

      if (db.subscriptions.length) {
        await tx.userSubscription.createMany({
          data: db.subscriptions.map((s) => ({
            id: s.id,
            userId: s.userId,
            planId: s.planId,
            status: s.status,
            startsAt: s.startsAt,
            endsAt: s.endsAt,
            paymentId: s.paymentId || null,
            createdAt: s.createdAt,
          })),
        });
      }

      if (db.uploads.length) {
        await tx.uploadSubmission.createMany({
          data: db.uploads.map((u) => ({
            id: u.id,
            userId: u.userId,
            originalName: u.originalName,
            storageKey: u.storageKey,
            mimeType: u.mimeType,
            sizeBytes: u.sizeBytes,
            categoryId: u.categoryId,
            brandId: u.brandId,
            boardNumber: u.boardNumber,
            modelNumber: u.modelNumber,
            fileType: u.fileType,
            version: u.version,
            description: u.description,
            notes: u.notes,
            status: u.status,
            reviewerId: u.reviewerId || null,
            reviewNote: u.reviewNote || null,
            publishedFileId: u.publishedFileId || null,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
          })),
        });
      }

      if (db.requests.length) {
        await tx.fileRequest.createMany({
          data: db.requests.map((r) => ({
            id: r.id,
            requestNumber: r.requestNumber,
            userId: r.userId,
            boardModel: r.boardModel,
            brand: r.brand,
            typeNeeded: r.typeNeeded,
            description: r.description,
            attachments: r.attachments,
            status: r.status,
            assigneeId: r.assigneeId || null,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          })),
        });
      }

      if (db.tickets.length) {
        await tx.supportTicket.createMany({
          data: db.tickets.map((t) => ({
            id: t.id,
            ticketNumber: t.ticketNumber,
            type: t.type,
            userId: t.userId || null,
            subject: t.subject,
            brand: t.brand || null,
            model: t.model || null,
            boardNumber: t.boardNumber || null,
            serviceIdentifier: t.serviceIdentifier || null,
            symptoms: t.symptoms || null,
            description: t.description,
            priority: t.priority,
            status: t.status,
            assigneeId: t.assigneeId || null,
            ownershipAck: t.ownershipAck ?? null,
            attachments: t.attachments,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          })),
        });
      }

      if (db.messages.length) {
        await tx.ticketMessage.createMany({
          data: db.messages.map((m) => ({
            id: m.id,
            ticketId: m.ticketId,
            senderId: m.senderId,
            message: m.message,
            attachment: m.attachment || null,
            createdAt: m.createdAt,
          })),
        });
      }

      if (db.notifications.length) {
        await tx.notification.createMany({
          data: db.notifications.map((n) => ({
            id: n.id,
            userId: n.userId,
            type: n.type,
            title: n.title,
            body: n.body,
            href: n.href || null,
            read: n.read,
            createdAt: n.createdAt,
          })),
        });
      }

      if (db.downloads.length) {
        await tx.downloadEvent.createMany({
          data: db.downloads.map((d) => ({
            id: d.id,
            userId: d.userId,
            fileId: d.fileId,
            versionId: d.versionId || null,
            at: d.at,
            ip: d.ip || null,
            ua: d.ua || null,
            result: d.result,
          })),
        });
      }

      if (db.payments.length) {
        await tx.payment.createMany({
          data: db.payments.map((p) => ({
            id: p.id,
            userId: p.userId,
            amount: p.amount,
            currency: p.currency,
            paymentMethod: p.paymentMethod,
            transactionId: p.transactionId,
            status: p.status,
            purpose: p.purpose,
            createdAt: p.createdAt,
          })),
        });
      }

      if (db.resetTokens.length) {
        await tx.passwordResetToken.createMany({
          data: db.resetTokens.map((t) => ({
            id: t.id,
            userId: t.userId,
            tokenHash: t.tokenHash,
            expiresAt: t.expiresAt,
            usedAt: t.usedAt || null,
            createdAt: t.createdAt,
          })),
        });
      }

      if (auditSlice.length) {
        const userIds = new Set(db.users.map((u) => u.id));
        await tx.auditLog.createMany({
          data: auditSlice.map((a) => ({
            id: a.id,
            // "anonymous" / missing users must not violate FK
            actorId: userIds.has(a.actorId) ? a.actorId : null,
            action: a.action,
            targetType: a.targetType,
            targetId: a.targetId.slice(0, 191),
            summary: a.summary,
            before: a.before || null,
            after: a.after || null,
            createdAt: a.createdAt,
          })),
        });
      }

      await tx.platformSettings.upsert({
        where: { id: "platform" },
        create: {
          id: "platform",
          introEnabled: db.settings.introEnabled,
          introDurationDays: db.settings.introDurationDays,
          introCoversAccessTypes: db.settings.introCoversAccessTypes,
          introCategoryIds: db.settings.introCategoryIds,
          maxUploadBytes: db.settings.maxUploadBytes,
          allowedExtensions: db.settings.allowedExtensions,
          allowedMimeTypes: db.settings.allowedMimeTypes,
        },
        update: {
          introEnabled: db.settings.introEnabled,
          introDurationDays: db.settings.introDurationDays,
          introCoversAccessTypes: db.settings.introCoversAccessTypes,
          introCategoryIds: db.settings.introCategoryIds,
          maxUploadBytes: db.settings.maxUploadBytes,
          allowedExtensions: db.settings.allowedExtensions,
          allowedMimeTypes: db.settings.allowedMimeTypes,
        },
      });
    },
    { timeout: 60_000 },
  );
}
