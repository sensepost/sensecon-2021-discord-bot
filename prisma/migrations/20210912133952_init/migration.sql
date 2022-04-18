-- CreateTable
CREATE TABLE `members` (
    `user_id` BIGINT NOT NULL,
    `email` VARCHAR(191),
    `otp` INTEGER,
    `has_left` BOOLEAN NOT NULL DEFAULT false,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `user_name` VARCHAR(191),
    `nickname` VARCHAR(191),
    `discriminator` VARCHAR(191),
    `status` VARCHAR(191) NOT NULL DEFAULT 'offline',
    `state` VARCHAR(191),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `members_user_id_key`(`user_id`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `avatar` VARCHAR(191),
    `avatar_url` VARCHAR(191),
    `user_name` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191),
    `discriminator` VARCHAR(191),
    `member_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_status_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191),
    `member_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_logs` (
    `message_id` BIGINT NOT NULL,
    `created` BIGINT NOT NULL,
    `channel_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `user_name` VARCHAR(191) NOT NULL,
    `is_dm` BOOLEAN NOT NULL,
    `is_bot` BOOLEAN NOT NULL DEFAULT false,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `is_edited` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `message_logs_message_id_key`(`message_id`),
    PRIMARY KEY (`message_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `command_logs` (
    `message_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `user_name` VARCHAR(191) NOT NULL,
    `prefix` CHAR(1) NOT NULL,
    `command` VARCHAR(191) NOT NULL,
    `success` BOOLEAN NOT NULL DEFAULT true,
    `reason` VARCHAR(191),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `command_logs_message_id_key`(`message_id`),
    PRIMARY KEY (`message_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `statistics` (
    `event` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `statistics_event_key`(`event`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `flag_logs` (
    `message_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `user_name` VARCHAR(191) NOT NULL,
    `flag` VARCHAR(191) NOT NULL,
    `success` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `flag_logs_message_id_key`(`message_id`),
    PRIMARY KEY (`message_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tic_tac_toe_tracker` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `member_id` BIGINT NOT NULL,
    `winner` ENUM('user', 'bot') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `defcon_levels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `level` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bot_activites` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `activity` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_challenges` (
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `password_challenges_name_key`(`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_clears` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `challenge_name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_clears` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `member_id` BIGINT NOT NULL,
    `password_id` INTEGER NOT NULL,
    `challenge_name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `member_logs` ADD CONSTRAINT `member_logs_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_status_logs` ADD CONSTRAINT `member_status_logs_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tic_tac_toe_tracker` ADD CONSTRAINT `tic_tac_toe_tracker_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_clears` ADD CONSTRAINT `password_clears_challenge_name_fkey` FOREIGN KEY (`challenge_name`) REFERENCES `password_challenges`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_clears` ADD CONSTRAINT `member_clears_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_clears` ADD CONSTRAINT `member_clears_password_id_fkey` FOREIGN KEY (`password_id`) REFERENCES `password_clears`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_clears` ADD CONSTRAINT `member_clears_challenge_name_fkey` FOREIGN KEY (`challenge_name`) REFERENCES `password_challenges`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;
