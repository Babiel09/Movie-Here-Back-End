/*
  Warnings:

  - You are about to drop the `Digitis` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `movieId` to the `Comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movieId` to the `UpVotes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Digitis" DROP CONSTRAINT "Digitis_userId_fkey";

-- AlterTable
ALTER TABLE "Comments" ADD COLUMN     "movieId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UpVotes" ADD COLUMN     "movieId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "digits" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- DropTable
DROP TABLE "Digitis";

-- CreateTable
CREATE TABLE "Movies" (
    "realId" SERIAL NOT NULL,

    CONSTRAINT "Movies_pkey" PRIMARY KEY ("realId")
);

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies"("realId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpVotes" ADD CONSTRAINT "UpVotes_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies"("realId") ON DELETE RESTRICT ON UPDATE CASCADE;
