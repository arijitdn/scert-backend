-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."RequisitionStatus" ADD VALUE 'PENDING_BLOCK_APPROVAL';
ALTER TYPE "public"."RequisitionStatus" ADD VALUE 'PENDING_DISTRICT_APPROVAL';
ALTER TYPE "public"."RequisitionStatus" ADD VALUE 'PENDING_STATE_APPROVAL';
ALTER TYPE "public"."RequisitionStatus" ADD VALUE 'REJECTED_BY_BLOCK';
ALTER TYPE "public"."RequisitionStatus" ADD VALUE 'REJECTED_BY_DISTRICT';
ALTER TYPE "public"."RequisitionStatus" ADD VALUE 'REJECTED_BY_STATE';
