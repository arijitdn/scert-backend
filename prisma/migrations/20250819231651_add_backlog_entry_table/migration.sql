-- CreateTable
CREATE TABLE "public"."BacklogEntry" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "type" "public"."ProfileType" NOT NULL,
    "userId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BacklogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BacklogEntry_bookId_type_userId_key" ON "public"."BacklogEntry"("bookId", "type", "userId");

-- AddForeignKey
ALTER TABLE "public"."BacklogEntry" ADD CONSTRAINT "BacklogEntry_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
