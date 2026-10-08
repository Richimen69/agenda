/*
  Warnings:

  - You are about to drop the column `areaId` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `areaId` on the `DocumentCategory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_areaId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentCategory" DROP CONSTRAINT "DocumentCategory_areaId_fkey";

-- DropIndex
DROP INDEX "Document_areaId_idx";

-- DropIndex
DROP INDEX "DocumentCategory_name_areaId_key";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "areaId";

-- AlterTable
ALTER TABLE "DocumentCategory" DROP COLUMN "areaId",
ADD COLUMN     "parentId" TEXT,
ALTER COLUMN "icon" SET DEFAULT 'Folder';

-- AddForeignKey
ALTER TABLE "DocumentCategory" ADD CONSTRAINT "DocumentCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DocumentCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
