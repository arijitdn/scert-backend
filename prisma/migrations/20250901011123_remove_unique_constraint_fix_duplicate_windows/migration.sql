/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `RequisitionWindow` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."RequisitionWindow_type_isActive_key";

-- CreateIndex
CREATE UNIQUE INDEX "RequisitionWindow_type_key" ON "public"."RequisitionWindow"("type");
