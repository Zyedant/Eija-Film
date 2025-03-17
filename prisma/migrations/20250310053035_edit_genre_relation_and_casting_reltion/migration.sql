-- AlterTable
ALTER TABLE `castingrelation` MODIFY `castingData` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `CastingRelation` ADD CONSTRAINT `CastingRelation_castingData_fkey` FOREIGN KEY (`castingData`) REFERENCES `Casting`(`id_casting`) ON DELETE RESTRICT ON UPDATE CASCADE;
