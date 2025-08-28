-- CreateEnum
CREATE TYPE "public"."IssuePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."IssueStatus" AS ENUM ('PENDING_BLOCK_REVIEW', 'PENDING_DISTRICT_REVIEW', 'PENDING_STATE_REVIEW', 'RESOLVED', 'REJECTED_BY_BLOCK', 'REJECTED_BY_DISTRICT', 'REJECTED_BY_STATE');

-- CreateTable
CREATE TABLE "public"."Issue" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "public"."IssuePriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "public"."IssueStatus" NOT NULL DEFAULT 'PENDING_BLOCK_REVIEW',
    "schoolId" TEXT NOT NULL,
    "raisedBy" TEXT NOT NULL,
    "currentLevel" "public"."ProfileType" NOT NULL DEFAULT 'BLOCK',
    "remarksByBlock" TEXT,
    "remarksByDistrict" TEXT,
    "remarksByState" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedByBlockAt" TIMESTAMP(3),
    "reviewedByDistrictAt" TIMESTAMP(3),
    "reviewedByStateAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Issue_issueId_key" ON "public"."Issue"("issueId");

-- AddForeignKey
ALTER TABLE "public"."Issue" ADD CONSTRAINT "Issue_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
