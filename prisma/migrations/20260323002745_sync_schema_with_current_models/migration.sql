/*
  Warnings:

  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `parentId` VARCHAR(191) NULL,
    ADD COLUMN `state` VARCHAR(100) NULL,
    MODIFY `role` ENUM('MASTER', 'SUPERMASTER', 'ADMIN', 'ADVISER') NOT NULL DEFAULT 'MASTER';

-- CreateTable
CREATE TABLE `subscriptions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `planType` ENUM('TRIAL', 'BASIC', 'ADVANCED') NOT NULL DEFAULT 'TRIAL',
    `status` ENUM('ACTIVE', 'EXPIRED', 'CANCELED') NOT NULL DEFAULT 'ACTIVE',
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NOT NULL,
    `whatsappLimit` INTEGER NOT NULL DEFAULT 1,
    `advisorsLimit` INTEGER NOT NULL DEFAULT 10,
    `shopsLimit` INTEGER NOT NULL DEFAULT 5,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscriptions_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription_payments` (
    `id` VARCHAR(191) NOT NULL,
    `subscriptionId` VARCHAR(191) NOT NULL,
    `purchaseNumber` VARCHAR(191) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'PEN',
    `planType` ENUM('TRIAL', 'BASIC', 'ADVANCED') NOT NULL DEFAULT 'BASIC',
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `transactionId` VARCHAR(191) NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscription_payments_purchaseNumber_key`(`purchaseNumber`),
    UNIQUE INDEX `subscription_payments_transactionId_key`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `whatsapp_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(20) NOT NULL,
    `metaPhoneNumberId` VARCHAR(255) NOT NULL,
    `wabaId` VARCHAR(255) NULL,
    `accessToken` VARCHAR(500) NOT NULL,
    `pin` VARCHAR(500) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isWebhookConnected` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `whatsapp_accounts_metaPhoneNumberId_key`(`metaPhoneNumberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_configs` (
    `id` VARCHAR(191) NOT NULL,
    `whatsAppAccountId` VARCHAR(191) NOT NULL,
    `provider` ENUM('OPENAI', 'GOOGLE', 'ANTHROPIC') NOT NULL DEFAULT 'GOOGLE',
    `model` ENUM('GPT_4O', 'GP_4_TURBO', 'GPT_3_5_TURBO', 'GEMINI_2_0_FLASH', 'GEMINI_2_0_FLASH_LITE', 'GEMINI_2_5_FLASH', 'CLAUDE_3_5_SONNET') NOT NULL DEFAULT 'GEMINI_2_0_FLASH',
    `apiKey` VARCHAR(500) NULL,
    `isAssistantEnabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ai_configs_whatsAppAccountId_key`(`whatsAppAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stores` (
    `id` VARCHAR(191) NOT NULL,
    `whatsAppAccountId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `domain` VARCHAR(255) NULL,
    `externalStoreId` VARCHAR(255) NULL,
    `code` VARCHAR(1000) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(191) NOT NULL,
    `storeId` VARCHAR(191) NOT NULL,
    `externalProductId` VARCHAR(255) NULL,
    `name` VARCHAR(500) NOT NULL,
    `description` VARCHAR(2000) NULL,
    `price` DECIMAL(10, 2) NULL,
    `currency` VARCHAR(10) NULL DEFAULT 'PEN',
    `stock` INTEGER NULL DEFAULT 0,
    `sku` VARCHAR(100) NULL,
    `imageUrl` VARCHAR(1000) NULL,
    `videoUrl` VARCHAR(1000) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `whatsapp_templates` (
    `id` VARCHAR(191) NOT NULL,
    `whatsAppAccountId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(255) NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'es',
    `status` VARCHAR(50) NULL,
    `templateType` ENUM('AGENCY', 'GENERIC', 'CASH_ON_DELIVERY') NULL,
    `content` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quick_responses` (
    `id` VARCHAR(191) NOT NULL,
    `whatsAppAccountId` VARCHAR(191) NOT NULL,
    `keyword` VARCHAR(255) NOT NULL,
    `responseMessage` VARCHAR(2000) NOT NULL,
    `imageUrl` VARCHAR(1000) NULL,
    `videoUrl` VARCHAR(1000) NULL,
    `isConfirmed` BOOLEAN NOT NULL DEFAULT false,
    `isInformative` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chats` (
    `id` VARCHAR(191) NOT NULL,
    `whatsAppAccountId` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(20) NOT NULL,
    `customerName` VARCHAR(255) NULL,
    `unreadCount` INTEGER NOT NULL DEFAULT 0,
    `lastMessageContent` TEXT NULL,
    `lastMessageAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `chats_whatsAppAccountId_customerPhone_key`(`whatsAppAccountId`, `customerPhone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` VARCHAR(191) NOT NULL,
    `chatId` VARCHAR(191) NOT NULL,
    `waMessageId` VARCHAR(255) NULL,
    `direction` ENUM('INBOUND', 'OUTBOUND') NOT NULL,
    `type` ENUM('TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT', 'TEMPLATE', 'STICKER', 'REACTION') NOT NULL DEFAULT 'TEXT',
    `content` TEXT NULL,
    `mediaId` VARCHAR(255) NULL,
    `mediaUrl` VARCHAR(1000) NULL,
    `mimeType` VARCHAR(100) NULL,
    `status` ENUM('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'DELETED') NOT NULL DEFAULT 'SENT',
    `sentByAI` BOOLEAN NOT NULL DEFAULT false,
    `errorCode` INTEGER NULL,
    `errorDetails` TEXT NULL,
    `quotedMessageId` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `messages_waMessageId_key`(`waMessageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `labels` (
    `id` VARCHAR(191) NOT NULL,
    `whatsAppAccountId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `color` VARCHAR(7) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tutorial_modules` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tutorial_questions` (
    `id` VARCHAR(191) NOT NULL,
    `moduleId` VARCHAR(191) NOT NULL,
    `question` TEXT NOT NULL,
    `answer` TEXT NOT NULL,
    `videoUrl` VARCHAR(255) NULL,
    `documentUrl` VARCHAR(255) NULL,
    `imageUrl` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ChatLabels` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ChatLabels_AB_unique`(`A`, `B`),
    INDEX `_ChatLabels_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription_payments` ADD CONSTRAINT `subscription_payments_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `whatsapp_accounts` ADD CONSTRAINT `whatsapp_accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_configs` ADD CONSTRAINT `ai_configs_whatsAppAccountId_fkey` FOREIGN KEY (`whatsAppAccountId`) REFERENCES `whatsapp_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_whatsAppAccountId_fkey` FOREIGN KEY (`whatsAppAccountId`) REFERENCES `whatsapp_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `whatsapp_templates` ADD CONSTRAINT `whatsapp_templates_whatsAppAccountId_fkey` FOREIGN KEY (`whatsAppAccountId`) REFERENCES `whatsapp_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quick_responses` ADD CONSTRAINT `quick_responses_whatsAppAccountId_fkey` FOREIGN KEY (`whatsAppAccountId`) REFERENCES `whatsapp_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `chats_whatsAppAccountId_fkey` FOREIGN KEY (`whatsAppAccountId`) REFERENCES `whatsapp_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `labels` ADD CONSTRAINT `labels_whatsAppAccountId_fkey` FOREIGN KEY (`whatsAppAccountId`) REFERENCES `whatsapp_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tutorial_questions` ADD CONSTRAINT `tutorial_questions_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `tutorial_modules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ChatLabels` ADD CONSTRAINT `_ChatLabels_A_fkey` FOREIGN KEY (`A`) REFERENCES `chats`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ChatLabels` ADD CONSTRAINT `_ChatLabels_B_fkey` FOREIGN KEY (`B`) REFERENCES `labels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
