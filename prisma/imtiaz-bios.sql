-- IMTIAZ BIOS - full restore for XAMPP / phpMyAdmin
-- Generated 2026-10-04T07:00:44.808Z
-- Import: phpMyAdmin > Import > choose this file
-- Or CLI: mysql -u root < prisma/imtiaz-bios.sql

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS `imtiaz-bios`;
CREATE DATABASE `imtiaz-bios` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `imtiaz-bios`;


-- From prisma\migrations\20260927133000_init\migration.sql
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



-- From prisma\migrations\20260930112000_audit_actor_optional\migration.sql
-- Allow anonymous/system audit events (nullable actorId) and longer targetIds (emails)
ALTER TABLE `AuditLog` DROP FOREIGN KEY `AuditLog_actorId_fkey`;
ALTER TABLE `AuditLog` MODIFY `actorId` VARCHAR(36) NULL;
ALTER TABLE `AuditLog` MODIFY `targetId` VARCHAR(191) NOT NULL;
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;


-- ===================== DATA =====================

INSERT INTO `PlatformSettings` (`id`, `introEnabled`, `introDurationDays`, `introCoversAccessTypes`, `introCategoryIds`, `maxUploadBytes`, `allowedExtensions`, `allowedMimeTypes`) VALUES
('platform', 1, 183, '["free","paid"]', '["63da2b76-2079-42f4-ab31-dea08b5d67d5","e2ed5f28-ef78-4af1-85c6-c9367c9591a4","02817305-2304-4b31-8537-47bf401f76b4","580f555c-2862-4fd5-94bf-511ff027901e","0a3368db-06ae-42ed-8cf3-adab35220613","b4769f8f-38cf-4fcc-ada0-6543ce120fb9","854b78cb-535d-49fb-9508-ea848fb99505"]', 52428800, '[".bin",".rom",".bdv",".pdf",".zip",".rar",".7z",".txt",".hex"]', '["application/octet-stream","application/pdf","application/zip","application/x-zip-compressed","application/x-rar-compressed","application/x-7z-compressed","text/plain"]');

INSERT INTO `User` (`id`, `name`, `email`, `passwordHash`, `phone`, `country`, `role`, `status`, `trialStartDate`, `trialEndDate`, `subscriptionId`, `createdAt`, `updatedAt`) VALUES
('bbd2651d-a4b3-4659-8401-46efb3575683', 'Platform Admin', 'admin@imtiazbios.local', '$2b$10$D4J7Wd31KczW/UtQLuF2ROrK5VaXJJMpM0XstPGlxVcrmHQo5RZZO', '', '', 'ADMIN', 'Active', '2026-09-24T08:47:16.168Z', '2027-03-26T08:47:16.955Z', NULL, '2026-09-24T08:47:16.168Z', '2026-09-24T08:47:16.168Z'),
('b7372c97-87af-4a5e-8d7c-b5c046a54855', 'Lead Technician', 'tech@imtiazbios.local', '$2b$10$4nT8F6H0hBO1TKd4t2uihegG3FeVFkMsMKDEU8A7bIbFJ1Q7K2R3m', '', '', 'TECHNICIAN', 'Active', '2026-09-24T08:47:16.168Z', '2027-03-26T08:47:16.955Z', NULL, '2026-09-24T08:47:16.168Z', '2026-09-24T08:47:16.168Z'),
('6e542914-f038-4ed5-8f6d-2888a0d761e8', 'Demo Customer', 'user@imtiazbios.local', '$2b$10$MOV/UAyycE/N1JEM9a6V2ug2VxYG1s3qub99PnL1E32mr3POhh7w6', '', '', 'USER', 'Active', '2026-09-24T08:47:16.168Z', '2027-03-26T08:47:16.955Z', 'a613c64b-a335-423c-a629-899a06a0dd40', '2026-09-24T08:47:16.168Z', '2026-09-24T08:47:16.168Z'),
('2cb16ce0-ddda-4b44-95fe-7dc0b64064b6', 'Malaika  Rizwan', 'malaikarizwan121@gmail.com', '$2b$10$DsELo55LvUpfGvGQO6rKpOT61RRpbkvcz5q5XSP2Bm36gryG46n/W', '+923348351721', 'Pakistan', 'USER', 'Active', '2026-09-24T13:44:43.947Z', '2027-03-26T13:44:43.950Z', NULL, '2026-09-24T13:44:43.947Z', '2026-09-24T14:38:49.275Z'),
('f02da0e2-6653-498d-9412-205b01598a9a', 'sundas', 'malaikarizwan627@gmail.com', '$2b$10$nnevSM6e/bhDobWrlhdOdOmJO/Z3Mhf0gCdN.5F9ukm9c7TBOl5Vi', '', '', 'USER', 'Active', '2026-09-24T14:08:34.042Z', '2027-03-26T14:08:34.042Z', NULL, '2026-09-24T14:08:34.042Z', '2026-09-24T14:08:34.042Z'),
('e8e88b65-6768-40cb-8a8f-a7e73938b987', 'Test Admin', 'testmailmk92@gmail.com', '$2b$10$hEkVpIRBiDogauYTd.IrPe.aGdqw0TtvfRhdH7JA03Xk068vFWiwq', '', '', 'ADMIN', 'Active', '2026-09-24T14:16:22.457Z', '2027-03-26T14:16:22.457Z', NULL, '2026-09-24T14:16:22.457Z', '2026-09-24T14:54:24.566Z'),
('45f55605-7858-4f0d-bf1a-bdc5d9272751', 'eman', 'rmalaika180@gmail.com', '$2b$10$.O0WsSo5v.dJLlrLdQYWIuNqQxfky.gkI1n3o7xJnhhLdXeg2GCvK', '+923348351721', 'Pakistan', 'USER', 'Active', '2026-09-24T14:31:23.631Z', '2027-03-26T14:31:23.631Z', NULL, '2026-09-24T14:31:23.631Z', '2026-09-24T14:31:23.631Z');

INSERT INTO `Category` (`id`, `name`, `slug`, `description`, `parentCategory`, `active`, `sortOrder`, `createdAt`) VALUES
('63da2b76-2079-42f4-ab31-dea08b5d67d5', 'BIOS/Firmware', 'bios-firmware', 'BIOS/Firmware resources', NULL, 1, 1, '2026-09-24T08:47:16.168Z'),
('e2ed5f28-ef78-4af1-85c6-c9367c9591a4', 'Boardview', 'boardview', 'Boardview resources', NULL, 1, 2, '2026-09-24T08:47:16.168Z'),
('02817305-2304-4b31-8537-47bf401f76b4', 'Schematics', 'schematics', 'Schematics resources', NULL, 1, 3, '2026-09-24T08:47:16.168Z'),
('580f555c-2862-4fd5-94bf-511ff027901e', 'Service Manuals', 'service-manuals', 'Service Manuals resources', NULL, 1, 4, '2026-09-24T08:47:16.168Z'),
('0a3368db-06ae-42ed-8cf3-adab35220613', 'Recovery Software', 'recovery-software', 'Recovery Software resources', NULL, 1, 5, '2026-09-24T08:47:16.168Z'),
('b4769f8f-38cf-4fcc-ada0-6543ce120fb9', 'Diagnostic Tools', 'diagnostic-tools', 'Diagnostic Tools resources', NULL, 1, 6, '2026-09-24T08:47:16.168Z'),
('854b78cb-535d-49fb-9508-ea848fb99505', 'Other', 'other', 'Other resources', NULL, 1, 7, '2026-09-24T08:47:16.168Z');

INSERT INTO `Brand` (`id`, `name`, `slug`, `description`, `logo`, `active`, `createdAt`) VALUES
('880ba722-25e3-4258-933e-9641eeb0344d', 'Dell', 'dell', 'Dell', NULL, 1, '2026-09-24T08:47:16.168Z'),
('58d5034b-20a9-4ec1-8112-e82987db8b44', 'HP', 'hp', 'HP', NULL, 1, '2026-09-24T08:47:16.168Z'),
('1823cecb-cc28-4d7f-b18a-9c1e43aa17ba', 'Lenovo', 'lenovo', 'Lenovo', NULL, 1, '2026-09-24T08:47:16.168Z'),
('f8dfd445-9a31-4c41-9cb3-77a90730d6f9', 'Toshiba', 'toshiba', 'Toshiba', NULL, 1, '2026-09-24T08:47:16.168Z'),
('c38eb237-579f-45c6-b84d-83d213db72fa', 'Microsoft Surface', 'microsoft-surface', 'Microsoft Surface', NULL, 1, '2026-09-24T08:47:16.168Z'),
('430494d1-76b4-44e1-9a4b-13da7ad370f6', 'Apple', 'apple', 'Apple', NULL, 1, '2026-09-24T08:47:16.168Z'),
('758c7a6c-f361-4fbb-9875-ec3f42ac7da2', 'Asus', 'asus', 'Asus', NULL, 1, '2026-09-24T08:47:16.168Z'),
('df507def-d6a3-4d4c-8aa4-f97c7f0e572d', 'Acer', 'acer', 'Acer', NULL, 1, '2026-09-24T08:47:16.168Z'),
('75671e99-2b2d-473a-9425-35b0c061d9b7', 'Chromebook', 'chromebook', 'Chromebook', NULL, 1, '2026-09-24T08:47:16.168Z'),
('b9b537a1-83cf-4d3d-a523-e527d52bb0e3', 'Other', 'other', 'Other', NULL, 1, '2026-09-24T08:47:16.168Z');

INSERT INTO `SubscriptionPlan` (`id`, `name`, `durationDays`, `price`, `features`, `active`, `createdAt`) VALUES
('55eaf577-ac84-444f-95c5-aadeb4c67016', 'Monthly Pro', 30, 29, '["All paid library files","Priority support","Unlimited downloads"]', 1, '2026-09-24T08:47:16.168Z'),
('380a702e-9cec-4c06-a571-353038e826dd', 'Yearly Pro', 365, 249, '["All paid library files","Priority support","2 months free"]', 1, '2026-09-24T08:47:16.168Z');

INSERT INTO `ServiceItem` (`id`, `name`, `description`, `price`, `icon`, `active`, `featured`, `createdAt`, `updatedAt`) VALUES
('3ccadd55-1682-4ff0-b93c-de532f77a83c', 'BIOS Repair', 'Corrupt BIOS recovery and flashing assistance.', 49, '🔧', 1, 1, '2026-09-24T08:47:16.168Z', '2026-09-24T08:47:16.168Z'),
('d4f43c20-c989-4d57-8a38-4fdcac27013d', 'Password Removal', 'Authorized firmware password recovery service.', 79, '🔑', 1, 1, '2026-09-24T08:47:16.168Z', '2026-09-24T08:47:16.168Z');

INSERT INTO `FileAsset` (`id`, `name`, `originalName`, `storageKey`, `categoryId`, `brandId`, `boardNumber`, `modelNumber`, `fileType`, `version`, `sizeBytes`, `description`, `compatibility`, `tags`, `verificationStatus`, `verificationNote`, `verifiedBy`, `verifiedAt`, `status`, `accessType`, `price`, `uploaderId`, `downloadCount`, `publishedAt`, `createdAt`, `updatedAt`) VALUES
('aedf5bc5-c516-489d-bf6a-8fab05448543', 'Latitude 5490 BIOS A18', 'latitude-5490-a18.bin', 'seed-demo-no-binary', '63da2b76-2079-42f4-ab31-dea08b5d67d5', '880ba722-25e3-4258-933e-9641eeb0344d', 'LA-F401P', 'Latitude 5490', 'BIOS', 'A18', 16777216, 'Official Dell Latitude 5490 BIOS dump A18.', 'Latitude 5490 / Precision 3530', '["dell","latitude","bios"]', 'verified', NULL, NULL, NULL, 'published', 'free', 0, 'bbd2651d-a4b3-4659-8401-46efb3575683', 42, '2026-09-24T08:47:16.168Z', '2026-09-24T08:47:16.168Z', '2026-09-24T08:47:16.168Z'),
('52e9ed11-e38c-4157-9e31-fbba529abfe4', 'EliteBook 840 G5 Boardview', '840g5-boardview.bdv', 'seed-demo-no-binary', 'e2ed5f28-ef78-4af1-85c6-c9367c9591a4', '58d5034b-20a9-4ec1-8112-e82987db8b44', '6050A2858301', 'EliteBook 840 G5', 'Boardview', '1.0', 4200000, 'HP EliteBook 840 G5 boardview.', '840 G5 / 840 G6 (partial)', '["hp","boardview"]', 'verified', NULL, NULL, NULL, 'published', 'paid', 12, 'bbd2651d-a4b3-4659-8401-46efb3575683', 18, '2026-09-24T08:47:16.168Z', '2026-09-24T08:47:16.168Z', '2026-09-24T08:47:16.168Z');

-- (no rows for FileVersion)
INSERT INTO `UserSubscription` (`id`, `userId`, `planId`, `status`, `startsAt`, `endsAt`, `paymentId`, `createdAt`) VALUES
('a613c64b-a335-423c-a629-899a06a0dd40', '6e542914-f038-4ed5-8f6d-2888a0d761e8', '380a702e-9cec-4c06-a571-353038e826dd', 'active', '2026-09-24T08:57:01.567Z', '2027-10-24T08:57:01.567Z', 'a6500267-8013-459f-ac11-f8ade18b65d3', '2026-09-24T08:57:01.567Z'),
('cf8035c9-2137-4324-9df3-790fe843134c', '6e542914-f038-4ed5-8f6d-2888a0d761e8', '380a702e-9cec-4c06-a571-353038e826dd', 'cancelled', '2026-09-24T08:56:55.254Z', '2027-09-24T08:56:55.254Z', '160f6b60-0e68-49c3-9291-462cc499dc93', '2026-09-24T08:56:55.254Z');

INSERT INTO `UploadSubmission` (`id`, `userId`, `originalName`, `storageKey`, `mimeType`, `sizeBytes`, `categoryId`, `brandId`, `boardNumber`, `modelNumber`, `fileType`, `version`, `description`, `notes`, `status`, `reviewerId`, `reviewNote`, `publishedFileId`, `createdAt`, `updatedAt`) VALUES
('bfc240b7-13a5-42fd-a720-4a97da89d02e', '2cb16ce0-ddda-4b44-95fe-7dc0b64064b6', 'Malaika_CV (1).pdf', '2c3d33b8315ddcd943631d62457cbe12.pdf', 'application/pdf', 85037, '63da2b76-2079-42f4-ab31-dea08b5d67d5', '880ba722-25e3-4258-933e-9641eeb0344d', 'TESTING4', 'testing4', 'BIOS', '1.0', 'testing4', 'testing4', 'pending', NULL, NULL, NULL, '2026-09-24T13:46:16.749Z', '2026-09-24T13:46:16.749Z'),
('2e81ac07-99c3-43dd-9e1c-eccb2d2fafd1', '2cb16ce0-ddda-4b44-95fe-7dc0b64064b6', 'NM-B441.bin', 'd8566867041f989c826fdcac10f7147f.bin', 'application/octet-stream', 34, '63da2b76-2079-42f4-ab31-dea08b5d67d5', '880ba722-25e3-4258-933e-9641eeb0344d', 'TESTING4', 'testing4', 'BIOS', '1.0', 'testing4', 'testing4', 'pending', NULL, NULL, NULL, '2026-09-24T13:45:42.221Z', '2026-09-24T13:45:42.221Z'),
('b9060418-8637-44c6-ad5b-eeee9f51541c', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'Malaika_CV (1).pdf', '34ee74751be804cb76d17d7b890e8562.pdf', 'application/pdf', 85037, '63da2b76-2079-42f4-ab31-dea08b5d67d5', '880ba722-25e3-4258-933e-9641eeb0344d', 'TESTING4', 'testing4', 'BIOS', '1.0', 'testing4', 'testing4', 'pending', NULL, NULL, NULL, '2026-09-24T13:17:53.430Z', '2026-09-24T13:17:53.430Z'),
('25f4fee7-905f-4895-87d0-5060e7f068ef', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'NM-B441.bin', '45e6e455e670ef9fc5184022702f013c.bin', 'application/octet-stream', 34, '02817305-2304-4b31-8537-47bf401f76b4', 'f8dfd445-9a31-4c41-9cb3-77a90730d6f9', 'UPLOADED FILES', 'Uploaded files', 'BIOS', '1.0', 'Uploaded files', 'Uploaded files', 'pending', NULL, NULL, NULL, '2026-09-24T13:16:53.947Z', '2026-09-24T13:16:53.947Z'),
('d0403b73-d9b9-4de9-8b23-9dffe0a98f70', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'LA-H994P.bin', 'bfd5c3d4570eec02b1adc646aee20d3c.bin', 'application/octet-stream', 48, '02817305-2304-4b31-8537-47bf401f76b4', 'b9b537a1-83cf-4d3d-a523-e527d52bb0e3', 'TESTING3', 'testing3', 'BIOS', '1.0', 'testing3', 'testing3', 'pending', NULL, NULL, NULL, '2026-09-24T13:14:47.916Z', '2026-09-24T13:14:47.916Z'),
('fa18b9da-2bb3-436b-804f-e49f10288d42', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'requirements.txt', '2986b696a834b257653c0bcd6bc7b97e.txt', 'text/plain', 260, '0a3368db-06ae-42ed-8cf3-adab35220613', '58d5034b-20a9-4ec1-8112-e82987db8b44', 'TESTING2', 'teting2', 'BIOS', '1.000', '2testjknkncfloaw., skflk', '2testjknkncfloaw., skflk', 'pending', NULL, NULL, NULL, '2026-09-24T13:13:03.104Z', '2026-09-24T13:13:03.104Z'),
('dbd73395-95de-4685-bede-f513809b711a', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'requirements.txt', 'd0fa9ce000edb91e4ef3dab0ecc9bbdd.txt', 'text/plain', 260, '63da2b76-2079-42f4-ab31-dea08b5d67d5', '880ba722-25e3-4258-933e-9641eeb0344d', 'TESTING', 'teting', 'BIOS', '1.0', 'ttttttttttttttt', 'ttttttttttttttt', 'pending', NULL, NULL, NULL, '2026-09-24T08:56:31.392Z', '2026-09-24T08:56:31.392Z'),
('3d3e7db8-22e8-48cc-96e3-3a0f2338aa7f', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'IMTIAZ_BIOS_Complete_SRS_v1.0.pdf', 'e94899082af3e41113cb1ffa440ae3b3.pdf', 'application/pdf', 530464, '63da2b76-2079-42f4-ab31-dea08b5d67d5', '880ba722-25e3-4258-933e-9641eeb0344d', 'TESTING', 'teting', 'BIOS', '1.0', 'tttttttttttttttt', 'tttttttttttttttt', 'pending', NULL, NULL, NULL, '2026-09-24T08:53:24.734Z', '2026-09-24T08:53:24.734Z'),
('b2e480ed-9556-43d4-b0b7-823618dc3565', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'LA-H994P.bin', '2faf00383a064eb20d855f0fe64b3ab1.bin', 'application/octet-stream', 48, '580f555c-2862-4fd5-94bf-511ff027901e', '758c7a6c-f361-4fbb-9875-ec3f42ac7da2', 'TESTING', 'teting', 'BIOS', '1.0', 'tttttttttttt', 'tttttttttttt', 'pending', NULL, NULL, NULL, '2026-09-24T08:53:01.958Z', '2026-09-24T08:53:01.958Z');

INSERT INTO `FileRequest` (`id`, `requestNumber`, `userId`, `boardModel`, `brand`, `typeNeeded`, `description`, `attachments`, `status`, `assigneeId`, `createdAt`, `updatedAt`) VALUES
('2f04b0d5-ba0b-4e3c-a726-c25c8fc9ee00', 'REQ-000002', '2cb16ce0-ddda-4b44-95fe-7dc0b64064b6', 'TESTING', 'Chromebook', 'BIOS', '77777777777777777777777777', '[]', 'pending', NULL, '2026-09-24T13:46:58.163Z', '2026-09-24T13:46:58.163Z'),
('7c3a8cd5-e15f-4194-a36c-911b7f24a153', 'REQ-000001', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'TESTING', 'Dell', 'BIOS', 'testingggggg', '[]', 'pending', NULL, '2026-09-24T08:50:01.588Z', '2026-09-24T08:50:01.588Z');

-- (no rows for SupportTicket)
-- (no rows for TicketMessage)
INSERT INTO `Notification` (`id`, `userId`, `type`, `title`, `body`, `href`, `read`, `createdAt`) VALUES
('88b5865b-f8e4-4431-8900-743e96f60bb7', '45f55605-7858-4f0d-bf1a-bdc5d9272751', 'welcome', 'Welcome to IMTIAZ BIOS', 'Your introductory access is active until 26/03/2027.', '/portal', 0, '2026-09-24T14:31:23.812Z'),
('7c136224-aa59-4cbe-9c9d-6701da2ac7ca', 'e8e88b65-6768-40cb-8a8f-a7e73938b987', 'welcome', 'Welcome to IMTIAZ BIOS', 'Your introductory access is active until 26/03/2027.', '/portal', 0, '2026-09-24T14:16:22.644Z'),
('d2cd8ecb-f1f2-4990-bbea-7a937453edba', 'f02da0e2-6653-498d-9412-205b01598a9a', 'welcome', 'Welcome to IMTIAZ BIOS', 'Your introductory access is active until 26/03/2027.', '/portal', 0, '2026-09-24T14:08:34.214Z'),
('4d1be025-63af-4e47-b5a0-0548a83d3ca6', '2cb16ce0-ddda-4b44-95fe-7dc0b64064b6', 'request', 'File request submitted', 'REQ-000002 is pending review.', '/portal/requests', 0, '2026-09-24T13:46:58.163Z'),
('b1f8e122-259b-41f3-a7c2-2d4b861287a6', '2cb16ce0-ddda-4b44-95fe-7dc0b64064b6', 'upload', 'Upload received', 'Malaika_CV (1).pdf is pending review.', '/portal/uploads', 0, '2026-09-24T13:46:16.749Z'),
('855c3197-e499-4da9-ac44-931c69cad875', '2cb16ce0-ddda-4b44-95fe-7dc0b64064b6', 'upload', 'Upload received', 'NM-B441.bin is pending review.', '/portal/uploads', 0, '2026-09-24T13:45:42.222Z'),
('ca589fda-e882-4afa-be01-e7df3ee126b6', '2cb16ce0-ddda-4b44-95fe-7dc0b64064b6', 'welcome', 'Welcome to IMTIAZ BIOS', 'Your introductory access is active until 26/03/2027.', '/portal', 0, '2026-09-24T13:44:44.176Z'),
('3865c84c-a9f3-417c-9c36-d9f7ac407850', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'upload', 'Upload received', 'Malaika_CV (1).pdf is pending review.', '/portal/uploads', 0, '2026-09-24T13:17:53.430Z'),
('6bc71ef7-8121-4195-bd96-094a8bfcb125', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'upload', 'Upload received', 'NM-B441.bin is pending review.', '/portal/uploads', 0, '2026-09-24T13:16:53.947Z'),
('9dc2c6ac-30da-4025-90ea-7348ae7abe0d', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'upload', 'Upload received', 'LA-H994P.bin is pending review.', '/portal/uploads', 0, '2026-09-24T13:14:47.916Z'),
('06d4b151-1696-4109-ad1d-3a70ed8498c4', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'upload', 'Upload received', 'requirements.txt is pending review.', '/portal/uploads', 0, '2026-09-24T13:13:03.104Z'),
('81d327eb-3a36-497c-8695-d6dc8782dc3b', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'subscription', 'Subscription renewed', 'Yearly Pro extended to 24/10/2027.', '/portal/subscription', 0, '2026-09-24T08:57:04.627Z'),
('e498a37d-5e88-41bc-9135-1792f2643bdd', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'payment', 'Payment successful', 'Subscribed to Monthly Pro (demo payment).', '/portal/payments', 0, '2026-09-24T08:57:01.568Z'),
('5b7ca34f-6099-4938-a1a7-c1b51d71a75b', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'subscription', 'Subscription cancelled', 'Your subscription has been cancelled.', '/portal/subscription', 0, '2026-09-24T08:56:59.280Z'),
('5602a848-960b-4027-adad-9fe7a36a09c3', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'payment', 'Payment successful', 'Subscribed to Yearly Pro (demo payment).', '/portal/payments', 0, '2026-09-24T08:56:55.255Z'),
('b87a6c75-8e17-4fd2-96c9-c52f745a93a3', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'upload', 'Upload received', 'requirements.txt is pending review.', '/portal/uploads', 0, '2026-09-24T08:56:31.392Z'),
('499bfb57-c7e3-4db2-b296-1f371a92062b', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'upload', 'Upload received', 'IMTIAZ_BIOS_Complete_SRS_v1.0.pdf is pending review.', '/portal/uploads', 1, '2026-09-24T08:53:24.734Z'),
('6c890653-0fd5-483a-b69b-8b583277f5cf', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'upload', 'Upload received', 'LA-H994P.bin is pending review.', '/portal/uploads', 0, '2026-09-24T08:53:01.958Z'),
('5115cfd1-3f74-4591-a0cc-ab01db403175', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'request', 'File request submitted', 'REQ-000001 is pending review.', '/portal/requests', 0, '2026-09-24T08:50:01.590Z');

-- (no rows for DownloadEvent)
INSERT INTO `Payment` (`id`, `userId`, `amount`, `currency`, `paymentMethod`, `transactionId`, `status`, `purpose`, `createdAt`) VALUES
('a6500267-8013-459f-ac11-f8ade18b65d3', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 249, 'USD', 'demo', 'demo_a6500267', 'paid', 'subscription:380a702e-9cec-4c06-a571-353038e826dd', '2026-09-24T08:57:04.390Z'),
('5bbfe64e-9a97-4559-800c-bd7e30a843f2', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 29, 'USD', 'demo', 'demo_5bbfe64e', 'paid', 'subscription:55eaf577-ac84-444f-95c5-aadeb4c67016', '2026-09-24T08:57:01.567Z'),
('160f6b60-0e68-49c3-9291-462cc499dc93', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 249, 'USD', 'demo', 'demo_160f6b60', 'paid', 'subscription:380a702e-9cec-4c06-a571-353038e826dd', '2026-09-24T08:56:55.254Z');

INSERT INTO `PasswordResetToken` (`id`, `userId`, `tokenHash`, `expiresAt`, `usedAt`, `createdAt`) VALUES
('ed379a33-df6b-4ce6-9ad2-c79a40aa5096', '2cb16ce0-ddda-4b44-95fe-7dc0b64064b6', 'ab0751c615d3f35f13277c4393996d46b44ee67534643aad3bfe4e13b9f71f94', '2026-09-24T15:37:29.445Z', '2026-09-24T14:38:49.275Z', '2026-09-24T14:37:29.445Z');

INSERT INTO `AuditLog` (`id`, `actorId`, `action`, `targetType`, `targetId`, `summary`, `before`, `after`, `createdAt`) VALUES
('aaff64b9-2b3a-42e0-88ec-d241d6789c01', '2cb16ce0-ddda-4b44-95fe-7dc0b64064b6', 'auth.login', 'user', '2cb16ce0-ddda-4b44-95fe-7dc0b64064b6', 'Login success role=USER (ip=::1)', NULL, NULL, '2026-09-24T14:39:19.518Z'),
('93139106-d285-4769-9ca5-19a7601ae6ab', '2cb16ce0-ddda-4b44-95fe-7dc0b64064b6', 'auth.login_failed', 'user', '2cb16ce0-ddda-4b44-95fe-7dc0b64064b6', 'Failed login — bad password (ip=::1)', NULL, NULL, '2026-09-24T14:39:15.445Z'),
('2bdf7376-3cdb-44c4-9fd2-55c75ec9b22b', '2cb16ce0-ddda-4b44-95fe-7dc0b64064b6', 'auth.login', 'user', '2cb16ce0-ddda-4b44-95fe-7dc0b64064b6', 'Login success role=USER (ip=::1)', NULL, NULL, '2026-09-24T14:03:47.763Z'),
('f3963dc1-9b2d-4d47-aeaa-2b977cbbe855', 'anonymous', 'auth.login_failed', 'user', 'malaikarizwan561@gmail.com', 'Failed login for unknown/invalid email (ip=::1)', NULL, NULL, '2026-09-24T14:03:36.242Z'),
('c155dd2d-afa2-4f79-82ee-831380745469', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'auth.login', 'user', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'Login success role=USER (ip=::1)', NULL, NULL, '2026-09-24T13:12:16.801Z'),
('4584201e-94f6-4d66-8a9c-ee2321e0d957', 'anonymous', 'auth.login_failed', 'user', 'jazibjazib@yopmail.com', 'Failed login for unknown/invalid email (ip=::1)', NULL, NULL, '2026-09-24T13:11:47.952Z'),
('f1b8af8d-19b8-499f-aa6d-99f0af2f4505', 'bbd2651d-a4b3-4659-8401-46efb3575683', 'auth.login', 'user', 'bbd2651d-a4b3-4659-8401-46efb3575683', 'Login success role=ADMIN (ip=::1)', NULL, NULL, '2026-09-24T12:50:25.549Z'),
('2435256d-e6a8-4f35-adb2-61ba791d100b', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'auth.login_failed', 'user', '6e542914-f038-4ed5-8f6d-2888a0d761e8', 'Failed login — bad password (ip=::1)', NULL, NULL, '2026-09-24T12:50:17.614Z');


-- Prisma migration history (so prisma migrate doesn't re-apply)
CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
  `id` VARCHAR(36) NOT NULL,
  `checksum` VARCHAR(64) NOT NULL,
  `finished_at` DATETIME(3) NULL,
  `migration_name` VARCHAR(255) NOT NULL,
  `logs` TEXT NULL,
  `rolled_back_at` DATETIME(3) NULL,
  `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('00000000-0000-4000-8000-000000000001', 'imported-manually', NOW(3), '20260927133000_init', NULL, NULL, NOW(3), 1),
('00000000-0000-4000-8000-000000000002', 'imported-manually', NOW(3), '20260930112000_audit_actor_optional', NULL, NULL, NOW(3), 1);

SET FOREIGN_KEY_CHECKS = 1;

-- Demo logins (from seed / backup):
-- admin@imtiazbios.local / Admin123!
-- tech@imtiazbios.local / Tech123!
-- user@imtiazbios.local / User123!
