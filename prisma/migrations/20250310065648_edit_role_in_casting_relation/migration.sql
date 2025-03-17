/*
  Warnings:

  - You are about to drop the column `castingData` on the `castingrelation` table. All the data in the column will be lost.
  - Added the required column `castingId` to the `CastingRelation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `CastingRelation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `castingrelation` DROP FOREIGN KEY `CastingRelation_castingData_fkey`;

-- DropIndex
DROP INDEX `CastingRelation_castingData_fkey` ON `castingrelation`;

-- AlterTable
ALTER TABLE `castingrelation` DROP COLUMN `castingData`,
    ADD COLUMN `castingId` VARCHAR(191) NOT NULL,
    ADD COLUMN `role` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `CastingRelation` ADD CONSTRAINT `CastingRelation_castingId_fkey` FOREIGN KEY (`castingId`) REFERENCES `Casting`(`id_casting`) ON DELETE RESTRICT ON UPDATE CASCADE;
