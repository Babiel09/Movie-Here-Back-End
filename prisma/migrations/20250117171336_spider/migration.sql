/*
  Warnings:

  - You are about to drop the column `comments` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `votes` on the `User` table. All the data in the column will be lost.
  - Added the required column `comment` to the `Comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vote` to the `UpVotes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comments" ADD COLUMN     "comment" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UpVotes" ADD COLUMN     "vote" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "comments",
DROP COLUMN "votes";
