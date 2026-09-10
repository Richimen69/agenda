-- AlterEnum
ALTER TYPE "ModuleRole" ADD VALUE 'DIRECCION';

-- AlterTable
ALTER TABLE "SupportTicket" ADD COLUMN     "caseType" TEXT NOT NULL DEFAULT 'INCIDENTE',
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'PORTAL';

-- CreateTable
CREATE TABLE "SupportCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "defaultTechId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupportCategory_name_key" ON "SupportCategory"("name");

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SupportCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportCategory" ADD CONSTRAINT "SupportCategory_defaultTechId_fkey" FOREIGN KEY ("defaultTechId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
