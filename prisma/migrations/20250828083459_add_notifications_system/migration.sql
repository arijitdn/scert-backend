-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('STOCK_ARRIVAL', 'REQUISITION_STATUS', 'SYSTEM_UPDATE', 'URGENT_NOTICE', 'INFO', 'WARNING', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL DEFAULT 'INFO',
    "priority" "public"."NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "sentBy" TEXT NOT NULL,
    "sentFrom" "public"."ProfileType" NOT NULL,
    "targetSchools" BOOLEAN NOT NULL DEFAULT false,
    "targetBlocks" BOOLEAN NOT NULL DEFAULT false,
    "targetDistricts" BOOLEAN NOT NULL DEFAULT false,
    "targetStates" BOOLEAN NOT NULL DEFAULT false,
    "specificSchoolIds" TEXT[],
    "specificBlockCodes" INTEGER[],
    "specificDistrictCodes" INTEGER[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationRead" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userLevel" "public"."ProfileType" NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_notificationId_key" ON "public"."Notification"("notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationRead_notificationId_userId_key" ON "public"."NotificationRead"("notificationId", "userId");

-- AddForeignKey
ALTER TABLE "public"."NotificationRead" ADD CONSTRAINT "NotificationRead_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "public"."Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
