-- AlterTable
ALTER TABLE `genrerelation` MODIFY `genreId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `GenreRelation` ADD CONSTRAINT `GenreRelation_genreId_fkey` FOREIGN KEY (`genreId`) REFERENCES `Genre`(`id_genre`) ON DELETE RESTRICT ON UPDATE CASCADE;
