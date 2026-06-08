/*
  Warnings:

  - Added the required column `excerp` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `content` on the `Post` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "excerp" TEXT NOT NULL,
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;
