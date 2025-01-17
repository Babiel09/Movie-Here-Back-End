/*
  Warnings:

  - A unique constraint covering the columns `[realId]` on the table `Movies` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Movies_realId_key" ON "Movies"("realId");
