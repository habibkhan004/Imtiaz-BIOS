-- Allow anonymous/system audit events (nullable actorId) and longer targetIds (emails)
ALTER TABLE `AuditLog` DROP FOREIGN KEY `AuditLog_actorId_fkey`;
ALTER TABLE `AuditLog` MODIFY `actorId` VARCHAR(36) NULL;
ALTER TABLE `AuditLog` MODIFY `targetId` VARCHAR(191) NOT NULL;
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
