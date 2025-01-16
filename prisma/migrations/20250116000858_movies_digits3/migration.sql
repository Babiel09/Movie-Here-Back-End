/*
  Warnings:

  - You are about to drop the `Digitis` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Digitis" DROP CONSTRAINT "Digitis_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "digits" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- DropTable
DROP TABLE "Digitis";
