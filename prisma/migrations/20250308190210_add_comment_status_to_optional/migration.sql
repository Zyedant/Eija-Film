-- AlterTable
ALTER TABLE `comment` MODIFY `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NULL;
