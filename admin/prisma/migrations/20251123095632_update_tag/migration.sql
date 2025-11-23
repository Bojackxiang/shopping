/*
  Warnings:

  - Made the column `slug` on table `tags` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tags" ALTER COLUMN "slug" SET NOT NULL;
