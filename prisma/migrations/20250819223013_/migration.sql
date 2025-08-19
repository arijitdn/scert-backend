/*
  Warnings:

  - The values [GOMANI] on the enum `District` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."District_new" AS ENUM ('DHALAI', 'GOMATI', 'KHOWAI', 'NORTH_TRIPURA', 'SEPAHIJALA', 'SOUTH_TRIPURA', 'UNAKOTI', 'WEST_TRIPURA');
ALTER TABLE "public"."Block" ALTER COLUMN "district" TYPE "public"."District_new" USING ("district"::text::"public"."District_new");
ALTER TYPE "public"."District" RENAME TO "District_old";
ALTER TYPE "public"."District_new" RENAME TO "District";
DROP TYPE "public"."District_old";
COMMIT;
