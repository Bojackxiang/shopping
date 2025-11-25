/*
  Warnings:

  - You are about to drop the column `removable` on the `categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "removable",
ADD COLUMN     "isProtected" BOOLEAN NOT NULL DEFAULT true;
