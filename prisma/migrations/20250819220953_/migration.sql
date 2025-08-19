-- CreateEnum
CREATE TYPE "public"."District" AS ENUM ('DHALAI', 'GOMANI', 'KHOWAI', 'NORTH_TRIPURA', 'SEPAHIJALA', 'SOUTH_TRIPURA', 'UNAKOTI', 'WEST_TRIPURA');

-- CreateTable
CREATE TABLE "public"."Block" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "district" "public"."District" NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Block_code_key" ON "public"."Block"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Block_phone_key" ON "public"."Block"("phone");

-- AddForeignKey
ALTER TABLE "public"."School" ADD CONSTRAINT "School_block_code_fkey" FOREIGN KEY ("block_code") REFERENCES "public"."Block"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
