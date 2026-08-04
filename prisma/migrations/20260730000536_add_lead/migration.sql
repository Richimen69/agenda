/*
  Warnings:

  - The `branch` column on the `Lead` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Branch" AS ENUM ('GUERRERO', 'CHILPANCINGO', 'DIGITAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Department" ADD VALUE 'REFACCIONES';
ALTER TYPE "Department" ADD VALUE 'DIGITAL';

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "branch",
ADD COLUMN     "branch" "Branch" NOT NULL DEFAULT 'GUERRERO';
