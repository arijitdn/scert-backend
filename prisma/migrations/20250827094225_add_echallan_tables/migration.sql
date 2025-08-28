-- CreateEnum
CREATE TYPE "public"."DestinationType" AS ENUM ('DISTRICT', 'IS');

-- CreateEnum
CREATE TYPE "public"."EChallanStatus" AS ENUM ('GENERATED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."EChallan" (
    "id" TEXT NOT NULL,
    "challanId" TEXT NOT NULL,
    "challanNo" TEXT NOT NULL,
    "destinationType" "public"."DestinationType" NOT NULL,
    "destinationName" TEXT NOT NULL,
    "destinationId" TEXT,
    "requisitionId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "vehicleNo" TEXT,
    "agency" TEXT,
    "totalBooks" INTEGER NOT NULL DEFAULT 0,
    "totalBoxes" INTEGER NOT NULL DEFAULT 0,
    "totalPackets" INTEGER NOT NULL DEFAULT 0,
    "totalLooseBoxes" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."EChallanStatus" NOT NULL DEFAULT 'GENERATED',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EChallan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EChallanBook" (
    "id" TEXT NOT NULL,
    "eChallanId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bookName" TEXT NOT NULL,
    "noOfBoxes" INTEGER NOT NULL DEFAULT 0,
    "noOfPackets" INTEGER NOT NULL DEFAULT 0,
    "noOfLooseBoxes" INTEGER NOT NULL DEFAULT 0,
    "totalQuantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EChallanBook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EChallan_challanId_key" ON "public"."EChallan"("challanId");

-- AddForeignKey
ALTER TABLE "public"."EChallanBook" ADD CONSTRAINT "EChallanBook_eChallanId_fkey" FOREIGN KEY ("eChallanId") REFERENCES "public"."EChallan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EChallanBook" ADD CONSTRAINT "EChallanBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
