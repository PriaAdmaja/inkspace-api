/*
  Warnings:

  - Added the required column `lookupId` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "lookupId" TEXT NOT NULL;
