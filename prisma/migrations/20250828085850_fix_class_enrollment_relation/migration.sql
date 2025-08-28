-- DropForeignKey
ALTER TABLE "public"."ClassEnrollment" DROP CONSTRAINT "ClassEnrollment_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."ClassEnrollment" ADD CONSTRAINT "ClassEnrollment_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
