-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(64) NULL,
    `country` VARCHAR(64) NULL,
    `role` VARCHAR(32) NOT NULL,
    `status` VARCHAR(32) NOT NULL,
    `trialStartDate` VARCHAR(40) NOT NULL,
    `trialEndDate` VARCHAR(40) NOT NULL,
    `subscriptionId` VARCHAR(36) NULL,
    `createdAt` VARCHAR(40) NOT NULL,
    `updatedAt` VARCHAR(40) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_role_idx`(`role`),
    INDEX `User_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `parentCategory` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` VARCHAR(40) NOT NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Brand` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `logo` VARCHAR(512) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` VARCHAR(40) NOT NULL,

    UNIQUE INDEX `Brand_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FileAsset` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `originalName` VARCHAR(255) NOT NULL,
    `storageKey` VARCHAR(512) NOT NULL,
    `categoryId` VARCHAR(36) NOT NULL,
    `brandId` VARCHAR(36) NOT NULL,
    `boardNumber` VARCHAR(191) NOT NULL,
    `modelNumber` VARCHAR(191) NOT NULL,
    `fileType` VARCHAR(64) NOT NULL,
    `version` VARCHAR(64) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `description` TEXT NOT NULL,
    `compatibility` TEXT NOT NULL,
    `tags` JSON NOT NULL,
    `verificationStatus` VARCHAR(32) NOT NULL,
    `verificationNote` TEXT NULL,
    `verifiedBy` VARCHAR(36) NULL,
    `verifiedAt` VARCHAR(40) NULL,
    `status` VARCHAR(32) NOT NULL,
    `accessType` VARCHAR(16) NOT NULL,
    `price` DOUBLE NOT NULL DEFAULT 0,
    `uploaderId` VARCHAR(36) NOT NULL,
    `downloadCount` INTEGER NOT NULL DEFAULT 0,
    `publishedAt` VARCHAR(40) NULL,
    `createdAt` VARCHAR(40) NOT NULL,
    `updatedAt` VARCHAR(40) NOT NULL,

    INDEX `FileAsset_categoryId_idx`(`categoryId`),
    INDEX `FileAsset_brandId_idx`(`brandId`),
    INDEX `FileAsset_boardNumber_idx`(`boardNumber`),
    INDEX `FileAsset_modelNumber_idx`(`modelNumber`),
    INDEX `FileAsset_fileType_idx`(`fileType`),
    INDEX `FileAsset_status_idx`(`status`),
    INDEX `FileAsset_uploaderId_idx`(`uploaderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FileVersion` (
    `id` VARCHAR(36) NOT NULL,
    `fileAssetId` VARCHAR(36) NOT NULL,
    `version` VARCHAR(64) NOT NULL,
    `changelog` TEXT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `storageKey` VARCHAR(512) NOT NULL,
    `createdAt` VARCHAR(40) NOT NULL,
    `createdBy` VARCHAR(36) NOT NULL,

    INDEX `FileVersion_fileAssetId_idx`(`fileAssetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubscriptionPlan` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `durationDays` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `features` JSON NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` VARCHAR(40) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserSubscription` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `planId` VARCHAR(36) NOT NULL,
    `status` VARCHAR(32) NOT NULL,
    `startsAt` VARCHAR(40) NOT NULL,
    `endsAt` VARCHAR(40) NOT NULL,
    `paymentId` VARCHAR(36) NULL,
    `createdAt` VARCHAR(40) NOT NULL,

    INDEX `UserSubscription_userId_idx`(`userId`),
    INDEX `UserSubscription_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UploadSubmission` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `originalName` VARCHAR(255) NOT NULL,
    `storageKey` VARCHAR(512) NOT NULL,
    `mimeType` VARCHAR(128) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `categoryId` VARCHAR(36) NOT NULL,
    `brandId` VARCHAR(36) NOT NULL,
    `boardNumber` VARCHAR(191) NOT NULL,
    `modelNumber` VARCHAR(191) NOT NULL,
    `fileType` VARCHAR(64) NOT NULL,
    `version` VARCHAR(64) NOT NULL,
    `description` TEXT NOT NULL,
    `notes` TEXT NOT NULL,
    `status` VARCHAR(32) NOT NULL,
    `reviewerId` VARCHAR(36) NULL,
    `reviewNote` TEXT NULL,
    `publishedFileId` VARCHAR(36) NULL,
    `createdAt` VARCHAR(40) NOT NULL,
    `updatedAt` VARCHAR(40) NOT NULL,

    INDEX `UploadSubmission_userId_idx`(`userId`),
    INDEX `UploadSubmission_status_idx`(`status`),
    INDEX `UploadSubmission_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FileRequest` (
    `id` VARCHAR(36) NOT NULL,
    `requestNumber` VARCHAR(64) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `boardModel` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `typeNeeded` VARCHAR(64) NOT NULL,
    `description` TEXT NOT NULL,
    `attachments` JSON NOT NULL,
    `status` VARCHAR(32) NOT NULL,
    `assigneeId` VARCHAR(36) NULL,
    `createdAt` VARCHAR(40) NOT NULL,
    `updatedAt` VARCHAR(40) NOT NULL,

    UNIQUE INDEX `FileRequest_requestNumber_key`(`requestNumber`),
    INDEX `FileRequest_userId_idx`(`userId`),
    INDEX `FileRequest_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupportTicket` (
    `id` VARCHAR(36) NOT NULL,
    `ticketNumber` VARCHAR(64) NOT NULL,
    `type` VARCHAR(32) NOT NULL,
    `userId` VARCHAR(36) NULL,
    `subject` VARCHAR(255) NOT NULL,
    `brand` VARCHAR(191) NULL,
    `model` VARCHAR(191) NULL,
    `boardNumber` VARCHAR(191) NULL,
    `serviceIdentifier` VARCHAR(191) NULL,
    `symptoms` TEXT NULL,
    `description` TEXT NOT NULL,
    `priority` VARCHAR(32) NOT NULL,
    `status` VARCHAR(32) NOT NULL,
    `assigneeId` VARCHAR(36) NULL,
    `ownershipAck` BOOLEAN NULL,
    `attachments` JSON NOT NULL,
    `createdAt` VARCHAR(40) NOT NULL,
    `updatedAt` VARCHAR(40) NOT NULL,

    UNIQUE INDEX `SupportTicket_ticketNumber_key`(`ticketNumber`),
    INDEX `SupportTicket_userId_idx`(`userId`),
    INDEX `SupportTicket_status_idx`(`status`),
    INDEX `SupportTicket_priority_idx`(`priority`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TicketMessage` (
    `id` VARCHAR(36) NOT NULL,
    `ticketId` VARCHAR(36) NOT NULL,
    `senderId` VARCHAR(36) NOT NULL,
    `message` TEXT NOT NULL,
    `attachment` VARCHAR(512) NULL,
    `createdAt` VARCHAR(40) NOT NULL,

    INDEX `TicketMessage_ticketId_idx`(`ticketId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `type` VARCHAR(64) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `href` VARCHAR(512) NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` VARCHAR(40) NOT NULL,

    INDEX `Notification_userId_idx`(`userId`),
    INDEX `Notification_read_idx`(`read`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DownloadEvent` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `fileId` VARCHAR(36) NOT NULL,
    `versionId` VARCHAR(36) NULL,
    `at` VARCHAR(40) NOT NULL,
    `ip` VARCHAR(64) NULL,
    `ua` TEXT NULL,
    `result` VARCHAR(32) NOT NULL,

    INDEX `DownloadEvent_userId_idx`(`userId`),
    INDEX `DownloadEvent_fileId_idx`(`fileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(8) NOT NULL,
    `paymentMethod` VARCHAR(64) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(32) NOT NULL,
    `purpose` VARCHAR(191) NOT NULL,
    `createdAt` VARCHAR(40) NOT NULL,

    INDEX `Payment_userId_idx`(`userId`),
    INDEX `Payment_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceItem` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DOUBLE NOT NULL,
    `icon` VARCHAR(32) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` VARCHAR(40) NOT NULL,
    `updatedAt` VARCHAR(40) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `tokenHash` VARCHAR(128) NOT NULL,
    `expiresAt` VARCHAR(40) NOT NULL,
    `usedAt` VARCHAR(40) NULL,
    `createdAt` VARCHAR(40) NOT NULL,

    UNIQUE INDEX `PasswordResetToken_tokenHash_key`(`tokenHash`),
    INDEX `PasswordResetToken_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(36) NOT NULL,
    `actorId` VARCHAR(36) NOT NULL,
    `action` VARCHAR(64) NOT NULL,
    `targetType` VARCHAR(64) NOT NULL,
    `targetId` VARCHAR(36) NOT NULL,
    `summary` TEXT NOT NULL,
    `before` TEXT NULL,
    `after` TEXT NULL,
    `createdAt` VARCHAR(40) NOT NULL,

    INDEX `AuditLog_actorId_idx`(`actorId`),
    INDEX `AuditLog_action_idx`(`action`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlatformSettings` (
    `id` VARCHAR(32) NOT NULL DEFAULT 'platform',
    `introEnabled` BOOLEAN NOT NULL DEFAULT true,
    `introDurationDays` INTEGER NOT NULL DEFAULT 183,
    `introCoversAccessTypes` JSON NOT NULL,
    `introCategoryIds` JSON NOT NULL,
    `maxUploadBytes` INTEGER NOT NULL,
    `allowedExtensions` JSON NOT NULL,
    `allowedMimeTypes` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FileAsset` ADD CONSTRAINT `FileAsset_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileAsset` ADD CONSTRAINT `FileAsset_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileAsset` ADD CONSTRAINT `FileAsset_uploaderId_fkey` FOREIGN KEY (`uploaderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileAsset` ADD CONSTRAINT `FileAsset_verifiedBy_fkey` FOREIGN KEY (`verifiedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileVersion` ADD CONSTRAINT `FileVersion_fileAssetId_fkey` FOREIGN KEY (`fileAssetId`) REFERENCES `FileAsset`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileVersion` ADD CONSTRAINT `FileVersion_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSubscription` ADD CONSTRAINT `UserSubscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSubscription` ADD CONSTRAINT `UserSubscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `SubscriptionPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UploadSubmission` ADD CONSTRAINT `UploadSubmission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UploadSubmission` ADD CONSTRAINT `UploadSubmission_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UploadSubmission` ADD CONSTRAINT `UploadSubmission_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UploadSubmission` ADD CONSTRAINT `UploadSubmission_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UploadSubmission` ADD CONSTRAINT `UploadSubmission_publishedFileId_fkey` FOREIGN KEY (`publishedFileId`) REFERENCES `FileAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileRequest` ADD CONSTRAINT `FileRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileRequest` ADD CONSTRAINT `FileRequest_assigneeId_fkey` FOREIGN KEY (`assigneeId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportTicket` ADD CONSTRAINT `SupportTicket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportTicket` ADD CONSTRAINT `SupportTicket_assigneeId_fkey` FOREIGN KEY (`assigneeId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketMessage` ADD CONSTRAINT `TicketMessage_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `SupportTicket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketMessage` ADD CONSTRAINT `TicketMessage_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DownloadEvent` ADD CONSTRAINT `DownloadEvent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DownloadEvent` ADD CONSTRAINT `DownloadEvent_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `FileAsset`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

