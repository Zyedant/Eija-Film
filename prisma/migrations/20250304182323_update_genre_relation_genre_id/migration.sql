/*
  Warnings:

  - You are about to alter the column `genreId` on the `genrerelation` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- DropForeignKey
ALTER TABLE `genrerelation` DROP FOREIGN KEY `GenreRelation_genreId_fkey`;

-- DropIndex
DROP INDEX `GenreRelation_genreId_fkey` ON `genrerelation`;

-- AlterTable
ALTER TABLE `genrerelation` MODIFY `genreId` JSON NOT NULL;
