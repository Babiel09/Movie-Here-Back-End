/*
  Warnings:

  - The primary key for the `Movies` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_movieId_fkey";

-- DropForeignKey
ALTER TABLE "UpVotes" DROP CONSTRAINT "UpVotes_movieId_fkey";

-- AlterTable
ALTER TABLE "Movies" DROP CONSTRAINT "Movies_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "realId" DROP DEFAULT,
ADD CONSTRAINT "Movies_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Movies_realId_seq";

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpVotes" ADD CONSTRAINT "UpVotes_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
