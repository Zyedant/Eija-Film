/*
  Warnings:

  - You are about to drop the column `stageName` on the `castingrelation` table. All the data in the column will be lost.
  - Added the required column `role` to the `CastingRelation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `casting` ADD COLUMN `stageName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `castingrelation` DROP COLUMN `stageName`,
    ADD COLUMN `role` VARCHAR(191) NOT NULL;
