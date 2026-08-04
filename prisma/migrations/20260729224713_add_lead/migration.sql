-- CreateEnum
CREATE TYPE "CaptureViewType" AS ENUM ('ALL', 'NS');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "captureView" "CaptureViewType" NOT NULL DEFAULT 'ALL';
