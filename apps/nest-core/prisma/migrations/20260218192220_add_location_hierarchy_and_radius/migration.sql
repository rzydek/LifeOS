-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "SearchConfig" ADD COLUMN     "radius" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
