/*
  Warnings:

  - You are about to drop the column `denominatorKpiId` on the `ProjectRatio` table. All the data in the column will be lost.
  - You are about to drop the column `numeratorKpiId` on the `ProjectRatio` table. All the data in the column will be lost.
  - Added the required column `denominatorName` to the `ProjectRatio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeratorName` to the `ProjectRatio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectRatio" DROP COLUMN "denominatorKpiId",
DROP COLUMN "numeratorKpiId",
ADD COLUMN     "denominatorName" TEXT NOT NULL,
ADD COLUMN     "numeratorName" TEXT NOT NULL;
