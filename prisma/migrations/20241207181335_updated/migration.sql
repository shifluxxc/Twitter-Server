/*
  Warnings:

  - You are about to drop the column `profiteImageURL` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "profiteImageURL",
ADD COLUMN     "profileImageURL" TEXT;
