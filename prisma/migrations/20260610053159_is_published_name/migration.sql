/*
  Warnings:

  - You are about to drop the column `isPublised` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "isPublised",
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false;
