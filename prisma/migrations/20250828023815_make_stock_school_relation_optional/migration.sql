/*
  Warnings:

  - You are about to drop the `BacklogEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."BacklogEntry" DROP CONSTRAINT "BacklogEntry_bookId_fkey";

-- DropTable
DROP TABLE "public"."BacklogEntry";
