-- AlterTable
ALTER TABLE "Requisition" ADD COLUMN     "approvedByBlockAt" TIMESTAMP(3),
ADD COLUMN     "approvedByDistrictAt" TIMESTAMP(3),
ADD COLUMN     "approvedByStateAt" TIMESTAMP(3),
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "remarksByState" TEXT;

-- AlterEnum
ALTER TYPE "RequisitionStatus" RENAME TO "RequisitionStatus_old";
CREATE TYPE "RequisitionStatus" AS ENUM ('PENDING_BLOCK_APPROVAL', 'PENDING_DISTRICT_APPROVAL', 'PENDING_STATE_APPROVAL', 'APPROVED', 'COMPLETED', 'REJECTED_BY_BLOCK', 'REJECTED_BY_DISTRICT', 'REJECTED_BY_STATE');
ALTER TABLE "Requisition" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Requisition" ALTER COLUMN "status" TYPE "RequisitionStatus" USING ("status"::text::"RequisitionStatus");
ALTER TABLE "Requisition" ALTER COLUMN "status" SET DEFAULT 'PENDING_BLOCK_APPROVAL';
DROP TYPE "RequisitionStatus_old";
