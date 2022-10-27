/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Identity` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Identity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Identity` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Identity_email_key` ON `Identity`(`email`);
