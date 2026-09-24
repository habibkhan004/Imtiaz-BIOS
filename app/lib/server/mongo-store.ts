import mongoose, { Schema, type Model } from "mongoose";
import type { Database, PlatformSettings } from "../domain/types";

const lean = { _id: false, versionKey: false } as const;

function modelOf<T>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
}

const userSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: String,
    phone: String,
    country: String,
    role: String,
    status: String,
    trialStartDate: String,
    trialEndDate: String,
    subscriptionId: String,
    createdAt: String,
    updatedAt: String,
  },
  lean,
);

const categorySchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    slug: { type: String, index: true },
    description: String,
    parentCategory: String,
    active: Boolean,
    sortOrder: Number,
    createdAt: String,
  },
  lean,
);

const brandSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    slug: { type: String, index: true },
    description: String,
    logo: String,
    active: Boolean,
    createdAt: String,
  },
  lean,
);

const fileSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    originalName: String,
    storageKey: String,
    categoryId: { type: String, index: true },
    brandId: { type: String, index: true },
    boardNumber: { type: String, index: true },
    modelNumber: { type: String, index: true },
    fileType: { type: String, index: true },
    version: String,
    sizeBytes: Number,
    description: String,
    compatibility: String,
    tags: [String],
    verificationStatus: String,
    verificationNote: String,
    verifiedBy: String,
    verifiedAt: String,
    status: { type: String, index: true },
    accessType: String,
    price: Number,
    uploaderId: String,
    downloadCount: Number,
    publishedAt: String,
    createdAt: String,
    updatedAt: String,
  },
  lean,
);

const fileVersionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    fileAssetId: { type: String, index: true },
    version: String,
    changelog: String,
    sizeBytes: Number,
    storageKey: String,
    createdAt: String,
    createdBy: String,
  },
  lean,
);

const planSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    durationDays: Number,
    price: Number,
    features: [String],
    active: Boolean,
    createdAt: String,
  },
  lean,
);

const subscriptionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, index: true },
    planId: String,
    status: { type: String, index: true },
    startsAt: String,
    endsAt: String,
    paymentId: String,
    createdAt: String,
  },
  lean,
);

const uploadSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, index: true },
    originalName: String,
    storageKey: String,
    mimeType: String,
    sizeBytes: Number,
    categoryId: String,
    brandId: String,
    boardNumber: String,
    modelNumber: String,
    fileType: String,
    version: String,
    description: String,
    notes: String,
    status: { type: String, index: true },
    reviewerId: String,
    reviewNote: String,
    publishedFileId: String,
    createdAt: String,
    updatedAt: String,
  },
  lean,
);

const requestSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    requestNumber: { type: String, unique: true, index: true },
    userId: { type: String, index: true },
    boardModel: String,
    brand: String,
    typeNeeded: String,
    description: String,
    attachments: [String],
    status: { type: String, index: true },
    assigneeId: String,
    createdAt: String,
    updatedAt: String,
  },
  lean,
);

const ticketSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    ticketNumber: { type: String, unique: true, index: true },
    type: String,
    userId: { type: String, index: true },
    subject: String,
    brand: String,
    model: String,
    boardNumber: String,
    serviceIdentifier: String,
    symptoms: String,
    description: String,
    priority: String,
    status: { type: String, index: true },
    assigneeId: String,
    ownershipAck: Boolean,
    attachments: [String],
    createdAt: String,
    updatedAt: String,
  },
  lean,
);

const messageSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    ticketId: { type: String, index: true },
    senderId: String,
    message: String,
    attachment: String,
    createdAt: String,
  },
  lean,
);

const notificationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, index: true },
    type: String,
    title: String,
    body: String,
    href: String,
    read: Boolean,
    createdAt: String,
  },
  lean,
);

const downloadSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, index: true },
    fileId: { type: String, index: true },
    versionId: String,
    at: String,
    ip: String,
    ua: String,
    result: String,
  },
  lean,
);

const paymentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, index: true },
    amount: Number,
    currency: String,
    paymentMethod: String,
    transactionId: String,
    status: { type: String, index: true },
    purpose: String,
    createdAt: String,
  },
  lean,
);

const serviceSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    description: String,
    price: Number,
    icon: String,
    active: Boolean,
    featured: Boolean,
    createdAt: String,
    updatedAt: String,
  },
  lean,
);

const resetTokenSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, index: true },
    tokenHash: String,
    expiresAt: String,
    usedAt: String,
    createdAt: String,
  },
  lean,
);

const auditSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    actorId: { type: String, index: true },
    action: { type: String, index: true },
    targetType: String,
    targetId: String,
    summary: String,
    before: String,
    after: String,
    createdAt: String,
  },
  lean,
);

const settingsSchema = new Schema(
  {
    _key: { type: String, required: true, unique: true, default: "platform" },
    introEnabled: Boolean,
    introDurationDays: Number,
    introCoversAccessTypes: [String],
    introCategoryIds: [String],
    maxUploadBytes: Number,
    allowedExtensions: [String],
    allowedMimeTypes: [String],
  },
  { versionKey: false },
);

export const UserModel = modelOf("User", userSchema);
export const CategoryModel = modelOf("Category", categorySchema);
export const BrandModel = modelOf("Brand", brandSchema);
export const FileModel = modelOf("FileAsset", fileSchema);
export const FileVersionModel = modelOf("FileVersion", fileVersionSchema);
export const PlanModel = modelOf("SubscriptionPlan", planSchema);
export const SubscriptionModel = modelOf("UserSubscription", subscriptionSchema);
export const UploadModel = modelOf("UploadSubmission", uploadSchema);
export const RequestModel = modelOf("FileRequest", requestSchema);
export const TicketModel = modelOf("SupportTicket", ticketSchema);
export const MessageModel = modelOf("TicketMessage", messageSchema);
export const NotificationModel = modelOf("Notification", notificationSchema);
export const DownloadModel = modelOf("DownloadEvent", downloadSchema);
export const PaymentModel = modelOf("Payment", paymentSchema);
export const ServiceModel = modelOf("ServiceItem", serviceSchema);
export const ResetTokenModel = modelOf("PasswordResetToken", resetTokenSchema);
export const AuditModel = modelOf("AuditLog", auditSchema);
export const SettingsModel = modelOf<{ _key: string } & PlatformSettings>(
  "PlatformSettings",
  settingsSchema,
);

type DocWithId = { id: string };

async function syncById<T extends DocWithId>(
  Model: Model<T>,
  items: T[],
): Promise<void> {
  const ids = items.map((i) => i.id);
  if (ids.length === 0) {
    await Model.deleteMany({});
    return;
  }
  await Model.deleteMany({ id: { $nin: ids } } as never);
  await Model.bulkWrite(
    items.map((doc) => ({
      replaceOne: {
        filter: { id: doc.id },
        replacement: doc as never,
        upsert: true,
      },
    })),
    { ordered: false },
  );
}

function stripMongo<T>(docs: unknown[]): T[] {
  return docs.map((d) => {
    const obj = { ...(d as Record<string, unknown>) };
    delete obj._id;
    delete obj.__v;
    return obj as T;
  });
}

export async function loadDatabaseFromMongo(): Promise<Database | null> {
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
    settingsDoc,
  ] = await Promise.all([
    UserModel.find().lean(),
    CategoryModel.find().lean(),
    BrandModel.find().lean(),
    FileModel.find().lean(),
    FileVersionModel.find().lean(),
    PlanModel.find().lean(),
    SubscriptionModel.find().lean(),
    UploadModel.find().lean(),
    RequestModel.find().lean(),
    TicketModel.find().lean(),
    MessageModel.find().lean(),
    NotificationModel.find().lean(),
    DownloadModel.find().lean(),
    PaymentModel.find().lean(),
    ServiceModel.find().lean(),
    ResetTokenModel.find().lean(),
    AuditModel.find().sort({ createdAt: -1 }).limit(2000).lean(),
    SettingsModel.findOne({ _key: "platform" }).lean(),
  ]);

  if (!users.length && !categories.length && !settingsDoc) {
    return null;
  }

  const settings = settingsDoc
    ? ({
        introEnabled: settingsDoc.introEnabled,
        introDurationDays: settingsDoc.introDurationDays,
        introCoversAccessTypes: settingsDoc.introCoversAccessTypes,
        introCategoryIds: settingsDoc.introCategoryIds,
        maxUploadBytes: settingsDoc.maxUploadBytes,
        allowedExtensions: settingsDoc.allowedExtensions,
        allowedMimeTypes: settingsDoc.allowedMimeTypes,
      } as PlatformSettings)
    : null;

  if (!settings) return null;

  return {
    users: stripMongo(users),
    categories: stripMongo(categories),
    brands: stripMongo(brands),
    files: stripMongo(files),
    fileVersions: stripMongo(fileVersions),
    plans: stripMongo(plans),
    subscriptions: stripMongo(subscriptions),
    uploads: stripMongo(uploads),
    requests: stripMongo(requests),
    tickets: stripMongo(tickets),
    messages: stripMongo(messages),
    notifications: stripMongo(notifications),
    downloads: stripMongo(downloads),
    payments: stripMongo(payments),
    services: stripMongo(services),
    resetTokens: stripMongo(resetTokens),
    auditLogs: stripMongo(auditLogs),
    settings,
  };
}

export async function persistDatabaseToMongo(db: Database): Promise<void> {
  await Promise.all([
    syncById(UserModel, db.users),
    syncById(CategoryModel, db.categories),
    syncById(BrandModel, db.brands),
    syncById(FileModel, db.files),
    syncById(FileVersionModel, db.fileVersions),
    syncById(PlanModel, db.plans),
    syncById(SubscriptionModel, db.subscriptions),
    syncById(UploadModel, db.uploads),
    syncById(RequestModel, db.requests),
    syncById(TicketModel, db.tickets),
    syncById(MessageModel, db.messages),
    syncById(NotificationModel, db.notifications),
    syncById(DownloadModel, db.downloads),
    syncById(PaymentModel, db.payments),
    syncById(ServiceModel, db.services),
    syncById(ResetTokenModel, db.resetTokens),
    syncById(AuditModel, db.auditLogs.slice(0, 2000)),
    SettingsModel.findOneAndUpdate(
      { _key: "platform" },
      { _key: "platform", ...db.settings },
      { upsert: true },
    ),
  ]);
}
