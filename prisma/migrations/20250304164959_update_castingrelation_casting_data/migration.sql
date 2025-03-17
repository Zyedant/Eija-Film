/*
  Warnings:

  - You are about to drop the column `castingId` on the `castingrelation` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `castingrelation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `castingrelation` DROP FOREIGN KEY `CastingRelation_castingId_fkey`;

-- DropIndex
DROP INDEX `CastingRelation_castingId_fkey` ON `castingrelation`;

-- AlterTable
ALTER TABLE `castingrelation` DROP COLUMN `castingId`,
    DROP COLUMN `role`,
    ADD COLUMN `castingData` JSON NOT NULL;
