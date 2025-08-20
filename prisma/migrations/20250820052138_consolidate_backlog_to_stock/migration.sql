/*
  Warnings:

  - You are about to drop the `BacklogEntry` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[bookId,type,userId,status]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."StockStatus" AS ENUM ('STOCK', 'BACKLOG', 'DISTRIBUTED', 'PENDING', 'TRANSFERRED');

-- DropForeignKey
ALTER TABLE "public"."BacklogEntry" DROP CONSTRAINT "BacklogEntry_bookId_fkey";

-- AlterTable
ALTER TABLE "public"."Stock" ADD COLUMN     "received" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "status" "public"."StockStatus" NOT NULL DEFAULT 'STOCK';

-- DropTable
DROP TABLE "public"."BacklogEntry";

-- CreateIndex
CREATE UNIQUE INDEX "Stock_bookId_type_userId_status_key" ON "public"."Stock"("bookId", "type", "userId", "status");
