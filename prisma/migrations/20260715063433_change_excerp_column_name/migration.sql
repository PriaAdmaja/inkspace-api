/*
  Warnings:

  - You are about to drop the column `excerp` on the `Post` table. All the data in the column will be lost.
  - Added the required column `excerpt` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" 
RENAME COLUMN "excerp" TO "excerpt";
