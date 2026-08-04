-- CreateEnum
CREATE TYPE "ModuleRole" AS ENUM ('LEADS_ADMIN', 'LEADS_AUX', 'LEADS_RESPONSABLE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "moduleRoles" "ModuleRole"[];

-- CreateIndex
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");
