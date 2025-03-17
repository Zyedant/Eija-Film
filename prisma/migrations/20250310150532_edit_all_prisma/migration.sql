/*
  Warnings:

  - You are about to drop the `filmview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `session` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `Film` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `filmview` DROP FOREIGN KEY `FilmView_filmId_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_userId_fkey`;

-- DropForeignKey
ALTER TABLE `session` DROP FOREIGN KEY `Session_userId_fkey`;

-- AlterTable
ALTER TABLE `film` ADD COLUMN `category` ENUM('MOVIE', 'SERIES', 'ANIME') NOT NULL;

-- DropTable
DROP TABLE `filmview`;

-- DropTable
DROP TABLE `notification`;

-- DropTable
DROP TABLE `session`;
