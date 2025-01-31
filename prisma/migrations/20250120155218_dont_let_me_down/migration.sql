/*
  Warnings:

  - Made the column `avarage` on table `Movies` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Movies" ALTER COLUMN "avarage" SET NOT NULL,
ALTER COLUMN "avarage" SET DEFAULT 0.0;
