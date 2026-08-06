-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('SYSTEM_CREATED', 'SYSTEM_REACTIVATED', 'SYSTEM_STATUS_CHANGE', 'USER_NOTE');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "lastContactSource" TEXT;

-- AlterTable
ALTER TABLE "LeadComment" ADD COLUMN     "type" "CommentType" NOT NULL DEFAULT 'USER_NOTE';
