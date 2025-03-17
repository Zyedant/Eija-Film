/*
  Warnings:

  - You are about to drop the `buku` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `denda` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kategoribuku` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `koleksibuku` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `listkategori` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `listpeminjaman` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `peminjam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `peminjaman` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `petugas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ulasan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `denda` DROP FOREIGN KEY `Denda_peminjamanId_fkey`;

-- DropForeignKey
ALTER TABLE `koleksibuku` DROP FOREIGN KEY `KoleksiBuku_bukuId_fkey`;

-- DropForeignKey
ALTER TABLE `koleksibuku` DROP FOREIGN KEY `KoleksiBuku_peminjamId_fkey`;

-- DropForeignKey
ALTER TABLE `listkategori` DROP FOREIGN KEY `ListKategori_bukuId_fkey`;

-- DropForeignKey
ALTER TABLE `listkategori` DROP FOREIGN KEY `ListKategori_kategoriBukuId_fkey`;

-- DropForeignKey
ALTER TABLE `listpeminjaman` DROP FOREIGN KEY `ListPeminjaman_bukuId_fkey`;

-- DropForeignKey
ALTER TABLE `listpeminjaman` DROP FOREIGN KEY `ListPeminjaman_peminjamanId_fkey`;

-- DropForeignKey
ALTER TABLE `peminjaman` DROP FOREIGN KEY `Peminjaman_bukuId_fkey`;

-- DropForeignKey
ALTER TABLE `peminjaman` DROP FOREIGN KEY `Peminjaman_peminjamId_fkey`;

-- DropForeignKey
ALTER TABLE `peminjaman` DROP FOREIGN KEY `Peminjaman_petugasId_fkey`;

-- DropForeignKey
ALTER TABLE `ulasan` DROP FOREIGN KEY `Ulasan_bukuId_fkey`;

-- DropForeignKey
ALTER TABLE `ulasan` DROP FOREIGN KEY `Ulasan_peminjamId_fkey`;

-- DropTable
DROP TABLE `buku`;

-- DropTable
DROP TABLE `denda`;

-- DropTable
DROP TABLE `kategoribuku`;

-- DropTable
DROP TABLE `koleksibuku`;

-- DropTable
DROP TABLE `listkategori`;

-- DropTable
DROP TABLE `listpeminjaman`;

-- DropTable
DROP TABLE `peminjam`;

-- DropTable
DROP TABLE `peminjaman`;

-- DropTable
DROP TABLE `petugas`;

-- DropTable
DROP TABLE `ulasan`;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'AUTHOR', 'USER') NOT NULL,
    `emailVerifiedAt` DATETIME(3) NULL,
    `rememberToken` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL,
    `lastLogin` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordReset` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `isUsed` BOOLEAN NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Film` (
    `id_film` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `posterUrl` VARCHAR(191) NOT NULL,
    `trailerUrl` VARCHAR(191) NOT NULL,
    `duration` INTEGER NOT NULL,
    `releaseYear` INTEGER NOT NULL,
    `avgRating` DECIMAL(65, 30) NOT NULL DEFAULT 0.0,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_film`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Casting` (
    `id_casting` VARCHAR(191) NOT NULL,
    `realName` VARCHAR(191) NOT NULL,
    `photoUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_casting`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CastingRelation` (
    `id_casting_relation` VARCHAR(191) NOT NULL,
    `filmId` VARCHAR(191) NOT NULL,
    `castingId` VARCHAR(191) NOT NULL,
    `stageName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_casting_relation`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Genre` (
    `id_genre` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_genre`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GenreRelation` (
    `id` VARCHAR(191) NOT NULL,
    `filmId` VARCHAR(191) NOT NULL,
    `genreId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `id_comment` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `filmId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_comment`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rating` (
    `id_rating` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `filmId` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_rating`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bookmark` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `filmId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FilmView` (
    `id` VARCHAR(191) NOT NULL,
    `filmId` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NOT NULL,
    `userAgent` VARCHAR(191) NOT NULL,
    `viewedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `type` ENUM('SYSTEM', 'COMMENT', 'RATING') NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NOT NULL,
    `userAgent` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PasswordReset` ADD CONSTRAINT `PasswordReset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Film` ADD CONSTRAINT `Film_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CastingRelation` ADD CONSTRAINT `CastingRelation_filmId_fkey` FOREIGN KEY (`filmId`) REFERENCES `Film`(`id_film`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CastingRelation` ADD CONSTRAINT `CastingRelation_castingId_fkey` FOREIGN KEY (`castingId`) REFERENCES `Casting`(`id_casting`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GenreRelation` ADD CONSTRAINT `GenreRelation_filmId_fkey` FOREIGN KEY (`filmId`) REFERENCES `Film`(`id_film`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GenreRelation` ADD CONSTRAINT `GenreRelation_genreId_fkey` FOREIGN KEY (`genreId`) REFERENCES `Genre`(`id_genre`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_filmId_fkey` FOREIGN KEY (`filmId`) REFERENCES `Film`(`id_film`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_filmId_fkey` FOREIGN KEY (`filmId`) REFERENCES `Film`(`id_film`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bookmark` ADD CONSTRAINT `Bookmark_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bookmark` ADD CONSTRAINT `Bookmark_filmId_fkey` FOREIGN KEY (`filmId`) REFERENCES `Film`(`id_film`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FilmView` ADD CONSTRAINT `FilmView_filmId_fkey` FOREIGN KEY (`filmId`) REFERENCES `Film`(`id_film`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
