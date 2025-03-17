/*
  Warnings:

  - Added the required column `commentId` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `rating` ADD COLUMN `commentId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `Comment`(`id_comment`) ON DELETE RESTRICT ON UPDATE CASCADE;
