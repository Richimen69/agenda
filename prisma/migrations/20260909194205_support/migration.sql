-- DropIndex
DROP INDEX "SupportCategory_name_key";

-- AlterTable
ALTER TABLE "SupportCategory" ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "SupportCategory" ADD CONSTRAINT "SupportCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "SupportCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
