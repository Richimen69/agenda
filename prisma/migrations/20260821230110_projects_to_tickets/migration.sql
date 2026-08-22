/*
  Warnings:

  - You are about to drop the column `denominatorName` on the `ProjectRatio` table. All the data in the column will be lost.
  - You are about to drop the column `numeratorName` on the `ProjectRatio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProjectRatio" DROP COLUMN "denominatorName",
DROP COLUMN "numeratorName",
ADD COLUMN     "denominatorNames" TEXT[],
ADD COLUMN     "numeratorNames" TEXT[];
