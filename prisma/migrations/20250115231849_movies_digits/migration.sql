-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twoStetps" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Digitis" (
    "id" SERIAL NOT NULL,
    "digit" TEXT NOT NULL,

    CONSTRAINT "Digitis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movies" (
    "realId" INTEGER NOT NULL,
    "comments" TEXT NOT NULL,
    "upVote" INTEGER NOT NULL,
    "avaliation" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Movies_realId_key" ON "Movies"("realId");
