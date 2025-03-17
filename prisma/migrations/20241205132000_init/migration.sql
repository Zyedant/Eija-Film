/*
  Warnings:

  - Added the required column `bukuId` to the `Peminjaman` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `peminjaman` ADD COLUMN `bukuId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Peminjaman` ADD CONSTRAINT `Peminjaman_bukuId_fkey` FOREIGN KEY (`bukuId`) REFERENCES `Buku`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
