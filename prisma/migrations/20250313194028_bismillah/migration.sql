/*
  Warnings:

  - You are about to drop the column `parentId` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `film` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `film` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifiedAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `lastLogin` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `rememberToken` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `comment` DROP COLUMN `parentId`,
    DROP COLUMN `status`;

-- AlterTable
ALTER TABLE `film` DROP COLUMN `publishedAt`,
    DROP COLUMN `viewCount`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `emailVerifiedAt`,
    DROP COLUMN `lastLogin`,
    DROP COLUMN `rememberToken`;
